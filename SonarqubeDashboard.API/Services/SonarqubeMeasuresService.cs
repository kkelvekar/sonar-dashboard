using SonarqubeDashboard.API.Helpers.Constants;
using SonarqubeDashboard.API.Models;
using System.Linq;
using System.Net.Http;
using System.Text.Json;

namespace SonarqubeDashboard.API.Services
{
    public class SonarqubeMeasuresService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<SonarqubeMeasuresService> _logger;

        public record ComponentMeasures(Component Component);
        public record Component(string Key, string Name, string Qualifier, List<Measure> Measures);

        public record Measure(string Metric, string Value, bool? BestValue, Period Period);

        public record Period(int Index, string Value, bool? BestValue);


        public SonarqubeMeasuresService(HttpClient httpClient, ILogger<SonarqubeMeasuresService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        public async Task<Component> GetComponentMeasures(string projectKey)
        {
            var metricKeys = string.Join(",", MetricsKeys.AllMetricKeys);
            var url = $"api/measures/component?component={Uri.EscapeDataString(projectKey)}&metricKeys={metricKeys}";
            try
            {
                var response = await _httpClient.GetAsync(url);
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
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

        private Component ParseComponentMeasures(string content)
        {
            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };

            // Deserialize into the wrapper class
            var componentResponse = JsonSerializer.Deserialize<ComponentMeasures>(content, options);
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

                component = component with { Measures = updatedMeasures };
            }

            return component;
        }

        private string ConvertRating(string value)
        {
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

    }

}
