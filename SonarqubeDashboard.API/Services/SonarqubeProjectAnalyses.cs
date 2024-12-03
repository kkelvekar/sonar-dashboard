using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SonarqubeDashboard.API.Interfaces;

namespace SonarqubeDashboard.API.Services
{
    public record ProjectAnalysesRoot(Paging Paging, List<Analysis> Analyses);
    public record Paging(int PageIndex, int PageSize, int Total);
    public record Analysis(string Key, string Date, List<Event> Events, string ProjectVersion, bool ManualNewCodePeriodBaseline, string Revision, string DetectedCI);
    public record Event(string Key, string Category, string Name, string Description);
    public record ProjectAnalysis(string Key, DateTime Date, List<AnalysisEvent> Events, string ProjectVersion, bool ManualNewCodePeriodBaseline, string Revision, string DetectedCI);
    public record AnalysisEvent(string Key, string Category, string Name, string Description);

    public class SonarqubeProjectAnalyses : ISonarqubeProjectAnalyses
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<SonarqubeProjectAnalyses> _logger;

        public SonarqubeProjectAnalyses(HttpClient httpClient, ILogger<SonarqubeProjectAnalyses> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        /// <summary>
        /// Gets the project analyses for the specified project key.
        /// </summary>
        /// <param name="projectKey">The key of the project.</param>
        /// <returns>
        /// A task that represents the asynchronous operation. The task result contains an enumerable of <see cref="ProjectAnalysis"/>.
        /// </returns>
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

        /// <summary>
        /// Gets the date and time of the last analysis for the specified project key.
        /// </summary>
        /// <param name="projectKey">The key of the project.</param>
        /// <returns>
        /// A task that represents the asynchronous operation. The task result contains the date and time of the last analysis, or <c>null</c> if none found.
        /// </returns>
        public async Task<DateTime?> GetLastAnalysisDateTime(string projectKey)
        {
            var analyses = await GetProjectAnalyses(projectKey);
            var lastAnalysis = analyses.OrderByDescending(a => a.Date).FirstOrDefault();
            return lastAnalysis?.Date;
        }

        private IEnumerable<ProjectAnalysis> ParseProjectAnalyses(string content)
        {
            try
            {
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };

                var root = JsonSerializer.Deserialize<ProjectAnalysesRoot>(content, options);

                if (root?.Analyses == null)
                {
                    _logger.LogWarning("No analyses found in the response.");
                    return Enumerable.Empty<ProjectAnalysis>();
                }

                return root.Analyses.Select(a =>
                {
                    // Adjust the date string if necessary
                    var dateString = a.Date;

                    // Parse the date string into DateTime
                    if (!DateTime.TryParse(dateString, out DateTime date))
                    {
                        _logger.LogWarning($"Invalid date format '{dateString}' for analysis {a.Key}.");
                        date = DateTime.MinValue;
                    }

                    var events = a.Events?.Select(e => new AnalysisEvent
                    (
                        Key: e.Key,
                        Category: e.Category,
                        Name: e.Name,
                        Description: e.Description
                    )).ToList() ?? new List<AnalysisEvent>();

                    return new ProjectAnalysis
                    (
                        Key: a.Key,
                        Date: date,
                        Events: events,
                        ProjectVersion: a.ProjectVersion,
                        ManualNewCodePeriodBaseline: a.ManualNewCodePeriodBaseline,
                        Revision: a.Revision,
                        DetectedCI: a.DetectedCI
                    );
                });
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Error parsing JSON content.");
                return Enumerable.Empty<ProjectAnalysis>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error parsing project analyses.");
                return Enumerable.Empty<ProjectAnalysis>();
            }
        }
    }
}
