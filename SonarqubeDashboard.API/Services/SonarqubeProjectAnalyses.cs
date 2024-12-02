using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace SonarqubeDashboard.API.Services
{
    public class SonarqubeProjectAnalyses
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<SonarqubeProjectAnalyses> _logger;

        public record RootObject(Paging Paging, List<Analysis> Analyses);
        public record Paging(int PageIndex, int PageSize, int Total);
        public record Analysis(string Key, string Date, List<Event> Events, string ProjectVersion, bool ManualNewCodePeriodBaseline, string Revision, string DetectedCI);
        public record Event(string Key, string Category, string Name, string Description);
        public record ProjectAnalysis(string Key, DateTime Date, List<AnalysisEvent> Events, string ProjectVersion, bool ManualNewCodePeriodBaseline, string Revision, string DetectedCI);
        public record AnalysisEvent(string Key, string Category, string Name, string Description);

        public SonarqubeProjectAnalyses(HttpClient httpClient, ILogger<SonarqubeProjectAnalyses> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        public async Task<IEnumerable<ProjectAnalysis>> GetProjectAnalyses(string projectKey)
        {
            var url = $"api/project_analyses/search?project={Uri.EscapeDataString(projectKey)}";
            try
            {
                var response = await _httpClient.GetAsync(url);
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    return ParseProjectAnalyses(content);
                }
                else
                {
                    _logger.LogError($"Received non-success status code {response.StatusCode} for project {projectKey}");
                }
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, $"HTTP request error fetching project analyses for project {projectKey}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Unexpected error fetching project analyses for project {projectKey}");
            }
            return Enumerable.Empty<ProjectAnalysis>();
        }

        private IEnumerable<ProjectAnalysis> ParseProjectAnalyses(string content)
        {
            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };

            var root = JsonSerializer.Deserialize<RootObject>(content, options);

            return root?.Analyses?.Select(a =>
            {
                // Adjust the date string if necessary
                var dateString = a.Date;

                // Parse the date string into DateTime
                DateTime date = DateTime.Parse(dateString);

                return new ProjectAnalysis
                (
                    Key: a.Key,
                    Date: date,
                    Events: a.Events.Select(e => new AnalysisEvent
                    (
                        Key: e.Key,
                        Category: e.Category,
                        Name: e.Name,
                        Description: e.Description
                    )).ToList(),
                    ProjectVersion: a.ProjectVersion,
                    ManualNewCodePeriodBaseline: a.ManualNewCodePeriodBaseline,
                    Revision: a.Revision,
                    DetectedCI: a.DetectedCI
                );
            }) ?? Enumerable.Empty<ProjectAnalysis>();
        }

        public async Task<DateTime?> GetLastAnalysisDateTime(string projectKey)
        {
            var analyses = await GetProjectAnalyses(projectKey);
            var lastAnalysis = analyses.OrderByDescending(a => a.Date).FirstOrDefault();
            return lastAnalysis?.Date;
        }
    }
}
