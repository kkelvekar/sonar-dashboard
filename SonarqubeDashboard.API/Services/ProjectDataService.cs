using SonarqubeDashboard.API.Models;
using System.Reflection;
using System.Text.Json;

namespace SonarqubeDashboard.API.Services
{
    public class ProjectDataService
    {
        private readonly MetricsService _metricsService;
        private Task<List<SonarqubeProject>> _projectsTask;

        public ProjectDataService(MetricsService metricsService)
        {
            _metricsService = metricsService;
        }

        public Task<List<SonarqubeProject>> Projects => _projectsTask ??= LoadProjectsAsync();

        private async Task<List<SonarqubeProject>> LoadProjectsAsync()
        {
            var projectList = await GetProjectListFromJSON();

            var tasks = projectList.Select(async project =>
            {
                try
                {
                    project.Metrics = await _metricsService.GetProjectMetrics(project.ProjectKey, project.ProjectToken);
                }
                catch (Exception ex)
                {
                    // Handle or log the exception
                    project.Metrics = null;
                }
                return project;
            });

            var projectsWithMetrics = await Task.WhenAll(tasks);
            return projectsWithMetrics.ToList();
        }

        private async Task<List<SonarqubeProject>> GetProjectListFromJSON()
        {
            var assembly = Assembly.GetExecutingAssembly();
            var resourceName = "SonarqubeDashboard.API.Data.projects.json";

            using (Stream stream = assembly.GetManifestResourceStream(resourceName))
            using (StreamReader reader = new StreamReader(stream))
            {
                var jsonString = await reader.ReadToEndAsync();
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
}
