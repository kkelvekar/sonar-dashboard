import { Injectable } from '@angular/core';
import { ProjectMetricService } from '../shared/services/project.metric.service';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ProjectGroupResponse, ProjectResponse } from './project.response';
import { ProjectGroupService } from './project-group/project.group.service';
import { ProjectList } from './project-list';
import { ProjectService } from '../projects/projects.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectListService {

  constructor(
    private projectMetricService: ProjectMetricService,
    private projectGroupService: ProjectGroupService,
    private projectService: ProjectService,
    private http: HttpClient
  ) {
  }

  getProjectList(): Observable<ProjectList[] | null> {
    const url = `${environment.projectApiUrl}/api/projects`;
    const data = this.http.get<ProjectGroupResponse[]>(url).pipe(
      catchError(error => {
        console.error('Error fetching projects by group:', error);
        return of([]); // Return an empty array if the HTTP request fails
      }),
      map(projectGroups => this.mapSonarQubeDataToProjectData(projectGroups)),
      map(projectList => {
        this.projectService.projectList$.next(projectList);
        const projectGroups = projectList.map(group => group.projectGroup.name);
        this.projectService.projectGroups$.next(projectGroups);
        return projectList;
      }),
      catchError(error => {
        console.error('Error in mapping project data:', error);
        return of(null); // Return null if mapping fails
      })
    );
    return data;
  }

  private mapSonarQubeDataToProjectData(projectGroups: ProjectGroupResponse[]) : ProjectList[] {
    const projectList: ProjectList[] = projectGroups.map(projectGroupData => this.mapProjectGroupData(projectGroupData));
    return projectList;
  }

  private mapProjectGroupData(projectGroupData: ProjectGroupResponse): ProjectList {
    return {
      projectGroup: this.mapProjectGroup(projectGroupData),
      projectItems: this.mapProjectItems(projectGroupData.projects)
    };
  }

  private mapProjectGroup(projectGroupData: ProjectGroupResponse) {
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

  private mapProjectItems(projects: ProjectResponse[]) {
    return projects.map(project => ({
      key: project.key,
      name: project.name,
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
