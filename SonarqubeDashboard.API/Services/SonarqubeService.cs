using SonarqubeDashboard.API.Models;
using System.Net.Http;
using System.Text.Json;

namespace SonarqubeDashboard.API.Services
{
    public class SonarqubeService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<SonarqubeService> _logger;

        private record ProjectAnalyses(Paging paging, List<Analyses> analyses);
        private record Paging(int pageIndex, int pageSize, int total);
        private record Analyses(string key, string date, List<Event> events, string projectVersion, bool manualNewCodePeriodBaseline, string revision, string detectedCI);
        private record Event(string key, string category, string name, string description);

        public SonarqubeService(HttpClient httpClient, ILogger<SonarqubeService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        public async Task<IEnumerable<string>> GetQualityGateFailedConditions(string projectKey)
        {
            var url = $"api/project_analyses/search?project={Uri.EscapeDataString(projectKey)}";
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

            return Enumerable.Empty<string>();
        }

        public async Task<string> GetSecurityReviewRating(string projectKey)
        {
            var url = $"api/measures/component?component={Uri.EscapeDataString(projectKey)}&metricKeys=security_review_rating";
            try
            {
                var response = await _httpClient.GetAsync(url);
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    return ParseSecurityReviewRating(content);
                }
                else
                {
                    _logger.LogError($"Received non-success status code {response.StatusCode} for project {projectKey}");
                }
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, $"HTTP request error fetching security review rating for project {projectKey}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Unexpected error fetching security review rating for project {projectKey}");
            }
            return null;
        }

        private string ParseSecurityReviewRating(string content)
        {
            try
            {
                using JsonDocument doc = JsonDocument.Parse(content);
                var root = doc.RootElement.GetProperty("component");
                var measures = root.GetProperty("measures");

                foreach (var measure in measures.EnumerateArray())
                {
                    if (measure.GetProperty("metric").GetString() == "security_review_rating")
                    {
                        var value = measure.GetProperty("value").GetString();
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
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Error parsing JSON response.");
            }

            return "Unknown";
        }


        private IEnumerable<string> ParseQualityGateFailedConditions(string response)
        {
            try
            {
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                var root = JsonSerializer.Deserialize<ProjectAnalyses>(response, options);

                if (root?.analyses != null)
                {
                    foreach (var analysis in root.analyses)
                    {
                        if (analysis.events != null)
                        {
                            foreach (var eventElement in analysis.events)
                            {
                                if (eventElement.category == "QUALITY_GATE" &&
                                    eventElement.name == "Failed" &&
                                    !string.IsNullOrEmpty(eventElement.description))
                                {
                                    return eventElement.description
                                        .Split(',')
                                        .Select(s => s.Trim())
                                        .ToList();
                                }
                            }
                        }
                    }
                }
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Error parsing JSON response.");
            }

            return Enumerable.Empty<string>();
        }

    }

}
