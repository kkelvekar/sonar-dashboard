namespace SonarqubeDashboard.API.Models
{
    public class SonarqubeProject
    {
        public string ProjectKey { get; set; }
        public string ProjectName { get; set; }
        public string ProjectGroup { get; set; }
        public string ProjectToken { get; set; }
        public List<ProjectMetric> Metrics { get; set; } = new List<ProjectMetric>();
    }
}
