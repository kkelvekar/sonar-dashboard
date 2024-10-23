import { Component, OnInit } from '@angular/core';
import { FilterCriteria } from './projects/shared/interfaces/filter-criteria';
import { SonarQubeProjectService } from './shared/services/sonarqube-project.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'] // Note: styleUrls instead of styleUrl
})
export class AppComponent implements OnInit {

  title: string = '';
  filterCriteria: FilterCriteria = {};

  constructor(private sonarQubeProjectService: SonarQubeProjectService) {

  }

  ngOnInit(): void {
    this.sonarQubeProjectService.getProjectsByGroup().subscribe();
  }

  onFilterChange(criteria: FilterCriteria) {
    this.filterCriteria = criteria;
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
