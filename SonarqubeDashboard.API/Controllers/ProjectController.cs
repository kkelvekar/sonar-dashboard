using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SonarqubeDashboard.API.Interfaces;
using SonarqubeDashboard.API.Services;

namespace SonarqubeDashboard.API.Controllers
{
    /// <summary>
    /// Controller for managing projects.
    /// </summary>
    [Route("api/projects")]
    [ApiController]
#pragma warning disable S6960 // Controllers should not have mixed responsibilities
    public class ProjectController : ControllerBase
#pragma warning restore S6960 // Controllers should not have mixed responsibilities
    {
        private readonly IProjectService _projectService;
        private readonly IProjectDetailService _projectDetailService;
        private readonly ILogger<ProjectController> _logger;

        /// <summary>
        /// Initializes a new instance of the <see cref="ProjectController"/> class.
        /// </summary>
        /// <param name="projectService">The project service.</param>
        /// <param name="projectDetailService">The project detail service.</param>
        /// <param name="logger">The logger instance.</param>
        public ProjectController(
            IProjectService projectService,
            IProjectDetailService projectDetailService,
            ILogger<ProjectController> logger)
        {
            _projectService = projectService;
            _projectDetailService = projectDetailService;
            _logger = logger;
        }

        /// <summary>
        /// Gets the list of projects grouped by group.
        /// </summary>
        /// <returns>A list of project groups.</returns>
        [HttpGet]
        public async Task<IActionResult> GetProjects()
        {
            try
            {
                var result = await _projectService.GetProjectsByGroupAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting projects.");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while processing your request.");
            }
        }

        /// <summary>
        /// Gets the details of a specific project.
        /// </summary>
        /// <param name="projectKey">The key of the project.</param>
        /// <returns>The project details.</returns>
        [HttpGet("{projectKey}")]
        public async Task<IActionResult> GetProjectDetails(string projectKey)
        {
            try
            {
                var result = await _projectDetailService.GetProjectDetail(projectKey);
                if (result == null)
                {
                    _logger.LogWarning("Project with key {ProjectKey} not found.", projectKey);
                    return NotFound($"Project with key '{projectKey}' was not found.");
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting details for project {ProjectKey}.", projectKey);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while processing your request.");
            }
        }
    }
}
