using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SonarqubeDashboard.API.Services;

namespace SonarqubeDashboard.API.Controllers
{
    [Route("api/projects")]
    [ApiController]
    #pragma warning disable S6960 // Controllers should not have mixed responsibilities
    public class ProjectController : ControllerBase
    #pragma warning restore S6960 // Controllers should not have mixed responsibilities
    {
        private readonly ProjectService _projectService;
        private readonly ProjectDetailService _projectDetailService;

        public ProjectController(ProjectService projectService, ProjectDetailService projectDetailService)
        {
            _projectService = projectService;
            _projectDetailService = projectDetailService;
        }

        [HttpGet]
        public async Task<IActionResult> GetProjects()
        {
            var result = await _projectService.GetProjectsByGroup();
            return Ok(result);
        }

        [HttpGet("{projectKey}")]
        public async Task<IActionResult> GetProjectDetails(string projectKey)
        {
            var result = await _projectDetailService.GetProjectDetails(projectKey);
            return Ok(result);
        }

    }
}
