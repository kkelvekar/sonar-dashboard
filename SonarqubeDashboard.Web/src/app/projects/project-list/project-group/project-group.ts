export interface ProjectGroup {
  name: string;
  bugs?: number; // Bugs metric
  reliability_rating?: string; // Reliability rating
  vulnerabilities?: number; // Vulnerabilities metric
  security_rating?: string; // Security rating
  security_hotspots?: number; // Security hotspots metric
  security_review_rating?: string; // Security review rating
  code_smells?: number; // Code smells metric
  sqale_rating?: string; // Maintainability rating
  coverage?: number; // Coverage metric
  duplicated_lines_density?: number; // Duplicated lines density metric
}
