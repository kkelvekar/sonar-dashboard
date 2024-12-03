using SonarqubeDashboard.API.Services;

namespace SonarqubeDashboard.API.Interfaces
{
    public interface ISonarqubeProjectAnalyses
    {
        Task<DateTime?> GetLastAnalysisDateTime(string projectKey);
        Task<IEnumerable<ProjectAnalysis>> GetProjectAnalyses(string projectKey);
    }
}