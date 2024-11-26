using SonarqubeDashboard.API.Models;
using System.Reflection;
using System.Text.Json;

namespace SonarqubeDashboard.API.Services
{
    public class ProjectDetailService
    {
        private readonly ProjectDataService _projectDataService;
        private readonly SonarqubeService _sonarqubeService;

        public ProjectDetailService(ProjectDataService projectDataService, SonarqubeService sonarqubeService)
        {
            _projectDataService = projectDataService;
            _sonarqubeService = sonarqubeService;
        }

        public async Task<ProjectDetails> GetProjectDetails(string projectKey)
        {
            var projects = await _projectDataService.Projects;
            var metricDefinitions = await _projectDataService.MetricDefinitions;
            var project = projects.Find(p => p.ProjectKey == projectKey);

            if (project is null)
            {
                return null;
            }

            var metrics = project.Metrics.ToDictionary(m => m.Name, m => m.Value);
            var metricDefs = metricDefinitions.ToDictionary(md => md.Code);

            var result = new ProjectDetails
            {
                ProjectKey = project.ProjectKey,
                ProjectName = project.ProjectName,
                ProjectGroup = project.ProjectGroup,
                QualityGate = await GetQualityGate(projectKey, project),
                Bugs = CreateProjectMetric<ProjectBug>("bugs", "reliability_rating", metrics, metricDefs),
                Vulnerabilities = CreateProjectMetric<ProjectVulnerability>("vulnerabilities", "security_rating", metrics, metricDefs),
                SecurityHotspots = await CreateSecurityReviewProjectMetric<ProjectSecurityHotspot>("security_hotspots", "security_review_rating", projectKey, metrics, metricDefs),
                CodeSmells = CreateProjectMetric<ProjectCodeSmell>("code_smells", "sqale_rating", metrics, metricDefs),
                Coverage = metrics.GetValueOrDefault("coverage"),
                DuplicatedLinesDensity = metrics.GetValueOrDefault("duplicated_lines_density"),
                Ncloc = metrics.GetValueOrDefault("ncloc")
            };

            return result;

        }

        private T CreateProjectMetric<T>(string countMetricName, string ratingCode, Dictionary<string, string> metrics, Dictionary<string, MetricDefinition> metricDefs) where T : ProjectMetricBase, new()
        {
            var countValue = metrics.GetValueOrDefault(countMetricName);
            var ratingValue = metrics.GetValueOrDefault(ratingCode);
            return new T
            {
                Count = countValue,
                Rating = new Rating
                {
                    RatingValue = ratingValue,
                    RatingDescription = GetRatingDescription(ratingCode, ratingValue, metricDefs)
                }
            };
        }

        private async Task<T> CreateSecurityReviewProjectMetric<T>(string countMetricName, string ratingCode, string projectKey, Dictionary<string, string> metrics, Dictionary<string, MetricDefinition> metricDefs) where T : ProjectMetricBase, new()
        {
            var countValue = metrics.GetValueOrDefault(countMetricName);
            var ratingValue = await _sonarqubeService.GetSecurityReviewRating(projectKey);
            return new T
            {
                Count = countValue,
                Rating = new Rating
                {
                    RatingValue = ratingValue,
                    RatingDescription = GetRatingDescription(ratingCode, ratingValue, metricDefs)
                }
            };
        }

        private async Task<ProjectQualityGate> GetQualityGate(string projectKey, SonarqubeProject project)
        {
            var qualityGateStatus = project.Metrics.Find(m => m.Name == "alert_status")?.Value;
            var qualityGateConditions = await _sonarqubeService.GetQualityGateFailedConditions(projectKey);

            return new ProjectQualityGate
            {
                QualityGateStatus = qualityGateStatus,
                QualityGateConditions = qualityGateConditions
            };
        }

        private string GetRatingDescription(string ratingCode, string ratingValue, Dictionary<string, MetricDefinition> metricDefinitions)
        {
            if (metricDefinitions.TryGetValue(ratingCode, out var metric) && metric.Ranks != null)
            {
                var rank = metric.Ranks.Find(r => r.Rank == ratingValue);
                if (rank != null)
                {
                    return rank.Description;
                }
            }

            return string.Empty;
        }
    }
}
