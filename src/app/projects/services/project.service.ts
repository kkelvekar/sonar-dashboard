import { Injectable } from '@angular/core';
import { SonarQubeMetricsService } from './sonarqube-metrics.service';
import { Project } from '../interfaces/project';
import { ProjectGroup } from '../interfaces/projectGroup';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { map, switchMap, tap, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  private projectDataSubject = new BehaviorSubject<ProjectGroup[]>([]);
  projectData$ = this.projectDataSubject.asObservable();

  private projectDataObservable: Observable<ProjectGroup[]> | null = null;

  private jsonUrl = 'projects.json';

  constructor(
    private sonarqubeMetricService: SonarQubeMetricsService,
    private http: HttpClient
  ) { }

  getProjectsByGroup(): Observable<ProjectGroup[]> {
    if (!this.projectDataObservable) {
      this.projectDataObservable = this.getProjectData().pipe(
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
            tap(result => {
              console.log('Service result:', JSON.stringify(result, null, 2));
              this.projectDataSubject.next(result);
            })
          );
        }),
        shareReplay(1) // Ensures all subscribers share the same data and HTTP request
      );
    }
    return this.projectDataObservable;
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
