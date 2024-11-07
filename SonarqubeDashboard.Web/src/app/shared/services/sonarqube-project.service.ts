import { Injectable } from '@angular/core';
import { SonarQubeMetricsService } from './sonarqube-metrics.service';
import { HttpClient } from '@angular/common/http';
import { Observable, of, mergeMap, groupBy, toArray } from 'rxjs';
import { map, tap, shareReplay } from 'rxjs/operators';
import { SonarQubeProjectData, SonarQubeProjectGroupData } from './sonarqube-project.data';
import { SonarQubeProjectDataService } from './sonarqube-project-data.service';

@Injectable({
  providedIn: 'root'
})
export class SonarQubeProjectService {

  private jsonUrl = 'assets/projects.json';

  constructor(
    private sonarqubeMetricService: SonarQubeMetricsService,
    private sonarQubeProjectDataService: SonarQubeProjectDataService,
    private http: HttpClient
  ) { }

  getProjectsByGroup(): Observable<any> {
    let data = this.http.get<SonarQubeProjectGroupData[]>('https://localhost:7293/api/sonarqube-project/projects-by-group');
    data.subscribe(result => this.sonarQubeProjectDataService.updateData(result));
    return data;
  }

  _getProjectsByGroup(): Observable<any> {
    return this.getProjectData().pipe(
      mergeMap(projects => of(...projects)),
      mergeMap(project => this.sonarqubeMetricService.getProjectMetrics(project.projectKey, project.projectToken).pipe(
        map(metrics => ({ ...project, metrics })),
      )),
      groupBy(project => project.projectGroup),
      mergeMap(group => group.pipe(
        toArray(),
        map(projects => ({ name: group.key, projects }))
      )),
      toArray(),
      tap(result => {
        //console.log('Service result:', JSON.stringify(result, null, 2));
        this.sonarQubeProjectDataService.updateData(result);
      }),
      shareReplay(1)
    );
  }

  private getProjectData(): Observable<SonarQubeProjectData[]> {
    return this.http.get<any[]>(this.jsonUrl).pipe(
      map(data => data.map(item => ({
        projectKey: item["project_key"],
        projectName: item["project_name"],
        projectGroup: item["project_group"],
        projectToken: item["project_token"],
        metrics: []
      })))
    );
  }
}
