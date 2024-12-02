namespace SonarqubeDashboard.API.Helpers.Constants
{
    public static class MetricsKeys
    {
        // Individual metric keys for new code
        public const string NewBugs = "new_bugs";
        public const string NewReliabilityRating = "new_reliability_rating";
        public const string NewVulnerabilities = "new_vulnerabilities";
        public const string NewSecurityRating = "new_security_rating";
        public const string NewSecurityHotspots = "new_security_hotspots";
        public const string NewSecurityReviewRating = "new_security_review_rating";
        public const string NewCodeSmells = "new_code_smells";
        public const string NewMaintainabilityRating = "new_maintainability_rating";
        public const string NewCoverage = "new_coverage";
        public const string NewDuplicatedLinesDensity = "new_duplicated_lines_density";
        public const string NewLines = "new_lines";
        public const string NewLinesToCover = "new_lines_to_cover";

        // Individual metric keys for overall code
        public const string Bugs = "bugs";
        public const string ReliabilityRating = "reliability_rating";
        public const string Vulnerabilities = "vulnerabilities";
        public const string SecurityRating = "security_rating";
        public const string SecurityHotspots = "security_hotspots";
        public const string SecurityReviewRating = "security_review_rating";
        public const string CodeSmells = "code_smells";
        public const string SqaleRating = "sqale_rating";
        public const string Coverage = "coverage";
        public const string DuplicatedLinesDensity = "duplicated_lines_density";
        public const string Ncloc = "ncloc";

        // Read-only lists for new code and overall code metric keys
        public static readonly IReadOnlyList<string> NewCodeMetricKeys = new[]
        {
        NewBugs,
        NewReliabilityRating,
        NewVulnerabilities,
        NewSecurityRating,
        NewSecurityHotspots,
        NewSecurityReviewRating,
        NewCodeSmells,
        NewMaintainabilityRating,
        NewCoverage,
        NewDuplicatedLinesDensity,
        NewLines
    };

        public static readonly IReadOnlyList<string> OverallCodeMetricKeys = new[]
        {
        Bugs,
        ReliabilityRating,
        Vulnerabilities,
        SecurityRating,
        SecurityHotspots,
        SecurityReviewRating,
        CodeSmells,
        SqaleRating,
        Coverage,
        DuplicatedLinesDensity,
        Ncloc
    };

        // Combined list of all metric keys (new + overall)
        public static readonly IReadOnlyList<string> AllMetricKeys =
            NewCodeMetricKeys.Concat(OverallCodeMetricKeys).ToList();
    }

}
