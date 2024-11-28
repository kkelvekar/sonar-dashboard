using System.Collections;

namespace SonarqubeDashboard.API.Models
{
    public class ProjectDetails
    {
        public string ProjectKey { get; set; }
        public string ProjectName { get; set; }
        public string ProjectGroup { get; set; }
        public ProjectQualityGate QualityGate { get; set; }
        public ProjectBug Bugs { get; set; }
        public ProjectVulnerability Vulnerabilities { get; set; }
        public ProjectSecurityHotspot SecurityHotspots { get; set; }
        public ProjectCodeSmell CodeSmells { get; set; }
        public string Coverage { get; set; }
        public string DuplicatedLinesDensity { get; set; }
        public string Ncloc { get; set; }

    }

    public class  ProjectQualityGate
    {
        public string QualityGateStatus { get; set; }
        public IEnumerable<QualityGateCondition> QualityGateConditions { get; set; }

    }

    public abstract class ProjectMetricBase
    {
        public string Count { get; set; }
        public Rating Rating { get; set; }
    }

    public class ProjectBug : ProjectMetricBase { }

    public class ProjectVulnerability : ProjectMetricBase { }

    public class ProjectSecurityHotspot : ProjectMetricBase { }

    public class ProjectCodeSmell : ProjectMetricBase { }

    public class Rating
    {
        public string RatingValue { get; set; }
        public string RatingDescription { get; set; }

    }

    public class QualityGateCondition
    {
        public string ActualValue { get; set; }

        public string Message { get; set; }
    }
}
