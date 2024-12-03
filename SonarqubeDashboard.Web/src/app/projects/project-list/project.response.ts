export interface ProjectGroupResponse {
  name: string;
  projects: ProjectResponse[];
}

// Interface for Metric Data
export interface ProjectResponse {
  key: string;
  name: string;
  group: string;
  metrics: ProjectMetricResponse[];
}

export interface ProjectMetricResponse {
  name: string;
  value: any;
}


