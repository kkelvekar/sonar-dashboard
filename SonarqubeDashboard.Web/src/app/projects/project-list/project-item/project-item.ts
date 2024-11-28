export interface ProjectItem {
  key: string; // Project key
  name: string; // Project name
  qualityGate: string; // Quality gate metric
  bugs: number; // Bugs metric
  lineOfCode: string; // Line of code metric
  reliability_rating: string; // Reliability rating
  vulnerabilities: number; // Vulnerabilities metric
  security_rating: string; // Security rating
  security_hotspots: number; // Security hotspots metric
  security_review_rating: string; // Security review rating
  code_smells: number; // Code smells metric
  sqale_rating: string; // Maintainability rating
  coverage: number; // Coverage metric
  duplicated_lines_density: number; // Duplicated lines density metric
}
