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

        public ProjectController(ProjectService projectService)
        {
            _projectService = projectService;
        }

        [HttpGet("projects-by-group")]
        public async Task<IActionResult> GetProjectsByGroup()
        {
            var result = await _projectService.GetProjectsByGroup();
            return Ok(result);
        }
    }
}
