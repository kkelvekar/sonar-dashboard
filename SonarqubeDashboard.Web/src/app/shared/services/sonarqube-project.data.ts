export interface SonarQubeProjectGroupData {
  name: string;
  projects: SonarQubeProjectData[];
}

// Interface for Metric Data
export interface SonarQubeProjectData {
  projectKey: string;
  projectName: string;
  projectGroup: string;
  projectToken: string;
  metrics: SonarQubeProjectMetricData[];
}

export interface SonarQubeProjectMetricData {
  name: string;
  value: any;
}


