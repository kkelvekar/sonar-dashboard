import { Component, Input } from '@angular/core';
import { SonarQubeProjectData } from '../../shared/services/sonarqube-project.data';


@Component({
  selector: 'app-project-item',
  templateUrl: './project-item.component.html',
  styleUrl: './project-item.component.css'
})
export class ProjectItemComponent {
  @Input()
  projectItem!: SonarQubeProjectData;

  constructor() {

  }

  // Helper method to find a metric by name
  getMetricValue(metricName: string): string | number | undefined {
    const metric = this.projectItem.metrics.find(m => m.name === metricName);
    return metric ? metric.value : undefined;
  }

  // Helper method to find a metric by name
  getRatingValue(metricName: string): string {
    if (metricName === 'security_review_rating') {
      let metric = this.projectItem.metrics.find(m => m.name === 'vulnerabilities');
      return this.getSecurityReviewRating(metric?.value as number);
    } else {
      let metric = this.projectItem.metrics.find(m => m.name === metricName);
      return metric?.value as string;
    }
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

  getCircleValue(coverage: string | number | undefined): string {
    if (!coverage) return '0';
    return ((coverage as number / 100) * 100).toFixed(2);
  }

  // Helper method to check if alert status is passed
  isAlertStatusPassed(): boolean {
    return this.getMetricValue('alert_status') === 'passed';
  }
}
