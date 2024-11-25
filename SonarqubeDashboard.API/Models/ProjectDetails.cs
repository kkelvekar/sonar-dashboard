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
        public IEnumerable<string> QualityGateConditions { get; set; }

    }

    public class ProjectBug
    {
        public string BugCount { get; set; }
        public Rating Rating { get; set; }
    }

    public class ProjectVulnerability
    {
        public string VulnerabilityCount { get; set; }
        public Rating Rating { get; set; }
    }

    public class ProjectSecurityHotspot
    {
        public string SecurityHotspotCount { get; set; }
        public Rating Rating { get; set; }
    }

    public class ProjectCodeSmell
    {
        public string CodeSmellCount { get; set; }
        public Rating Rating { get; set; }
    }

    public class Rating
    {
        public string RatingValue { get; set; }
        public string RatingDescription { get; set; }

    }
}
