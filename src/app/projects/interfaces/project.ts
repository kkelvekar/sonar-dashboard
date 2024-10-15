import { Metric } from "./metric";

// Interface for Metric Data
export interface Project {
  projectKey: string;
  projectName: string;
  projectGroup: string;
  projectToken: string;
  metrics: Metric[];
}
