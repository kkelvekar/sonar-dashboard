using Humanizer;
using Humanizer.Localisation;
using SonarqubeDashboard.API.Helpers.Constants;
using SonarqubeDashboard.API.Models;
using System.Reflection;
using System.Text.Json;
using static SonarqubeDashboard.API.Services.SonarqubeMeasuresService;

namespace SonarqubeDashboard.API.Services
{
    public class ProjectDetailService
    {
        private readonly ProjectDataService _projectDataService;
        private readonly SonarqubeQualityGateSerivce _sonarqubeQualityGateService;
        private readonly SonarqubeMeasuresService _sonarqubeMeasuresService;
        private readonly SonarqubeProjectAnalyses _sonarqubeProjectAnalyses;

        public ProjectDetailService(ProjectDataService projectDataService, SonarqubeQualityGateSerivce sonarqubeQualityGateSerivce, SonarqubeMeasuresService sonarqubeMeasuresService, SonarqubeProjectAnalyses sonarqubeProjectAnalyses)
        {
            _projectDataService = projectDataService;
            _sonarqubeQualityGateService = sonarqubeQualityGateSerivce;
            _sonarqubeMeasuresService = sonarqubeMeasuresService;
            _sonarqubeProjectAnalyses = sonarqubeProjectAnalyses;
        }

        public async Task<ProjectDetails> GetProjectDetails(string projectKey)
        {
            var projects = await _projectDataService.Projects;
            var project = projects.Find(p => p.ProjectKey == projectKey);
            var metricDefinitions = await _projectDataService.MetricDefinitions;

            if (project is null)
            {
                return null;
            }

            var metrics = project.Metrics.ToDictionary(m => m.Name, m => m.Value);
            var metricDefs = metricDefinitions.ToDictionary(md => md.Code);

            var componentMeasures = await _sonarqubeMeasuresService.GetComponentMeasures(projectKey, string.Join(",", MetricsKeys.AllMetricKeys));

            if (componentMeasures?.Component == null)
            {
                return null;
            }


            var result = new ProjectDetails
            {
                ProjectKey = project.ProjectKey,
                ProjectName = project.ProjectName,
                ProjectGroup = project.ProjectGroup,
                Period = new()
                {
                    NewCodeBaseLine = componentMeasures.Period.Date != null
                    ? GetHumanizeNewCodeBaseLine(componentMeasures.Period.Date) : null,
                    LastAnalysis = await GetHumanizeLastAnalysisDate(projectKey)
                },
                QualityGate = await GetQualityGate(projectKey, project),
                NewCodeMetrics = MapMeasures<NewCodeProjectMeasures>(componentMeasures.Component.Measures, metricDefs, isNewCode: true),
                OverallCodeMetrics = MapMeasures<OverallCodeProjectMeasures>(componentMeasures.Component.Measures, metricDefs, isNewCode: false)
            };

            return result;

        }

        private NewCodeBaseLine GetHumanizeNewCodeBaseLine(string periodDate)
        {
            if (string.IsNullOrEmpty(periodDate))
            {
                return null;
            }

            var date = DateTime.Parse(periodDate);
            var timeDifference = DateTime.Now - date;
            string humanizeResult = timeDifference.Humanize(maxUnit: TimeUnit.Year, precision: 2);
            var result =  new NewCodeBaseLine() { HumanizeDate = $"Started {humanizeResult} ago", Date = $"Since {date.ToLongDateString()}"};
            return result;
        }

        private async Task<string> GetHumanizeLastAnalysisDate(string projectKey)
        {
            var periodDate = await _sonarqubeProjectAnalyses.GetLastAnalysisDateTime(projectKey);
            if (periodDate == null)
            {
                return null;
            }

            var date = periodDate.Value;
            var timeDifference = DateTime.Now - date;
            string humanizeResult = timeDifference.Humanize(maxUnit: TimeUnit.Year, precision: 1);
            return $"{humanizeResult} ago";
        }

        private async Task<ProjectQualityGate> GetQualityGate(string projectKey, SonarqubeProject project)
        {
            var qualityGateStatus = project.Metrics.Find(m => m.Name == "alert_status")?.Value;
            var qualityGateConditions = await _sonarqubeQualityGateService.GetQualityGateFailedConditions(projectKey);

            return new ProjectQualityGate
            {
                QualityGateStatus = qualityGateStatus,
                QualityGateConditions = qualityGateConditions
            };
        }

        private T MapMeasures<T>(List<Measure> measures, Dictionary<string, MetricDefinition> metricDefinitions, bool isNewCode) where T : ProjectMeasures, new()
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
            projectMeasures.DuplicatedLinesDensity = GetValue(measures, $"{prefix}duplicated_lines_density");
            projectMeasures.Ncloc = GetValue(measures, $"ncloc");

            // Specific metrics
            // Set specific metrics for lines and lines to cover
            SetLinesMetrics(projectMeasures, measures, prefix);

            return projectMeasures;
        }
        private T CreateProjectMetric<T>(Measure countMeasure, Measure ratingMeasure, Dictionary<string, MetricDefinition> metricDefinitions) where T : ProjectMetricBase, new()
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

        private string GetValue(List<Measure> measures, string metricName)
        {
            var measure = measures.FirstOrDefault(m => m.Metric.Equals(metricName, StringComparison.OrdinalIgnoreCase));
            return GetValueFromMeasure(measure);
        }

        private string GetValueFromMeasure(Measure measure)
        {
            return measure?.Value ?? measure?.Period?.Value;
        }


        private string GetRatingDescription(string ratingCode, string ratingValue, Dictionary<string, MetricDefinition> metricDefinitions)
        {
            if (string.IsNullOrEmpty(ratingCode) || string.IsNullOrEmpty(ratingValue))
            {
                return string.Empty;
            }

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

        private string FormatNumber(string numberString)
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

        private void SetLinesMetrics(ProjectMeasures projectMeasures, List<Measure> measures, string prefix)
        {
            var linesMetric = $"{prefix}lines";
            var linesToCoverMetric = $"{prefix}lines_to_cover";

            var linesValue = FormatNumber(GetValue(measures, linesMetric));
            var linesToCoverValue = FormatNumber(GetValue(measures, linesToCoverMetric));

            if (projectMeasures is NewCodeProjectMeasures newCodeMeasures)
            {
                newCodeMeasures.NewLines = linesValue;
                newCodeMeasures.NewLinesToCover = linesToCoverValue;
            }
            else if (projectMeasures is OverallCodeProjectMeasures overallMeasures)
            {
                overallMeasures.Lines = linesValue;
                overallMeasures.LinesToCover = linesToCoverValue;
            }
        }

    }
}
