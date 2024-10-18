export interface FilterCriteria {
  searchTerm?: string;
  group?: string;
  sortBy?: string;
  qualityGate?: 'passed' | 'failed';
  reliabilityRatings?: string[];      // e.g., ['A', 'B', 'C', 'D', 'E']
  securityRatings?: string[];
  maintainabilityRatings?: string[];
  coverageRatings?: string[];
  duplicationRatings?: string[];
}
