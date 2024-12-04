using Humanizer;
using SonarqubeDashboard.API.Interfaces;
using SonarqubeDashboard.API.Models;
using System.Reflection;
using System.Text.Json;

namespace SonarqubeDashboard.API.Services
{
    public class ProjectJsonService : IProjectService
    {
        private readonly ISonarqubeMeasuresService _sonarqubeMeasuresService;

        public ProjectJsonService(ISonarqubeMeasuresService sonarqubeMeasuresService)
        {
            _sonarqubeMeasuresService = sonarqubeMeasuresService;
        }

        public async Task<List<Project>> GetProjectsAsync()
        {
            var projectList = await GetProjectsFromJSON();

            var tasks = projectList.Select(async project =>
            {
                try
                {
                    project.Name = project.Name.Humanize(LetterCasing.Title);
                    project.Metrics = await _sonarqubeMeasuresService.GetProjectMetrics(project.Key);
                }
                catch (Exception ex)
                {
                    // Handle or log the exception
                    project.Metrics = null;
                }
                return project;
            });

            var projectsWithMetrics = await Task.WhenAll(tasks);
            var projects = projectsWithMetrics.Where(p => p.Metrics.Any(x => x.Value != "Project has not been found")).ToList();
            return projects;
        }

        public async Task<List<ProjectGroup>> GetProjectsByGroupAsync()
        {
            var projects = await GetProjectsAsync();
            var groupedProjects = projects
                .GroupBy(p => p.Group)
                .Select(group => new ProjectGroup
                {
                    Name = group.Key,
                    Projects = group.ToList()
                })
                .ToList();

            return groupedProjects;
        }

        public async Task<List<MetricDefinition>> GetProjectRatingDescription()
        {
            var assembly = Assembly.GetExecutingAssembly();
            var resourceName = "SonarqubeDashboard.API.Data.rating-descriptions.json";
            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            };

            using (Stream stream = assembly.GetManifestResourceStream(resourceName))
            using (StreamReader reader = new StreamReader(stream))
            {
                var jsonString = await reader.ReadToEndAsync();
                var metricDefinitions = JsonSerializer.Deserialize<List<MetricDefinition>>(jsonString, options);
                return metricDefinitions;
            }
        }

        private async Task<List<Project>> GetProjectsFromJSON()
        {
            var assembly = Assembly.GetExecutingAssembly();
            var resourceName = "SonarqubeDashboard.API.Data.projects.json";

            using (Stream stream = assembly.GetManifestResourceStream(resourceName))
            using (StreamReader reader = new StreamReader(stream))
            {
                var jsonString = await reader.ReadToEndAsync();
                var data = JsonSerializer.Deserialize<List<Dictionary<string, string>>>(jsonString);

                var projects = data.Select(item => new Project
                {
                    Key = item["project_key"],
                    Name = item["project_name"],
                    Group = item["project_group"]
                }).ToList();

                return projects;
            }
        }
    }

}
