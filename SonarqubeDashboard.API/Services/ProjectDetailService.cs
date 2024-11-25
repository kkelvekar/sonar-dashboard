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
            var metrics = await _projectDataService.MetricDefinitions;
            var project = projects.Find(p => p.ProjectKey == projectKey);
            var result = new ProjectDetails
            {
                ProjectKey = project.ProjectKey,
                ProjectName = project.ProjectName,
                ProjectGroup = project.ProjectGroup,                      
                QualityGate = await GetQualityGate(projectKey, project),
                Bugs = new ProjectBug
                {
                    BugCount = project.Metrics.Find(m => m.Name == "bugs")?.Value,
                    Rating = new Rating
                    {
                        RatingValue = project.Metrics.Find(m => m.Name == "reliability_rating")?.Value,
                        RatingDescription = GetRatingDescription("reliability_rating", project.Metrics.Find(m => m.Name == "reliability_rating")?.Value, metrics)
                    }
                },
                Vulnerabilities = new ProjectVulnerability
                {
                    VulnerabilityCount = project.Metrics.Find(m => m.Name == "vulnerabilities")?.Value,
                    Rating = new Rating
                    {
                        RatingValue = project.Metrics.Find(m => m.Name == "security_rating")?.Value,
                        RatingDescription = GetRatingDescription("security_rating", project.Metrics.Find(m => m.Name == "security_rating")?.Value, metrics)
                    }
                },
                SecurityHotspots = new ProjectSecurityHotspot
                {
                    SecurityHotspotCount = project.Metrics.Find(m => m.Name == "security_hotspots")?.Value,
                    Rating = new Rating
                    {
                        RatingValue = project.Metrics.Find(m => m.Name == "security_rating")?.Value, // To Do: Needs to calculate
                        RatingDescription = GetRatingDescription("security_review_rating", project.Metrics.Find(m => m.Name == "security_review_rating")?.Value, metrics)
                    }
                },
                CodeSmells = new ProjectCodeSmell
                {
                    CodeSmellCount = project.Metrics.Find(m => m.Name == "code_smells")?.Value,
                    Rating = new Rating
                    {
                        RatingValue = project.Metrics.Find(m => m.Name == "sqale_rating")?.Value,
                        RatingDescription = GetRatingDescription("sqale_rating", project.Metrics.Find(m => m.Name == "sqale_rating")?.Value, metrics)
                    }
                },
                Coverage = project.Metrics.Find(m => m.Name == "coverage")?.Value,
                DuplicatedLinesDensity = project.Metrics.Find(m => m.Name == "duplicated_lines_density")?.Value,
                Ncloc = project.Metrics.Find(m => m.Name == "ncloc")?.Value
            };
            return result;
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

        private string GetRatingDescription(string ratingCode, string ratingValue, List<MetricDefinition> metrics)
        {
            var metric = metrics.FirstOrDefault(m => m.Code == ratingCode);
            if (metric != null)
            {
                var rank = metric.Ranks.FirstOrDefault(r => r.Rank == ratingValue);
                if (rank != null)
                {
                    return rank.Description;
                }
            }
            return string.Empty;
        }
    }
}
