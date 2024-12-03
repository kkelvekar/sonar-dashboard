using SonarqubeDashboard.API.Interfaces;
using SonarqubeDashboard.API.Models;
using System.Net.Http;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace SonarqubeDashboard.API.Services
{
    public record ProjectStatusResponse(ProjectStatus ProjectStatus);
    public record ProjectStatus(string Status, bool IgnoredConditions, string CaycStatus, List<Condition> Conditions, Period Period);
    public record Condition(string Status, string MetricKey, string Comparator, string? ErrorThreshold, string ActualValue);
    public record Period(string Mode, string Date, string Parameter);

    public class SonarqubeQualityGateSerivce : ISonarqubeQualityGateSerivce
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<SonarqubeQualityGateSerivce> _logger;

        public SonarqubeQualityGateSerivce(HttpClient httpClient, ILogger<SonarqubeQualityGateSerivce> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        /// <summary>
        /// Retrieves and processes the quality gate failed conditions for a given project.
        /// </summary>
        /// <param name="projectKey">The key of the project in SonarQube.</param>
        /// <returns>A list of JSON strings representing each failed condition with friendly messages.</returns>
        public async Task<IEnumerable<QualityGateCondition>> GetQualityGateFailedConditions(string projectKey)
        {
            var url = $"api/qualitygates/project_status?projectKey={Uri.EscapeDataString(projectKey)}";
            try
            {
                var response = await _httpClient.GetAsync(url);

                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    return ParseQualityGateFailedConditions(content);
                }
                else
                {
                    _logger.LogError($"Received non-success status code {response.StatusCode} for project {projectKey}");
                }
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, $"HTTP request error fetching quality gate failed conditions for project {projectKey}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Unexpected error fetching quality gate failed conditions for project {projectKey}");
            }

            return Enumerable.Empty<QualityGateCondition>();
        }

        /// <summary>
        /// Parses the API response and returns a list of JSON strings representing each condition with friendly messages.
        /// </summary>
        /// <param name="apiResponse">The JSON string response from the API.</param>
        /// <returns>A list of JSON strings representing each condition.</returns>
        public IEnumerable<QualityGateCondition> ParseQualityGateFailedConditions(string apiResponse)
        {
            var result = new List<QualityGateCondition>();

            try
            {
                // Deserialize the JSON response into the ProjectStatusResponse record
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };

                var response = JsonSerializer.Deserialize<ProjectStatusResponse>(apiResponse, options);

                if (response?.ProjectStatus?.Conditions != null)
                {
                    // Define the mapping for metric keys to message templates
                    var metricMessages = new Dictionary<string, string>
                {
                    { "new_duplicated_lines_density", "Duplicated lines (%) on new code is greater than {0}%" },
                    { "new_coverage", "Coverage on new code is less than {0}%" },
                    { "new_security_hotspots_reviewed", "Security hotspots reviewed on new code is less than {0}%" },
                    { "new_reliability_rating", "Reliability rating on new code is worse than {0}" },
                    { "new_security_rating", "Security rating on new code is worse than {0}" },
                    { "new_maintainability_rating", "Maintainability rating on new code is worse than {0}" }
                };

                    // Iterate over each condition
                    foreach (var condition in response.ProjectStatus.Conditions)
                    {
                        // Only process conditions with status "ERROR"
                        if (!string.Equals(condition.Status, "ERROR", StringComparison.OrdinalIgnoreCase))
                        {
                            continue;
                        }

                        var metricKey = condition.MetricKey;
                        var comparator = condition.Comparator;
                        var errorThreshold = condition.ErrorThreshold;
                        var actualValue = condition.ActualValue;

                        // Skip if required fields are missing
                        if (string.IsNullOrEmpty(metricKey) || string.IsNullOrEmpty(actualValue))
                        {
                            _logger.LogWarning("Condition with missing metricKey or actualValue skipped.");
                            continue;
                        }

                        string message;

                        if (metricMessages.TryGetValue(metricKey, out var messageTemplate))
                        {
                            if (string.IsNullOrEmpty(errorThreshold))
                            {
                                _logger.LogWarning($"Error threshold is missing for metric '{metricKey}'. Using actual value instead.");
                                message = $"Metric '{metricKey}' has an actual value of {actualValue}%.";
                            }
                            else
                            {
                                message = string.Format(messageTemplate, errorThreshold);
                            }
                        }
                        else
                        {
                            // Handle unknown metric keys
                            message = $"Metric '{metricKey}' {ReplaceComperator(comparator)} of {errorThreshold}%.";
                        }

                        var conditionResult = new QualityGateCondition()
                        {
                            ActualValue = $"{actualValue}%",
                            Message = message
                        };

                        result.Add(conditionResult);
                    }
                }
                else
                {
                    _logger.LogError("No conditions found in the API response.");
                }
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Error parsing JSON response.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error processing API response.");
            }

            return result;
        }

        private string ReplaceComperator(string comperator)
        {
            if (string.IsNullOrEmpty(comperator))
                return comperator;

            return comperator
                .Replace("GT", "is greater than")
                .Replace("LT", "is less than");
        }
    }
}
