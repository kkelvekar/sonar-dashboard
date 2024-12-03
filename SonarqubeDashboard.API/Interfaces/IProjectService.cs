using SonarqubeDashboard.API.Models;

namespace SonarqubeDashboard.API.Interfaces
{
    public interface IProjectService
    {
        Task<List<MetricDefinition>> GetProjectRatingDescription();
        Task<List<Project>> GetProjectsAsync();
        Task<List<ProjectGroup>> GetProjectsByGroupAsync();
    }
}