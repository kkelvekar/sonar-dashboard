using SonarqubeDashboard.API.Models;

namespace SonarqubeDashboard.API.Interfaces
{
    public interface IProjectDetailService
    {
        Task<ProjectDetails> GetProjectDetail(string projectKey);
    }
}