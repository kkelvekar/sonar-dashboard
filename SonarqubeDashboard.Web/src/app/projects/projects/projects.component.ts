import { Component } from '@angular/core';
import { FilterCriteria } from '../shared/interfaces/filter-criteria';
import { ProjectService } from './projects.service';


@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent {
  filterCriteria: FilterCriteria = {};

  constructor(private projectService: ProjectService) {
  }

  onFilterChange(criteria: FilterCriteria) {
    this.filterCriteria = criteria;
    this.projectService.resetFilters$.next(); // Emit an event to reset filters
  }

  onSearchChange(searchTerm: string) {
    this.filterCriteria = { ...this.filterCriteria, searchTerm };
  }

  onGroupChange(group: string) {
    this.filterCriteria = { ...this.filterCriteria, group };
  }

  onSortChange(sortBy: string) {
    this.filterCriteria = { ...this.filterCriteria, sortBy };
  }
}
