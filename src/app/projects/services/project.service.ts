import { Injectable } from '@angular/core';
import { SonarQubeMetricsService } from './sonarqube-metrics.service';
import { Project } from '../interfaces/project';
import { ProjectGroup } from '../interfaces/projectGroup';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  private jsonUrl = 'projects.json';

  constructor(private sonarqubeMetricService: SonarQubeMetricsService, private http: HttpClient) { }

  getProjectsByGroup(): Observable<ProjectGroup[]> {
    return this.getProjectData().pipe(
      switchMap(projects => {
        const metricsRequests = projects.map(project =>
          this.sonarqubeMetricService.getProjectMetrics(project.projectKey, project.projectToken).pipe(
            map(metrics => {
              project.metrics = metrics;
              return project;
            })
          )
        );

        // Wait for all projects' metrics to be loaded
        return forkJoin(metricsRequests).pipe(
          map(projectsWithMetrics => this.groupProjectsByGroupName(projectsWithMetrics)),
          tap(result => console.log('Service result:', JSON.stringify(result, null, 2)))
        );
      })
    );
  }

  private getProjectData(): Observable<Project[]> {
    return this.http.get<any[]>(this.jsonUrl).pipe(
      map(data => data.map(item => ({
        projectKey: item["project_key"],
        projectName: item["project_name"],
        projectGroup: item["project_group"],
        projectToken: item["project_token"],
        metrics: []  // Metrics will be fetched later
      })))
    );
  }

  private groupProjectsByGroupName(projects: Project[]): ProjectGroup[] {
    const projectGroupsMap = projects.reduce((groupMap, project) => {
      if (!groupMap[project.projectGroup]) {
        groupMap[project.projectGroup] = {
          name: project.projectGroup,
          projects: []
        };
      }
      groupMap[project.projectGroup].projects.push(project);
      return groupMap;
    }, {} as { [key: string]: ProjectGroup });

    return Object.values(projectGroupsMap);
  }
}
