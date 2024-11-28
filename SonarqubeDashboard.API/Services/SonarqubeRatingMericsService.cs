using SonarqubeDashboard.API.Models;
using System.Net.Http;
using System.Text.Json;

namespace SonarqubeDashboard.API.Services
{
    public class SonarqubeRatingMericsService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<SonarqubeRatingMericsService> _logger;


        public SonarqubeRatingMericsService(HttpClient httpClient, ILogger<SonarqubeRatingMericsService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
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

    }

}
