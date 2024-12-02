using SonarqubeDashboard.API.Models;
using System.Reflection;
using System.Text.Json;

namespace SonarqubeDashboard.API.Services
{
    public class ProjectDataService
    {      
        private readonly SonarqubeMeasuresService _sonarqubeMeasuresService;
        private Task<List<SonarqubeProject>> _projectsTask;
        private Task<List<MetricDefinition>> _metricDefinitionsTask;

        public ProjectDataService(SonarqubeMeasuresService sonarqubeMeasuresService)
        {       
            _sonarqubeMeasuresService = sonarqubeMeasuresService;
        }

        public Task<List<SonarqubeProject>> Projects => _projectsTask ??= LoadProjectsAsync();

        public Task<List<MetricDefinition>> MetricDefinitions => _metricDefinitionsTask ??= GetMetricDefinitionsFromJSON();

        private async Task<List<SonarqubeProject>> LoadProjectsAsync()
        {
            var projectList = await GetProjectListFromJSON();

            var tasks = projectList.Select(async project =>
            {
                try
                {
                    project.Metrics = await _sonarqubeMeasuresService.GetProjectMetrics(project.ProjectKey);
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

        private async Task<List<MetricDefinition>> GetMetricDefinitionsFromJSON()
        {
            var assembly = Assembly.GetExecutingAssembly();
            var resourceName = "SonarqubeDashboard.API.Data.metric-definitions.json";
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
    }

}
