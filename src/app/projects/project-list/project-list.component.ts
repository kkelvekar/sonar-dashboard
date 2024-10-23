// project-list.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { SonarQubeProjectGroupData } from '../../shared/services/sonarqube-project.data';
import { SonarQubeProjectDataService } from '../../shared/services/sonarqube-project-data.service';
import { FilterCriteria } from '../shared/interfaces/filter-criteria';
import { FilteringService } from '../services/filtering.service';
import { SortingService } from '../services/sorting.service';
import { ProjectDataService } from '../services/project.data.service';
import { ProjectList } from './project-list';


@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})
export class ProjectListComponent implements OnInit {

  @Input() filterCriteria: FilterCriteria = {};

  projectList: ProjectList[] = [];
  noProjectsFound: boolean = false;

  constructor(
    private projectDataService: ProjectDataService,
    private filteringService: FilteringService,
    private sortingService: SortingService // Inject SortingService
  ) { }

  ngOnInit() {
    this.projectDataService.projectList$.subscribe(data => {
      this.projectList = data;
    });
  }

  get processedProjectGroupList(): ProjectList[] {
    let _processedProjectGroupList = this.projectList || [];

    _processedProjectGroupList = this.filteringService.applyFilters(_processedProjectGroupList, this.filterCriteria);
    _processedProjectGroupList = this.sortingService.sortProjectsWithinGroups(_processedProjectGroupList, this.filterCriteria.sortBy); // Use SortingService
    _processedProjectGroupList = this.sortingService.sortGroupsByMetric(_processedProjectGroupList, this.filterCriteria.sortBy); // Use SortingService

    this.noProjectsFound = _processedProjectGroupList.length === 0;
    return _processedProjectGroupList;
  }
}
