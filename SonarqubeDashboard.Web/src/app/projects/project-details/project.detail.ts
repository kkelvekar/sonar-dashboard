export interface ProjectDetails {
  projectKey: string;
  projectName: string;
  projectGroup: string;
  qualityGate: ProjectQualityGate;
  newCodeMetrics: ProjectMeasures;
  overallCodeMetrics: ProjectMeasures;
}

export interface ProjectQualityGate {
  qualityGateStatus: string;
  qualityGateConditions: QualityGateCondition[];
}

export interface ProjectMeasures {
  bugs: ProjectBug;
  vulnerabilities: ProjectVulnerability;
  securityHotspots: ProjectSecurityHotspot;
  codeSmells: ProjectCodeSmell;
  coverage: string;
  duplicatedLinesDensity: string;
  ncloc: string;
}

export interface ProjectMetricBase {
  count: string;
  rating: Rating;
}

export interface ProjectBug extends ProjectMetricBase {}

export interface ProjectVulnerability extends ProjectMetricBase {}

export interface ProjectSecurityHotspot extends ProjectMetricBase {}

export interface ProjectCodeSmell extends ProjectMetricBase {}

export interface Rating {
  ratingValue: string;
  ratingDescription: string;
}

export interface QualityGateCondition {
  actualValue: string;
  message: string;
}
