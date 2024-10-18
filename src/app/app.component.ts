import { Component } from '@angular/core';
import { FilterCriteria } from './projects/interfaces/filter-criteria';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'] // Note: styleUrls instead of styleUrl
})
export class AppComponent {
  title = 'sonarqube-dashboard';

  filterCriteria: FilterCriteria = {};

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
