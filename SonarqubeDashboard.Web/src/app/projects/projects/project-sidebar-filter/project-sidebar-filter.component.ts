import { Component, Output, EventEmitter } from '@angular/core';
import { FilterCriteria } from '../../shared/interfaces/filter-criteria';
import { ProjectList } from '../../project-list/project-list';
import { ProjectService } from '../projects.service';

@Component({
  selector: 'project-sidebar-filter',
  templateUrl: './project-sidebar-filter.component.html',
  styleUrls: ['./project-sidebar-filter.component.css']
})
export class ProjectSidebarFilterComponent {
  filterCriteria: FilterCriteria = {};
  projectList: ProjectList[] = [];

  coverageCounts = {
    '>=80': 0,
    '70-80': 0,
    '50-70': 0,
    '30-50': 0,
    '<30': 0
  };

  ratingCounts = {
    reliability: { 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'E': 0 },
    security: { 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'E': 0 },
    maintainability: { 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'E': 0 }
  };

  @Output() filterChange = new EventEmitter<FilterCriteria>();

  selectedQualityGate: 'passed' | 'failed' | null = null;
  selectedRatings: { [category: string]: Set<string> } = {};
  selectedCoverage: string[] = [];

  constructor(
    private projectService: ProjectService,
  ) { }

  ngOnInit() {
    this.projectService.projectList$.subscribe(data => {
      if (data !== null) {
        this.projectList = data;
        this.calculateCounts();
      }
    });
  }

  calculateCounts() {
    // Reset counts to zero
    this.coverageCounts = {
      '>=80': 0,
      '70-80': 0,
      '50-70': 0,
      '30-50': 0,
      '<30': 0
    };

    this.ratingCounts = {
      reliability: { 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'E': 0 },
      security: { 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'E': 0 },
      maintainability: { 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'E': 0 }
    };

    this.projectList.forEach(projectListItem => {
      projectListItem.projectItems.forEach(projectItem => {
        // Calculate coverage counts
        const coverage: number = parseFloat(projectItem.coverage.toString().replace('%', '') || '0');
        if (coverage >= 80) {
          this.coverageCounts['>=80']++;
        } else if (coverage >= 70) {
          this.coverageCounts['70-80']++;
        } else if (coverage >= 50) {
          this.coverageCounts['50-70']++;
        } else if (coverage >= 30) {
          this.coverageCounts['30-50']++;
        } else {
          this.coverageCounts['<30']++;
        }

        // Increment maintainability rating counts
        const sqale_rating = projectItem.sqale_rating;
        if (sqale_rating === 'A') {
          this.ratingCounts.maintainability['A']++;
        } else if (sqale_rating === 'B') {
          this.ratingCounts.maintainability['B']++;
        } else if (sqale_rating === 'C') {
          this.ratingCounts.maintainability['C']++;
        } else if (sqale_rating === 'D') {
          this.ratingCounts.maintainability['D']++;
        } else if (sqale_rating === 'E') {
          this.ratingCounts.maintainability['E']++;
        }

        // Increment security rating counts
        const security_rating = projectItem.security_rating;
        if (security_rating === 'A') {
          this.ratingCounts.security['A']++;
        } else if (security_rating === 'B') {
          this.ratingCounts.security['B']++;
        } else if (security_rating === 'C') {
          this.ratingCounts.security['C']++;
        } else if (security_rating === 'D') {
          this.ratingCounts.security['D']++;
        } else if (security_rating === 'E') {
          this.ratingCounts.security['E']++;
        }

        // Increment reliability rating counts
        const reliability_rating = projectItem.reliability_rating;
        if (reliability_rating === 'A') {
          this.ratingCounts.reliability['A']++;
        } else if (reliability_rating === 'B') {
          this.ratingCounts.reliability['B']++;
        } else if (reliability_rating === 'C') {
          this.ratingCounts.reliability['C']++;
        } else if (reliability_rating === 'D') {
          this.ratingCounts.reliability['D']++;
        } else if (reliability_rating === 'E') {
          this.ratingCounts.reliability['E']++;
        }
      });
    });
  }

  // Handle Quality Gate selection
  onQualityGateChange(status: 'passed' | 'failed') {
      if(this.selectedQualityGate === status) {
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

  isCoverageSelected(range: string): boolean {
    return this.selectedCoverage.includes(range);
  }

  toggleCoverage(range: string): void {
    const index = this.selectedCoverage.indexOf(range);
    if (index > -1) {
      this.selectedCoverage.splice(index, 1);
    } else {
      this.selectedCoverage.push(range);
    }
    this.filterCriteria.coverageRange = this.selectedCoverage.length > 0 ? this.selectedCoverage : undefined;
    this.emitFilterChange();
  }

  clearFilters() {
    this.filterCriteria = {};
    this.selectedQualityGate = null;
    this.selectedRatings = {};
    this.selectedCoverage = [];
    this.emitFilterChange();
  }

  private emitFilterChange() {
    this.filterChange.emit({ ...this.filterCriteria });
  }
}
