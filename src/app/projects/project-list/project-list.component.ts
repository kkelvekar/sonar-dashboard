// project-list.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { SonarQubeProjectGroupData } from '../../shared/services/sonarqube-project.data';
import { SonarQubeProjectDataService } from '../../shared/services/sonarqube-project-data.service';
import { FilterCriteria } from '../interfaces/filter-criteria';
import { FilteringService } from '../services/filtering.service';
import { SortingService } from '../services/sorting.service';


@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})
export class ProjectListComponent implements OnInit {

  @Input() filterCriteria: FilterCriteria = {};

  private _projectGroups: SonarQubeProjectGroupData[] = [];

  noProjectsFound: boolean = false;

  constructor(
    private sonarQubeProjectDataService: SonarQubeProjectDataService,
    private filteringService: FilteringService,
    private sortingService: SortingService // Inject SortingService
  ) { }

  ngOnInit() {
    this.sonarQubeProjectDataService.projectData$.subscribe((projectGroups: SonarQubeProjectGroupData[]) => {
      this._projectGroups = projectGroups;
    });
  }

  get projectGroups(): SonarQubeProjectGroupData[] {
    let filteredGroups = this._projectGroups || [];

    filteredGroups = this.filteringService.applyFilters(filteredGroups, this.filterCriteria);
    filteredGroups = this.sortingService.sortProjectsWithinGroups(filteredGroups, this.filterCriteria.sortBy); // Use SortingService
    filteredGroups = this.sortingService.sortGroupsByMetric(filteredGroups, this.filterCriteria.sortBy); // Use SortingService

    this.noProjectsFound = filteredGroups.length === 0;
    return filteredGroups;
  }
}
