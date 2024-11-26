namespace SonarqubeDashboard.API.Models
{
    public class MetricDefinition
    {
        public string Code { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Type { get; set; }
        public List<MetricRank> Ranks { get; set; }
    }

    public class MetricRank
    {
        public string Rank { get; set; }
        public string Description { get; set; }
    }

}
