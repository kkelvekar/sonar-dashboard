import { Component } from '@angular/core';
import { FilterCriteria } from '../shared/interfaces/filter-criteria';
import { SonarQubeProjectService } from '../../shared/services/sonarqube-project.service';
import { ProjectDataService } from '../shared/services/project.data.service';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent {
  filterCriteria: FilterCriteria = {};

  constructor(private sonarQubeProjectService: SonarQubeProjectService, private projectDataService: ProjectDataService) {
  }

  ngOnInit(): void {
    this.sonarQubeProjectService.getProjectsByGroup().subscribe();
  }

  onFilterChange(criteria: FilterCriteria) {
    this.filterCriteria = criteria;
    this.projectDataService.resetFilters$.next(); // Emit an event to reset filters
  }

  // Add these methods to handle individual filter changes
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
