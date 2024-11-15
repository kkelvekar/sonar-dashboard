using SonarqubeDashboard.API.Models;
using System.Reflection;
using System.Text.Json;

namespace SonarqubeDashboard.API.Services
{
    public class ProjectDetailService
    {
        private readonly ProjectDataService _projectDataService;
        public ProjectDetailService(ProjectDataService projectDataService)
        {
            _projectDataService = projectDataService;
        }

        public async Task<ProjectDetails> GetProjectDetails(string projectKey) 
        { 
            var projects = await _projectDataService.Projects;
            var project = projects.Find(p => p.ProjectKey == projectKey);
            var result = new ProjectDetails
            {
                ProjectKey = project.ProjectKey,
                ProjectName = project.ProjectName,
                ProjectGroup = project.ProjectGroup,
                Coverage = project.Metrics.Find(m => m.Name == "coverage")?.Value,
                DuplicatedLinesDensity = project.Metrics.Find(m => m.Name == "duplicated_lines_density")?.Value,
                Bugs = new ProjectBug
                {
                    BugCount = project.Metrics.Find(m => m.Name == "bugs")?.Value,
                    Rating = new Rating
                    {
                        RatingValue = project.Metrics.Find(m => m.Name == "reliability_rating")?.Value,
                        RatingDescription = string.Empty
                    }
                },
                Vulnerabilities = new ProjectVulnerability
                {
                    VulnerabilityCount = project.Metrics.Find(m => m.Name == "vulnerabilities")?.Value,
                    Rating = new Rating
                    {
                        RatingValue = project.Metrics.Find(m => m.Name == "security_rating")?.Value,
                        RatingDescription = string.Empty
                    }
                },
                SecurityHotspots = new ProjectSecurityHotspot
                {
                    SecurityHotspotCount = project.Metrics.Find(m => m.Name == "security_hotspots")?.Value,
                    Rating = new Rating
                    {
                        RatingValue = project.Metrics.Find(m => m.Name == "security_rating")?.Value, // To Do: Needs to calculate
                        RatingDescription = string.Empty
                    }
                },
                CodeSmells = new ProjectCodeSmell
                {
                    CodeSmellCount = project.Metrics.Find(m => m.Name == "code_smells")?.Value,
                    Rating = new Rating
                    {
                        RatingValue = project.Metrics.Find(m => m.Name == "sqale_rating")?.Value,
                        RatingDescription = string.Empty
                    }
                },
                Ncloc = project.Metrics.Find(m => m.Name == "ncloc")?.Value
            };
            return result;
        }
    }
}
