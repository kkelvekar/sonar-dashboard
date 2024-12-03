namespace SonarqubeDashboard.API.Models
{
    public class Project
    {
        public string Key { get; set; }
        public string Name { get; set; }
        public string Group { get; set; }
        public List<ProjectMetric> Metrics { get; set; } = new List<ProjectMetric>();
    }
}
