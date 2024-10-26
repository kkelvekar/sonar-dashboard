import { Injectable } from "@angular/core";
import { ProjectList } from "../../project-list/project-list";
import { SonarQubeProjectData, SonarQubeProjectGroupData } from "../../../shared/services/sonarqube-project.data";
import { SonarQubeProjectDataService } from "../../../shared/services/sonarqube-project-data.service";
import _ from "lodash";
import { BehaviorSubject } from "rxjs";
import { ProjectMetricService } from "./project.metric.service";
import { ProjectGroupService } from "./project.group.service";

@Injectable({
  providedIn: 'root'
})
export class ProjectDataService {
  private _projectList = new BehaviorSubject<ProjectList[]>([]);
  projectList$ = this._projectList.asObservable();

  constructor(
    private sonarQubeProjectDataService: SonarQubeProjectDataService,
    private projectMetricService: ProjectMetricService,
    private projectGroupService: ProjectGroupService
  ) {
    this.sonarQubeProjectDataService.projectData$.subscribe((projectGroups: SonarQubeProjectGroupData[]) => {
      this.mapSonarQubeDataToProjectData(projectGroups);
    });
  }

  public parseLineOfCodeValue(value: string): number {
    // Remove commas and spaces
    value = value.replace(/,/g, '').trim();

    const units: { [key: string]: number } = {
      'k': 1_000,
      'K': 1_000,
      'm': 1_000_000,
      'M': 1_000_000,
      'b': 1_000_000_000,
      'B': 1_000_000_000,
    };

    const regex = /^([\d\.]+)([kKmMbB])?$/;
    const match = value.match(regex);

    if (match) {
      const num = parseFloat(match[1]);
      const unit = match[2];

      if (unit && units[unit]) {
        return num * units[unit];
      } else {
        return num;
      }
    } else {
      return 0;
    }
  }

  private mapSonarQubeDataToProjectData(projectGroups: SonarQubeProjectGroupData[]) {
    const projectList: ProjectList[] = projectGroups.map(projectGroupData => this.mapProjectGroupData(projectGroupData));
    this._projectList.next(projectList);
  }

  private mapProjectGroupData(projectGroupData: SonarQubeProjectGroupData): ProjectList {
    return {
      projectGroup: this.mapProjectGroup(projectGroupData),
      projectItems: this.mapProjectItems(projectGroupData.projects)
    };
  }

  private mapProjectGroup(projectGroupData: SonarQubeProjectGroupData) {
    return {
      name: projectGroupData.name,
      bugs: this.projectGroupService.getTotalBugCount(projectGroupData.projects),
      reliability_rating: this.projectGroupService.getAverageReliabilityRating(projectGroupData.projects),
      vulnerabilities: this.projectGroupService.getTotalVulnerabilityCount(projectGroupData.projects),
      security_rating: this.projectGroupService.getAverageSecurityRating(projectGroupData.projects),
      security_hotspots: this.projectGroupService.getTotalSecurityHotspots(projectGroupData.projects),
      security_review_rating: this.projectGroupService.getAverageSecurityReviewRating(projectGroupData.projects),
      code_smells: this.projectGroupService.getTotalCodeSmells(projectGroupData.projects),
      sqale_rating: this.projectGroupService.getAverageSqaleRating(projectGroupData.projects),
      coverage: this.projectGroupService.getAverageCoverage(projectGroupData.projects),
      duplicated_lines_density: this.projectGroupService.getAverageDuplicatedLinesDensity(projectGroupData.projects),
    };
  }

  private mapProjectItems(projects: SonarQubeProjectData[]) {
    return projects.map(project => ({
      name: project.projectName,
      qualityGate: this.projectMetricService.getMetricValue(project.metrics, 'alert_status') as string,
      //qualityGate: _.sample(['passed', 'failed']) as string,
      bugs: parseInt(this.projectMetricService.getMetricValue(project.metrics, 'bugs')),
      lineOfCode: this.projectMetricService.getMetricValue(project.metrics, 'ncloc'),
      reliability_rating: this.projectMetricService.getRatingValue(project.metrics, 'reliability_rating'),
      vulnerabilities: parseInt(this.projectMetricService.getMetricValue(project.metrics, 'vulnerabilities')),
      security_rating: this.projectMetricService.getRatingValue(project.metrics, 'security_rating'),
      security_hotspots: parseFloat(this.projectMetricService.getMetricValue(project.metrics, 'security_hotspots')),
      security_review_rating: this.projectMetricService.getRatingValue(project.metrics, 'security_review_rating'),
      code_smells: parseInt(this.projectMetricService.getMetricValue(project.metrics, 'code_smells')),
      sqale_rating: this.projectMetricService.getRatingValue(project.metrics, 'sqale_rating'),
      coverage: parseFloat(this.projectMetricService.getMetricValue(project.metrics, 'coverage').toString().replace('%', '')),
      //coverage: _.round(_.random(0, 100, true), 1),
      duplicated_lines_density:  parseFloat(this.projectMetricService.getMetricValue(project.metrics, 'duplicated_lines_density').toString().replace('%', '')),
    }));
  }
}
