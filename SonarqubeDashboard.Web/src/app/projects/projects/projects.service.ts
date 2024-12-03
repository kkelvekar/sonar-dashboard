import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { ProjectList } from '../project-list/project-list';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  resetFilters$: Subject<void> = new Subject<void>();
  projectList$ = new BehaviorSubject<ProjectList[] | null>(null);
  projectGroups$ = new BehaviorSubject<string[]>([]);
}
