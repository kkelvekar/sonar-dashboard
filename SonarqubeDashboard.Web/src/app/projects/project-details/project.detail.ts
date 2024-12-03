export interface ProjectDetails {
  projectKey: string;
  projectName: string;
  projectGroup: string;
  period: Period;
  qualityGate: ProjectQualityGate;
  newCodeMetrics: NewCodeProjectMeasures;
  overallCodeMetrics: OverallCodeProjectMeasures;
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

export interface NewCodeProjectMeasures extends ProjectMeasures {
  newLines: string;
  newLinesToCover: string;
}

export interface OverallCodeProjectMeasures extends ProjectMeasures {
  lines: string;
  linesToCover: string;
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

export interface Period {
  newCodeBaseLine: NewCodeBaseLine;
  lastAnalysis: string;
}

export interface NewCodeBaseLine {
  date: string;
  humanizeDate: string;
}
