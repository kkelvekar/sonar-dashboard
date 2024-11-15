using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SonarqubeDashboard.API.Services;

namespace SonarqubeDashboard.API.Controllers
{
    [Route("api/sonarqube-project")]
    [ApiController]
    public class ProjectController : ControllerBase
    {
        private readonly ProjectService _projectService;
        private readonly ProjectDetailService _projectDetailService;

        public ProjectController(ProjectService projectService, ProjectDetailService projectDetailService)
        {
            _projectService = projectService;
            _projectDetailService = projectDetailService;
        }

        [HttpGet("projects-by-group")]
        public async Task<IActionResult> GetProjectsByGroup()
        {
            var result = await _projectService.GetProjectsByGroup();
            return Ok(result);
        }

        [HttpGet("projects-details/{projectKey}")]
        public async Task<IActionResult> GetProjectDetails(string projectKey)
        {
            var result = await _projectDetailService.GetProjectDetails(projectKey);
            return Ok(result);
        }
    }
}
