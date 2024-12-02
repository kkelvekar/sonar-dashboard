import { Injectable } from "@angular/core";
import { SonarQubeProjectMetricData } from "../../../shared/services/sonarqube-project.data";
import _ from "lodash";

@Injectable({
  providedIn: 'root'
})
export class ProjectMetricService {
  // Helper method to find a metric by name
  getMetricValue(metrics: SonarQubeProjectMetricData[], metricName: string): string {
    const metric = metrics.find(m => m.name === metricName);
    return metric?.value as string;
  }

  // Helper method to find a metric by name
  getRatingValue(metrics: SonarQubeProjectMetricData[], metricName: string): string {
      let metric = metrics.find(m => m.name === metricName);
      return metric?.value as string;
  }

  // Method to apply conditional logic for security review rating
  getSecurityReviewRating(value: number): string {
    let rating: string = '';

    if (value >= 80) {
      rating = 'A';
    } else if (value >= 70 && value < 80) {
      rating = 'B';
    } else if (value >= 50 && value < 70) {
      rating = 'C';
    } else if (value >= 30 && value < 50) {
      rating = 'D';
    } else if (value < 30) {
      rating = 'E';
    }
    return rating;
  }
}
