using SonarqubeDashboard.API.Helpers.Constants;
using SonarqubeDashboard.API.Interfaces;
using SonarqubeDashboard.API.Models;
using System.Linq;
using System.Net.Http;
using System.Text.Json;

namespace SonarqubeDashboard.API.Services
{
    public record ComponentMeasures(Component Component, TopLevelPeriod Period);

    public record TopLevelPeriod(int Index, string Mode, string Date, string Parameter);

    public record Component(string Key, string Name, string Qualifier, List<Measure> Measures);

    public record Measure(string Metric, string Value, bool? BestValue, MeasurePeriod Period);

    public record MeasurePeriod(int Index, string Value, bool? BestValue);

    public class SonarqubeMeasuresService : ISonarqubeMeasuresService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<SonarqubeMeasuresService> _logger;

        public SonarqubeMeasuresService(HttpClient httpClient, ILogger<SonarqubeMeasuresService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        /// <summary>
        /// Retrieves measures for a specific project component from Sonarqube.
        /// </summary>
        /// <param name="projectKey">The key of the Sonarqube project.</param>
        /// <param name="metricKeys">Comma-separated list of metric keys to retrieve.</param>
        /// <returns>
        /// A task representing the asynchronous operation. The task result contains a <see cref="ComponentMeasures"/> object if successful; otherwise, null.
        /// </returns>
        public async Task<ComponentMeasures> GetComponentMeasures(string projectKey, string metricKeys)
        {
            var url = $"api/measures/component?component={Uri.EscapeDataString(projectKey)}&metricKeys={metricKeys}&additionalFields=period";
            try
            {
                var response = await _httpClient.GetAsync(url);
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    if (string.IsNullOrEmpty(content))
                    {
                        _logger.LogError($"Received empty content for project {projectKey}");
                        return null;
                    }
                    return ParseComponentMeasures(content);
                }
                else
                {
                    _logger.LogError($"Received non-success status code {response.StatusCode} for project {projectKey}");
                }
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, $"HTTP request error fetching measures for project {projectKey}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Unexpected error fetching measures for project {projectKey}");
            }
            return null;
        }

        /// <summary>
        /// Retrieves project metrics for the specified project key.
        /// </summary>
        /// <param name="projectKey">The key of the Sonarqube project.</param>
        /// <returns>
        /// A task representing the asynchronous operation. The task result contains a list of <see cref="ProjectMetric"/> objects.
        /// </returns>
        public async Task<List<ProjectMetric>> GetProjectMetrics(string projectKey)
        {
            var metricKeys = MetricsKeys.OverallCodeMetricKeys.Concat(new[] { "alert_status" }).ToList();
            var componentMeasures = await GetComponentMeasures(projectKey, string.Join(",", metricKeys));

            if (componentMeasures?.Component?.Measures == null)
            {
                _logger.LogWarning($"No measures found for project {projectKey}");
                return new List<ProjectMetric>();
            }

            var projectMetrics = componentMeasures.Component.Measures.Select(measure =>
            {
                string value = measure.Value ?? measure.Period?.Value;

                if ((measure.Metric.Contains(MetricsKeys.DuplicatedLinesDensity, StringComparison.OrdinalIgnoreCase) || measure.Metric.Contains(MetricsKeys.Coverage, StringComparison.OrdinalIgnoreCase)) && value != null)
                {
                    value = $"{value}%";
                }

                if (measure.Metric.Contains(MetricsKeys.Ncloc, StringComparison.OrdinalIgnoreCase) && value != null)
                {
                    value = FormatNumber(value);
                }

                if (measure.Metric.Contains("alert_status", StringComparison.OrdinalIgnoreCase) && value != null)
                {
                    value = value == "OK" ? "passed" : "failed";
                }

                return new ProjectMetric
                {
                    Name = measure.Metric,
                    Value = value
                };
            }).ToList();

            return projectMetrics;
        }

        /// <summary>
        /// Parses the JSON content and converts ratings in the measures.
        /// </summary>
        /// <param name="content">The JSON content as a string.</param>
        /// <returns>
        /// A <see cref="ComponentMeasures"/> object with converted ratings, or null if parsing fails.
        /// </returns>
        private ComponentMeasures ParseComponentMeasures(string content)
        {
            if (string.IsNullOrEmpty(content))
            {
                _logger.LogError("Content is null or empty in ParseComponentMeasures.");
                return null;
            }

            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };

            ComponentMeasures componentResponse = null;

            try
            {
                componentResponse = JsonSerializer.Deserialize<ComponentMeasures>(content, options);
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Error deserializing content in ParseComponentMeasures.");
                return null;
            }

            var component = componentResponse?.Component;

            if (component?.Measures != null)
            {
                var updatedMeasures = component.Measures.Select(measure =>
                {
                    string value = measure.Value ?? measure.Period?.Value;

                    if (measure.Metric.Contains("rating", StringComparison.OrdinalIgnoreCase) && value != null)
                    {
                        var newValue = ConvertRating(value);

                        if (measure.Value != null)
                        {
                            return measure with { Value = newValue };
                        }
                        else if (measure.Period != null)
                        {
                            var newPeriod = measure.Period with { Value = newValue };
                            return measure with { Period = newPeriod };
                        }
                    }
                    return measure;
                }).ToList();

                // Update the component with the modified measures
                component = component with { Measures = updatedMeasures };
                componentResponse = componentResponse with { Component = component };
            }
            else
            {
                _logger.LogWarning("No measures found in the component.");
            }

            return componentResponse;
        }

        /// <summary>
        /// Converts a numeric rating value to its corresponding letter grade.
        /// </summary>
        /// <param name="value">The numeric rating value as a string.</param>
        /// <returns>
        /// The corresponding letter grade, or "Unknown" if the value is not recognized.
        /// </returns>
        private string ConvertRating(string value)
        {
            if (string.IsNullOrEmpty(value))
            {
                _logger.LogWarning("Value is null or empty in ConvertRating.");
                return "Unknown";
            }

            return value switch
            {
                "1.0" => "A",
                "2.0" => "B",
                "3.0" => "C",
                "4.0" => "D",
                "5.0" => "E",
                _ => "Unknown"
            };
        }

        /// <summary>
        /// Formats a numeric string by adding 'k' suffix for thousands.
        /// </summary>
        /// <param name="numberString">The numeric value as a string.</param>
        /// <returns>
        /// The formatted number string.
        /// </returns>
        private string FormatNumber(string numberString)
        {
            if (string.IsNullOrEmpty(numberString))
            {
                _logger.LogWarning("Number string is null or empty in FormatNumber.");
                return numberString;
            }

            if (double.TryParse(numberString, out double number))
            {
                if (number >= 1000)
                {
                    number = Math.Round(number / 1000, 1);
                    return $"{number}k";
                }
                else
                {
                    return number.ToString();
                }
            }

            _logger.LogWarning($"Unable to parse '{numberString}' as a number in FormatNumber.");
            return numberString;
        }

    }

}
