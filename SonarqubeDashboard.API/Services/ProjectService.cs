using SonarqubeDashboard.API.Models;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace SonarqubeDashboard.API.Services
{
    public class ProjectService(MetricsService sonarQubeMetricsService, IConfiguration configuration)
    {
        private readonly MetricsService _metricsService = sonarQubeMetricsService;
        private readonly string _jsonFilePath = configuration["ProjectsJsonFilePath"];

        public async Task<List<ProjectGroup>> GetProjectsByGroup()
        {
            var projects = await GetProjectData();

            var tasks = projects.Select(async project =>
            {
                project.Metrics = await _metricsService.GetProjectMetrics(project.ProjectKey, project.ProjectToken);
                return project;
            });

            var projectsWithMetrics = await Task.WhenAll(tasks);

            var groupedProjects = projectsWithMetrics
                .GroupBy(p => p.ProjectGroup)
                .Select(group => new ProjectGroup
                {
                    Name = group.Key,
                    Projects = group.ToList()
                })
                .ToList();

            return groupedProjects;
        }

        private async Task<List<SonarqubeProject>> GetProjectData()
        {
            var jsonString = await File.ReadAllTextAsync(_jsonFilePath);
            var data = JsonSerializer.Deserialize<List<Dictionary<string, string>>>(jsonString);

            var projects = data.Select(item => new SonarqubeProject
            {
                ProjectKey = item["project_key"],
                ProjectName = item["project_name"],
                ProjectGroup = item["project_group"],
                ProjectToken = item["project_token"]
            }).ToList();

            return projects;
        }
    }
}
