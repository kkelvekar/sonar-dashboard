namespace SonarqubeDashboard.API.Models
{
    public class ProjectGroup
    {
        public string Name { get; set; }
        public List<SonarqubeProject> Projects { get; set; }
    }
}
