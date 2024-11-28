import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ProjectDetails } from './project.detail';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs/internal/observable/of';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectDetailService {
  constructor(private http: HttpClient) { }

  getProjectDetails(projectKey: string) : Observable<ProjectDetails | null> {
    const url = `${environment.projectApiUrl}/api/sonarqube-project/project-details/${projectKey}`;
    const data = this.http.get<ProjectDetails>(url).pipe(
      catchError(error => {
        console.error('Error fetching project details:', error);
        return of(null);
      }),
    );
    return data;
  }
}
