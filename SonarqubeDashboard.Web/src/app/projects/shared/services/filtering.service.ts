// filtering.service.ts
import { Injectable } from '@angular/core';
import { FilterCriteria } from '../interfaces/filter-criteria';
import { ProjectItem } from '../../project-list/project-item/project-item';
import { ProjectList } from '../../project-list/project-list';

@Injectable({
  providedIn: 'root'
})
export class FilteringService {

  constructor() { }

  applyFilters(groups: ProjectList[], criteria: FilterCriteria): ProjectList[] {
    let filteredGroups = groups;

    if (criteria.searchTerm) {
      filteredGroups = this.applySearchFilter(filteredGroups, criteria.searchTerm);
    }

    if (criteria.group) {
      filteredGroups = this.applyGroupFilter(filteredGroups, criteria.group);
    }

    if (criteria.qualityGate) {
      filteredGroups = this.applyQualityGateFilter(filteredGroups, criteria.qualityGate);
    }

    if (criteria.coverageRange) {
      filteredGroups = this.applyCoverageRangeFilter(filteredGroups, criteria.coverageRange);
    }

    filteredGroups = this.applyRatingsFilters(filteredGroups, criteria);

    return filteredGroups;
  }

  applySearchFilter(groups: ProjectList[], searchTerm: string): ProjectList[] {
    const lowerFilter = searchTerm.toLowerCase();

    return groups
      .map(group => {
        const filteredProjects = group.projectItems.filter(project =>
          project.name.toLowerCase().includes(lowerFilter)
        );
        const groupMatches = group.projectGroup.name.toLowerCase().includes(lowerFilter);

        if (filteredProjects.length > 0 || groupMatches) {
          return { ...group, projectItems: filteredProjects };
        }
        return null;
      })
      .filter((group): group is ProjectList => group !== null);
  }

  applyGroupFilter(groups: ProjectList[], groupName: string): ProjectList[] {
    return groups.filter(group => group.projectGroup.name === groupName);
  }

  applyQualityGateFilter(groups: ProjectList[], status: string): ProjectList[] {
    return groups
      .map(group => {
        const filteredProjects = group.projectItems.filter(project => {
          return project.qualityGate === status;
        });
        if (filteredProjects.length > 0) {
          return { ...group, projectItems: filteredProjects };
        }
        return null;
      })
      .filter((group): group is ProjectList => group !== null);
  }

  applyCoverageRangeFilter(groups: ProjectList[], selectedCoverageRange: string[]) {
    if (selectedCoverageRange.length === 0) {
      return groups; // No filter selected, return original groups
    }

    const result = groups.map(group => {
      const filteredProjects = group.projectItems.filter(project => {
        for (const range of selectedCoverageRange) {
          if (this.isCoverageInRange(project.coverage, range)) {
            return true;
          }
        }
        return false; // No range matched
      });

      if (filteredProjects.length > 0) {
        return { ...group, projectItems: filteredProjects };
      }
      return null;
    }).filter((group): group is ProjectList => group !== null);

    return result;
  }

  private isCoverageInRange(coverage: number, range: string): boolean {
    switch (range) {
      case '>=80': return coverage >= 80;
      case '70-80': return coverage >= 70 && coverage < 80;
      case '50-70': return coverage >= 50 && coverage < 70;
      case '30-50': return coverage >= 30 && coverage < 50;
      case '<30': return coverage < 30;
      default: return false; // Handle invalid ranges
    }
  }

  applyRatingsFilters(groups: ProjectList[], criteria: FilterCriteria): ProjectList[] {
    return groups
      .map(group => {
        const filteredProjects = group.projectItems.filter(project => {
          const matchesReliability = this.matchesRating(
            project,
            'reliability_rating',
            criteria.reliabilityRatings
          );
          const matchesSecurity = this.matchesRating(
            project,
            'security_rating',
            criteria.securityRatings
          );
          const matchesMaintainability = this.matchesRating(
            project,
            'sqale_rating',
            criteria.maintainabilityRatings
          );

          return (
            (criteria.reliabilityRatings ? matchesReliability : true) &&
            (criteria.securityRatings ? matchesSecurity : true) &&
            (criteria.maintainabilityRatings ? matchesMaintainability : true)
          );
        });

        if (filteredProjects.length > 0) {
          return { ...group, projectItems: filteredProjects };
        }
        return null;
      })
      .filter((group): group is ProjectList => group !== null);
  }

  matchesRating(project: ProjectItem, metricName: keyof ProjectItem, ratings?: string[]): boolean {
    if (!ratings || ratings.length === 0) {
      return true;
    }

    const metricValue = project[metricName];

    if (metricValue === undefined || metricValue === null) {
      return false;
    }

    return ratings.includes(metricValue.toString());
  }

}
