import { Component, OnInit } from '@angular/core';
import { FilterCriteria } from './projects/shared/interfaces/filter-criteria';
import { SonarQubeProjectService } from './shared/services/sonarqube-project.service';
import { ProjectDataService } from './projects/shared/services/project.data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'] // Note: styleUrls instead of styleUrl
})
export class AppComponent implements OnInit {

  title: string = '';
  filterCriteria: FilterCriteria = {};

  constructor(private sonarQubeProjectService: SonarQubeProjectService, private projectDataService: ProjectDataService) {
    this.title = 'SonarQube Project Dashboard';
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
