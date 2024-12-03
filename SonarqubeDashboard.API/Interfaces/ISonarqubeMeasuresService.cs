using SonarqubeDashboard.API.Models;
using SonarqubeDashboard.API.Services;

namespace SonarqubeDashboard.API.Interfaces
{
    public interface ISonarqubeMeasuresService
    {
        Task<ComponentMeasures> GetComponentMeasures(string projectKey, string metricKeys);
        Task<List<ProjectMetric>> GetProjectMetrics(string projectKey);
    }
}