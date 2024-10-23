import { Injectable } from "@angular/core";
import { ProjectList } from "../project-list/project-list";
import { SonarQubeProjectData, SonarQubeProjectGroupData, SonarQubeProjectMetricData } from "../../shared/services/sonarqube-project.data";
import { SonarQubeProjectDataService } from "../../shared/services/sonarqube-project-data.service";
import _ from "lodash";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ProjectDataService {
  private _projectList = new BehaviorSubject<ProjectList[]>([]); // Use BehaviorSubject
  projectList$ = this._projectList.asObservable(); // Expose as an observable

  constructor(private sonarQubeProjectDataService: SonarQubeProjectDataService) {
    this.sonarQubeProjectDataService.projectData$.subscribe((projectGroups: SonarQubeProjectGroupData[]) => {
      this.mapSonarQubeDataToProjectData(projectGroups);
    });
  }

  private mapSonarQubeDataToProjectData(projectGroups: SonarQubeProjectGroupData[]) {
    const projectList: ProjectList[] = []; // Local variable for mapping

    projectGroups.forEach(projectGroupData => {
      let project: ProjectList = {
        projectGroup: {
          name: projectGroupData.name,
        },
        projectItems: _.map(projectGroupData.projects, (project: SonarQubeProjectData) => {
          return {
            name: project.projectName,
            qualityGate: this.getMetricValue(project.metrics, 'alert_status') as string,
            bugs: this.getMetricValue(project.metrics, 'bugs') as number,
            lineOfCode: this.getMetricValue(project.metrics, 'ncloc') as number,
            reliability_rating: this.getRatingValue(project.metrics, 'reliability_rating'),
            vulnerabilities: this.getMetricValue(project.metrics, 'vulnerabilities') as number,
            security_rating: this.getRatingValue(project.metrics, 'security_rating'),
            security_hotspots: this.getMetricValue(project.metrics, 'security_hotspots') as number,
            security_review_rating: this.getRatingValue(project.metrics, 'security_review_rating'),
            code_smells: this.getMetricValue(project.metrics, 'code_smells') as number,
            sqale_rating: this.getRatingValue(project.metrics, 'sqale_rating'),
            coverage: this.getMetricValue(project.metrics, 'coverage') as number,
            duplicated_lines_density: this.getMetricValue(project.metrics, 'duplicated_lines_density') as number,
          };
        })
      };
      projectList.push(project);
    });

    this._projectList.next(projectList); // Update the BehaviorSubject
  }

  // Helper method to find a metric by name
  private getMetricValue(metrics: SonarQubeProjectMetricData[], metricName: string): string | number | undefined {
    const metric = metrics.find(m => m.name === metricName);
    return metric ? metric.value : undefined;
  }

  // Helper method to find a metric by name
  private getRatingValue(metrics: SonarQubeProjectMetricData[], metricName: string): string {
    if (metricName === 'security_review_rating') {
      let metric = metrics.find(m => m.name === 'vulnerabilities');
      return this.getSecurityReviewRating(metric?.value as number);
    } else {
      let metric = metrics.find(m => m.name === metricName);
      return metric?.value as string;
    }
  }

  // Method to apply conditional logic for security review rating
  private getSecurityReviewRating(value: number): string {
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

  private getCircleValue(coverage: string | number | undefined): string {
    if (!coverage) return '0';
    return ((coverage as number / 100) * 100).toFixed(2);
  }

  // Helper method to check if alert status is passed
  private isAlertStatusPassed(metrics: SonarQubeProjectMetricData[]): boolean {
    return this.getMetricValue(metrics, 'alert_status') === 'passed';
  }

}
