import { Component, Output, EventEmitter } from '@angular/core';
import { FilterCriteria } from '../interfaces/filter-criteria';

@Component({
  selector: 'project-sidebar-filter',
  templateUrl: './project-sidebar-filter.component.html',
  styleUrls: ['./project-sidebar-filter.component.css']
})
export class ProjectSidebarFilterComponent {
  filterCriteria: FilterCriteria = {};

  @Output() filterChange = new EventEmitter<FilterCriteria>();

  selectedQualityGate: 'passed' | 'failed' | null = null;
  selectedRatings: { [category: string]: Set<string> } = {};

  // Handle Quality Gate selection
  onQualityGateChange(status: 'passed' | 'failed') {
    if (this.selectedQualityGate === status) {
      // Deselect if already selected
      this.selectedQualityGate = null;
      this.filterCriteria.qualityGate = undefined;
    } else {
      this.selectedQualityGate = status;
      this.filterCriteria.qualityGate = status;
    }
    this.emitFilterChange();
  }

  isQualityGateSelected(status: 'passed' | 'failed'): boolean {
    return this.selectedQualityGate === status;
  }

  // Handle rating selection
  toggleRating(category: string, rating: string) {
    if (!this.selectedRatings[category]) {
      this.selectedRatings[category] = new Set<string>();
    }
    const ratingsSet = this.selectedRatings[category];
    if (ratingsSet.has(rating)) {
      ratingsSet.delete(rating);
    } else {
      ratingsSet.add(rating);
    }
    const ratingsArray = Array.from(ratingsSet);
    this.onRatingChange(category, ratingsArray);
  }

  isRatingSelected(category: string, rating: string): boolean {
    return this.selectedRatings[category]?.has(rating) ?? false;
  }

  onRatingChange(category: string, ratings: string[]) {
    switch (category) {
      case 'reliability':
        this.filterCriteria.reliabilityRatings = ratings.length > 0 ? ratings : undefined;
        break;
      case 'security':
        this.filterCriteria.securityRatings = ratings.length > 0 ? ratings : undefined;
        break;
      case 'maintainability':
        this.filterCriteria.maintainabilityRatings = ratings.length > 0 ? ratings : undefined;
        break;
      // Add cases for other categories if needed
    }
    this.emitFilterChange();
  }

  clearFilters() {
    this.filterCriteria = {};
    this.selectedQualityGate = null;
    this.selectedRatings = {};
    this.emitFilterChange();
  }

  private emitFilterChange() {
    this.filterChange.emit({ ...this.filterCriteria });
  }
}
