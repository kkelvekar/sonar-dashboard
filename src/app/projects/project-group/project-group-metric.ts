import { ProjectMetricItem } from "../interfaces/project-metric-item"

export interface ProjectGroupMetric {
  groupCoverage: ProjectMetricItem
  groupVulnerabilities: ProjectMetricItem
  groupSecurity: ProjectMetricItem
}

