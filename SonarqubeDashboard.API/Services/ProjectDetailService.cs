using Humanizer;
using Humanizer.Localisation;
using SonarqubeDashboard.API.Helpers.Constants;
using SonarqubeDashboard.API.Interfaces;
using SonarqubeDashboard.API.Models;

namespace SonarqubeDashboard.API.Services
{
    /// <summary>
    /// Service for retrieving detailed information about a project.
    /// </summary>
    public class ProjectDetailService : IProjectDetailService
    {
        private readonly IProjectService _projectService;
        private readonly ISonarqubeQualityGateSerivce _sonarqubeQualityGateService;
        private readonly ISonarqubeMeasuresService _sonarqubeMeasuresService;
        private readonly ISonarqubeProjectAnalyses _sonarqubeProjectAnalyses;
        private readonly ILogger<ProjectDetailService> _logger;

        /// <summary>
        /// Initializes a new instance of the <see cref="ProjectDetailService"/> class.
        /// </summary>
        /// <param name="projectService">The project service.</param>
        /// <param name="sonarqubeQualityGateSerivce">The SonarQube quality gate service.</param>
        /// <param name="sonarqubeMeasuresService">The SonarQube measures service.</param>
        /// <param name="sonarqubeProjectAnalyses">The SonarQube project analyses service.</param>
        /// <param name="logger">The logger instance.</param>
        public ProjectDetailService(
            IProjectService projectService,
            ISonarqubeQualityGateSerivce sonarqubeQualityGateSerivce,
            ISonarqubeMeasuresService sonarqubeMeasuresService,
            ISonarqubeProjectAnalyses sonarqubeProjectAnalyses,
            ILogger<ProjectDetailService> logger)
        {
            _projectService = projectService;
            _sonarqubeQualityGateService = sonarqubeQualityGateSerivce;
            _sonarqubeMeasuresService = sonarqubeMeasuresService;
            _sonarqubeProjectAnalyses = sonarqubeProjectAnalyses;
            _logger = logger;
        }

        /// <summary>
        /// Retrieves detailed information about a specific project.
        /// </summary>
        /// <param name="projectKey">The key of the project.</param>
        /// <returns>A <see cref="ProjectDetails"/> object containing project information.</returns>
        public async Task<ProjectDetails> GetProjectDetail(string projectKey)
        {
            try
            {
                var projects = await _projectService.GetProjectsAsync();
                var project = projects.Find(p => p.Key == projectKey);
                var metricDefinitions = await _projectService.GetProjectRatingDescription();

                if (project is null)
                {
                    _logger.LogWarning("Project with key '{ProjectKey}' not found.", projectKey);
                    return null;
                }

                var metrics = project.Metrics.ToDictionary(m => m.Name, m => m.Value);
                var metricDefs = metricDefinitions.ToDictionary(md => md.Code);

                var componentMeasures = await _sonarqubeMeasuresService.GetComponentMeasures(projectKey, string.Join(",", MetricsKeys.AllMetricKeys));

                if (componentMeasures?.Component == null)
                {
                    _logger.LogWarning("Component measures for project '{ProjectKey}' not found.", projectKey);
                    return null;
                }

                var result = new ProjectDetails
                {
                    ProjectKey = project.Key,
                    ProjectName = project.Name.Humanize(LetterCasing.Title),
                    ProjectGroup = project.Group,
                    Period = new()
                    {
                        NewCodeBaseLine = componentMeasures.Period.Date != null
                            ? GetHumanizeNewCodeBaseLine(componentMeasures.Period.Date)
                            : null,
                        LastAnalysis = await GetHumanizeLastAnalysisDate(projectKey)
                    },
                    QualityGate = await GetQualityGate(projectKey, project),
                    NewCodeMetrics = MapMeasures<NewCodeProjectMeasures>(componentMeasures.Component.Measures, metricDefs, isNewCode: true),
                    OverallCodeMetrics = MapMeasures<OverallCodeProjectMeasures>(componentMeasures.Component.Measures, metricDefs, isNewCode: false)
                };

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while getting project details for '{ProjectKey}'.", projectKey);
                throw;
            }
        }

        /// <summary>
        /// Converts a period date string into a human-readable new code baseline.
        /// </summary>
        /// <param name="periodDate">The period date as a string.</param>
        /// <returns>A <see cref="NewCodeBaseLine"/> object with humanized date information.</returns>
        private NewCodeBaseLine GetHumanizeNewCodeBaseLine(string periodDate)
        {
            if (string.IsNullOrEmpty(periodDate))
            {
                return null;
            }

            try
            {
                var date = DateTime.Parse(periodDate);
                var timeDifference = DateTime.Now - date;
                string humanizeResult = timeDifference.Humanize(maxUnit: TimeUnit.Year, precision: 2);
                var result = new NewCodeBaseLine
                {
                    HumanizeDate = $"Started {humanizeResult} ago",
                    Date = $"Since {date.ToLongDateString()}"
                };
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while parsing period date '{PeriodDate}'.", periodDate);
                return null;
            }
        }

        /// <summary>
        /// Retrieves and humanizes the last analysis date for a project.
        /// </summary>
        /// <param name="projectKey">The key of the project.</param>
        /// <returns>A human-readable string representing the time since the last analysis.</returns>
        private async Task<string> GetHumanizeLastAnalysisDate(string projectKey)
        {
            try
            {
                var periodDate = await _sonarqubeProjectAnalyses.GetLastAnalysisDateTime(projectKey);
                if (periodDate == null)
                {
                    _logger.LogWarning("Last analysis date for project '{ProjectKey}' not found.", projectKey);
                    return null;
                }

                var date = periodDate.Value;
                var timeDifference = DateTime.Now - date;
                string humanizeResult = timeDifference.Humanize(maxUnit: TimeUnit.Year, precision: 1);
                return $"{humanizeResult} ago";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while getting last analysis date for '{ProjectKey}'.", projectKey);
                return null;
            }
        }

        /// <summary>
        /// Retrieves the quality gate status and failed conditions for a project.
        /// </summary>
        /// <param name="projectKey">The key of the project.</param>
        /// <param name="project">The project object.</param>
        /// <returns>A <see cref="ProjectQualityGate"/> object containing quality gate information.</returns>
        private async Task<ProjectQualityGate> GetQualityGate(string projectKey, Project project)
        {
            try
            {
                var qualityGateStatus = project.Metrics.Find(m => m.Name == "alert_status")?.Value;
                var qualityGateConditions = await _sonarqubeQualityGateService.GetQualityGateFailedConditions(projectKey);

                return new ProjectQualityGate
                {
                    QualityGateStatus = qualityGateStatus,
                    QualityGateConditions = qualityGateConditions
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while getting quality gate for '{ProjectKey}'.", projectKey);
                return null;
            }
        }

        /// <summary>
        /// Maps SonarQube measures to project measures.
        /// </summary>
        /// <typeparam name="T">The type of project measures.</typeparam>
        /// <param name="measures">The list of measures.</param>
        /// <param name="metricDefinitions">The metric definitions.</param>
        /// <param name="isNewCode">Indicates if the measures are for new code.</param>
        /// <returns>An instance of <typeparamref name="T"/> containing mapped measures.</returns>
        private T MapMeasures<T>(List<Measure> measures, Dictionary<string, MetricDefinition> metricDefinitions, bool isNewCode) where T : ProjectMeasures, new()
        {
            try
            {
                var projectMeasures = new T();
                var prefix = isNewCode ? "new_" : "";

                // Mapping Bugs
                var bugsMetric = measures.FirstOrDefault(m => m.Metric == $"{prefix}bugs");
                var bugsRatingMetric = measures.FirstOrDefault(m => m.Metric == $"{prefix}reliability_rating");
                projectMeasures.Bugs = CreateProjectMetric<ProjectBug>(
                    bugsMetric,
                    bugsRatingMetric,
                    metricDefinitions);

                // Mapping Vulnerabilities
                var vulnerabilitiesMetric = measures.FirstOrDefault(m => m.Metric == $"{prefix}vulnerabilities");
                var vulnerabilitiesRatingMetric = measures.FirstOrDefault(m => m.Metric == $"{prefix}security_rating");
                projectMeasures.Vulnerabilities = CreateProjectMetric<ProjectVulnerability>(
                    vulnerabilitiesMetric,
                    vulnerabilitiesRatingMetric,
                    metricDefinitions);

                // Mapping Security Hotspots
                var securityHotspotsMetric = measures.FirstOrDefault(m => m.Metric == $"{prefix}security_hotspots");
                var securityHotspotsRatingMetric = measures.FirstOrDefault(m => m.Metric == $"{prefix}security_review_rating");
                projectMeasures.SecurityHotspots = CreateProjectMetric<ProjectSecurityHotspot>(
                    securityHotspotsMetric,
                    securityHotspotsRatingMetric,
                    metricDefinitions);

                // Mapping Code Smells
                var codeSmellsMetric = measures.FirstOrDefault(m => m.Metric == $"{prefix}code_smells");
                var codeSmellsRatingMetric = isNewCode
                    ? measures.FirstOrDefault(m => m.Metric == $"{prefix}maintainability_rating")
                    : measures.FirstOrDefault(m => m.Metric == "sqale_rating");
                projectMeasures.CodeSmells = CreateProjectMetric<ProjectCodeSmell>(
                    codeSmellsMetric,
                    codeSmellsRatingMetric,
                    metricDefinitions);

                // Common metrics
                projectMeasures.Coverage = GetValue(measures, $"{prefix}coverage");
                projectMeasures.DuplicatedLinesDensity = FormatDecimal(GetValue(measures, $"{prefix}duplicated_lines_density"));
                projectMeasures.Ncloc = GetValue(measures, $"ncloc");

                // Specific metrics
                // Set specific metrics for lines and lines to cover
                SetLinesMetrics(projectMeasures, measures);

                return projectMeasures;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while mapping measures for isNewCode='{IsNewCode}'.", isNewCode);
                return null;
            }
        }

        /// <summary>
        /// Creates a project metric object.
        /// </summary>
        /// <typeparam name="T">The type of project metric.</typeparam>
        /// <param name="countMeasure">The count measure.</param>
        /// <param name="ratingMeasure">The rating measure.</param>
        /// <param name="metricDefinitions">The metric definitions.</param>
        /// <returns>An instance of <typeparamref name="T"/>.</returns>
        private T CreateProjectMetric<T>(Measure countMeasure, Measure ratingMeasure, Dictionary<string, MetricDefinition> metricDefinitions) where T : ProjectMetricBase, new()
        {
            try
            {
                var ratingCode = ratingMeasure?.Metric;

                if (ratingCode == "new_maintainability_rating")
                {
                    ratingCode = "sqale_rating";
                }

                var ratingValue = GetValueFromMeasure(ratingMeasure);

                return new T
                {
                    Count = GetValueFromMeasure(countMeasure),
                    Rating = new Rating
                    {
                        RatingValue = ratingValue,
                        RatingDescription = GetRatingDescription(ratingCode, ratingValue, metricDefinitions)
                    }
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while creating project metric.");
                return null;
            }
        }

        /// <summary>
        /// Retrieves the value of a specific metric.
        /// </summary>
        /// <param name="measures">The list of measures.</param>
        /// <param name="metricName">The name of the metric.</param>
        /// <returns>The value of the metric as a string.</returns>
        private string GetValue(List<Measure> measures, string metricName)
        {
            try
            {
                var measure = measures.FirstOrDefault(m => m.Metric.Equals(metricName, StringComparison.OrdinalIgnoreCase));
                return GetValueFromMeasure(measure);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while getting value for metric '{MetricName}'.", metricName);
                return null;
            }
        }

        /// <summary>
        /// Extracts the value from a measure.
        /// </summary>
        /// <param name="measure">The measure object.</param>
        /// <returns>The value as a string.</returns>
        private string GetValueFromMeasure(Measure measure)
        {
            return measure?.Value ?? measure?.Period?.Value;
        }

        /// <summary>
        /// Retrieves the rating description based on code and value.
        /// </summary>
        /// <param name="ratingCode">The rating code.</param>
        /// <param name="ratingValue">The rating value.</param>
        /// <param name="metricDefinitions">The metric definitions.</param>
        /// <returns>The rating description.</returns>
        private string GetRatingDescription(string ratingCode, string ratingValue, Dictionary<string, MetricDefinition> metricDefinitions)
        {
            if (string.IsNullOrEmpty(ratingCode) || string.IsNullOrEmpty(ratingValue))
            {
                return string.Empty;
            }

            try
            {
                // Remove 'new_' prefix if present
                string baseRatingCode = ratingCode.StartsWith("new_") ? ratingCode.Substring(4) : ratingCode;

                if (metricDefinitions.TryGetValue(baseRatingCode, out var metric) && metric.Ranks != null)
                {
                    var rank = metric.Ranks.Find(r => r.Rank == ratingValue);
                    if (rank != null)
                    {
                        return rank.Description;
                    }
                }

                return string.Empty;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while getting rating description for code '{RatingCode}' and value '{RatingValue}'.", ratingCode, ratingValue);
                return string.Empty;
            }
        }

        /// <summary>
        /// Formats a number string to a readable format (e.g., "1000" to "1k").
        /// </summary>
        /// <param name="numberString">The number as a string.</param>
        /// <returns>The formatted number string.</returns>
        private string FormatNumber(string numberString)
        {
            try
            {
                if (double.TryParse(numberString, out double number))
                {
                    if (number >= 1000)
                    {
                        number = Math.Round(number / 1000, 1);
                        return $"{number}k";
                    }
                    else
                    {
                        return number.ToString();
                    }
                }
                return numberString;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while formatting number '{NumberString}'.", numberString);
                return numberString;
            }
        }

        private string FormatDecimal(string numberString)
        {
            try
            {
                if (decimal.TryParse(numberString, out decimal number))
                {
                    if (number >= 0)
                    {
                        number = Math.Round(number, 1, MidpointRounding.AwayFromZero);
                        return $"{number}";
                    }
                    else
                    {
                        return number.ToString();
                    }
                }
                return numberString;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while rounding up number '{NumberString}'.", numberString);
                return numberString;
            }
        }

        /// <summary>
        /// Sets line metrics for the project measures.
        /// </summary>
        /// <param name="projectMeasures">The project measures object.</param>
        /// <param name="measures">The list of measures.</param>
        /// 
        private void SetLinesMetrics(ProjectMeasures projectMeasures, List<Measure> measures)
        {
            try
            {
                if (projectMeasures is NewCodeProjectMeasures newCodeMeasures)
                {
                    newCodeMeasures.NewLines = FormatNumber(GetValue(measures, MetricsKeys.NewLines));
                    newCodeMeasures.NewLinesToCover = FormatNumber(GetValue(measures, MetricsKeys.NewLinesToCover));
                }
                else if (projectMeasures is OverallCodeProjectMeasures overallMeasures)
                {
                    overallMeasures.Lines = FormatNumber(GetValue(measures, MetricsKeys.Ncloc));
                    overallMeasures.LinesToCover = FormatNumber(GetValue(measures, MetricsKeys.LinesToCover)); ;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while setting lines metrics.");
            }
        }
    }
}