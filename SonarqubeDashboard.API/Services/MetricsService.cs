using System.Net.Http;
using System.Threading.Tasks;
using System.Xml;
using Microsoft.Extensions.Configuration;
using SonarqubeDashboard.API.Models;

namespace SonarqubeDashboard.API.Services
{
    public class MetricsService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<MetricsService> _logger;
        private readonly string[] Metrics = new[]
        {
            "bugs",
            "alert_status",
            "coverage",
            "code_smells",
            "duplicated_lines_density",
            "ncloc",
            "sqale_rating",
            "security_hotspots",
            "reliability_rating",
            "sqale_index",
            "vulnerabilities",
            "security_rating",
            "security_review_rating"
        };

        public MetricsService(HttpClient httpClient, ILogger<MetricsService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        public async Task<List<ProjectMetric>> GetProjectMetrics(string projectKey, string projectToken)
        {
            var tasks = Metrics.Select(async metric =>
            {
                var url = $"?project={projectKey}&metric={metric}&token={projectToken}";
                try
                {
                    var svg = await _httpClient.GetStringAsync(url);
                    return ParseMetricFromSvg(svg, metric);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Error fetching metric {metric} for project {projectKey}");
                    return new ProjectMetric { Name = metric, Value = "Error" };
                }
            });

            var results = await Task.WhenAll(tasks);
            return results.ToList();
        }

        private ProjectMetric ParseMetricFromSvg(string svg, string metric)
        {
            var xmlDoc = new XmlDocument();
            xmlDoc.LoadXml(svg);

            var textNodes = xmlDoc.GetElementsByTagName("text");
            string value = "N/A";
            if (textNodes.Count > 0)
            {
                var lastTextNode = textNodes[textNodes.Count - 1];
                value = lastTextNode.InnerText.Trim();
            }
            return new ProjectMetric
            {
                Name = metric,
                Value = value
            };
        }
    }
}
