import { Injectable } from "@angular/core";
import { ProjectList } from "../../project-list/project-list";
import { SonarQubeProjectData, SonarQubeProjectGroupData, SonarQubeProjectMetricData } from "../../../shared/services/sonarqube-project.data";
import { SonarQubeProjectDataService } from "../../../shared/services/sonarqube-project-data.service";
import _ from "lodash";
import { BehaviorSubject } from "rxjs";
import { ProjectMetricService } from "./project.metric.service";
import { ProjectGroupService } from "./project.group.service";

@Injectable({
  providedIn: 'root'
})
export class ProjectDataService {
  private _projectList = new BehaviorSubject<ProjectList[]>([]); // Use BehaviorSubject
  projectList$ = this._projectList.asObservable(); // Expose as an observable

  constructor(private sonarQubeProjectDataService: SonarQubeProjectDataService, private projectMetricService: ProjectMetricService, private projectGroupService: ProjectGroupService) {
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
          bugs: this.projectGroupService.getTotalBugCount(projectGroupData.projects),
          reliability_rating: this.projectGroupService.getAverageReliabilityRating(projectGroupData.projects),
          vulnerabilities: this.projectGroupService.getTotalVulnerabilityCount(projectGroupData.projects),
          security_rating:  this.projectGroupService.getAverageSecurityRating(projectGroupData.projects),
          security_hotspots: this.projectGroupService.getTotalSecurityHotspots(projectGroupData.projects),
          security_review_rating: this.projectGroupService.getAverageSecurityReviewRating(projectGroupData.projects),
          code_smells: this.projectGroupService.getTotalCodeSmells(projectGroupData.projects),
          sqale_rating:  this.projectGroupService.getAverageSqaleRating(projectGroupData.projects),
          coverage: this.projectGroupService.getAverageCoverage(projectGroupData.projects),
          duplicated_lines_density: this.projectGroupService.getAverageDuplicatedLinesDensity(projectGroupData.projects),
        },
        projectItems: _.map(projectGroupData.projects, (project: SonarQubeProjectData) => {
          return {
            name: project.projectName,
            qualityGate: this.projectMetricService.getMetricValue(project.metrics, 'alert_status') as string,
            bugs: this.projectMetricService.getMetricValue(project.metrics, 'bugs') as number,
            lineOfCode: this.projectMetricService.getMetricValue(project.metrics, 'ncloc') as number,
            reliability_rating: this.projectMetricService.getRatingValue(project.metrics, 'reliability_rating'),
            vulnerabilities: this.projectMetricService.getMetricValue(project.metrics, 'vulnerabilities') as number,
            security_rating: this.projectMetricService.getRatingValue(project.metrics, 'security_rating'),
            security_hotspots: this.projectMetricService.getMetricValue(project.metrics, 'security_hotspots') as number,
            security_review_rating: this.projectMetricService.getRatingValue(project.metrics, 'security_review_rating'),
            code_smells: this.projectMetricService.getMetricValue(project.metrics, 'code_smells') as number,
            sqale_rating: this.projectMetricService.getRatingValue(project.metrics, 'sqale_rating'),
            coverage: this.projectMetricService.getMetricValue(project.metrics, 'coverage') as number,
            duplicated_lines_density: this.projectMetricService.getMetricValue(project.metrics, 'duplicated_lines_density') as number,
          };
        })
      };
      projectList.push(project);
    });

    this._projectList.next(projectList); // Update the BehaviorSubject
  }

}
