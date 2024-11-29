import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SonarQubeProjectGroupData } from './sonarqube-project.data';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SonarQubeProjectService {
  constructor(private http: HttpClient) { }

  getProjectsByGroup(): Observable<SonarQubeProjectGroupData[]> {
    const url = `${environment.projectApiUrl}/api/projects`;
    let data = this.http.get<SonarQubeProjectGroupData[]>(url).pipe(
      catchError(error => {
        console.error('Error fetching projects by group:', error);
        return of([]);
      }),
    );
    return data;
  }
}
