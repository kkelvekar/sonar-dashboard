import { Injectable } from "@angular/core";
import { ProjectMetricResponse } from "../../project-list/project.response";
import _ from "lodash";

@Injectable({
  providedIn: 'root'
})
export class ProjectMetricService {
  // Helper method to find a metric by name
  getMetricValue(metrics: ProjectMetricResponse[], metricName: string): string {
    const metric = metrics.find(m => m.name === metricName);
    return metric?.value as string;
  }

  // Helper method to find a metric by name
  getRatingValue(metrics: ProjectMetricResponse[], metricName: string): string {
      let metric = metrics.find(m => m.name === metricName);
      return metric?.value as string;
  }
}
