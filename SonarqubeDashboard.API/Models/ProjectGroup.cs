namespace SonarqubeDashboard.API.Models
{
    public class ProjectGroup
    {
        public string Name { get; set; }
        public List<Project> Projects { get; set; }
    }
}
