import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SonarQubeProjectGroupData } from './sonarqube-project.data';

@Injectable({
  providedIn: 'root'
})
export class SonarQubeProjectDataService {

  private projectDataSubject = new BehaviorSubject<SonarQubeProjectGroupData[] | null>(null);
  projectData$: Observable<SonarQubeProjectGroupData[] | null> = this.projectDataSubject.asObservable();

  updateData(data: SonarQubeProjectGroupData[]) {
    this.projectDataSubject.next(data);
  }

}
