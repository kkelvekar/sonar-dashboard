using SonarqubeDashboard.API.Models;

namespace SonarqubeDashboard.API.Interfaces
{
    public interface ISonarqubeQualityGateSerivce
    {
        Task<IEnumerable<QualityGateCondition>> GetQualityGateFailedConditions(string projectKey);
        IEnumerable<QualityGateCondition> ParseQualityGateFailedConditions(string apiResponse);
    }
}