using SonarqubeDashboard.API.Models;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Reflection;

namespace SonarqubeDashboard.API.Services
{
    public class ProjectService
    {
        private readonly ProjectDataService _projectDataService;

        public ProjectService(ProjectDataService projectDataService)
        {
            _projectDataService = projectDataService;
        }

        public async Task<List<ProjectGroup>> GetProjectsByGroup()
        {
            var projects = await _projectDataService.Projects;
            var groupedProjects = projects
                .GroupBy(p => p.ProjectGroup)
                .Select(group => new ProjectGroup
                {
                    Name = group.Key,
                    Projects = group.ToList()
                })
                .ToList();

            return groupedProjects;
        }

    }
}
