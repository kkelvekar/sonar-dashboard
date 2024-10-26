// project-list.component.ts
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FilterCriteria } from '../shared/interfaces/filter-criteria';
import { FilteringService } from '../shared/services/filtering.service';
import { SortingService } from '../shared/services/sorting.service';
import { ProjectDataService } from '../shared/services/project.data.service';
import { ProjectList } from './project-list';
import { ProjectItem } from './project-item/project-item';
import _ from 'lodash';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})
export class ProjectListComponent implements OnInit {

  @Input() filterCriteria: FilterCriteria = {};

  projectList: ProjectList[] = [];
  flattenedProjectItems: ProjectItem[] = [];
  noProjectsFound: boolean = false;

  currentPage: number = 1;
  itemsPerPage: number = 2;
  totalItems: number = 0;

  constructor(
    private projectDataService: ProjectDataService,
    private filteringService: FilteringService,
    private sortingService: SortingService
  ) { }

  ngOnInit() {
    this.projectDataService.projectList$.subscribe(data => {
      this.projectList = data;
      this.flattenedProjectItems = this.flattenProjectItems(data);
      this.totalItems = this.flattenedProjectItems.length;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['filterCriteria']) {
      this.currentPage = 1; // Reset to first page
    }
  }

  get processedProjectGroupList(): ProjectList[] {
    let processedList = this.applyFiltersAndSorting(this.projectList || []);
    this.noProjectsFound = processedList.length === 0;
    let paginatedItems = this.paginate(this.flattenProjectItems(processedList));
    this.totalItems = this.flattenProjectItems(processedList).length; // Update totalItems here
    return this.groupByProjectGroup(paginatedItems);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  private applyFiltersAndSorting(projectList: ProjectList[]): ProjectList[] {
    let filteredList = this.filteringService.applyFilters(projectList, this.filterCriteria);
    filteredList = this.sortingService.sortProjectsWithinGroups(filteredList, this.filterCriteria.sortBy);
    return this.sortingService.sortGroupsByMetric(filteredList, this.filterCriteria.sortBy);
  }

  private flattenProjectItems(projectList: ProjectList[]): any[] {
    return _.flatMap(projectList, projects =>
      projects.projectItems.map(projectItem => ({
        ...projectItem,
        projectGroupName: projects.projectGroup.name,
        projectGroup: projects.projectGroup
      }))
    );
  }

  private paginate(items: ProjectItem[]): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return items.slice(start, end);
  }

  private groupByProjectGroup(items: any[]): ProjectList[] {
    return _.chain(items)
      .groupBy('projectGroupName')
      .map((projectItems, groupName) => ({
        projectGroup: projectItems[0].projectGroup,
        projectItems: projectItems.map(item => {
          const { projectGroupName, projectGroupMetrics, ...rest } = item;
          return rest;
        })
      }))
      .value() as ProjectList[];
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }
}
