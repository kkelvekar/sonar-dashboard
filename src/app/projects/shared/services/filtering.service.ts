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
          const matchesCoverage = this.matchesRating(
            project,
            'coverage',
            criteria.coverageRatings
          );
          const matchesDuplication = this.matchesRating(
            project,
            'duplicated_lines_density',
            criteria.duplicationRatings
          );

          return (
            (criteria.reliabilityRatings ? matchesReliability : true) &&
            (criteria.securityRatings ? matchesSecurity : true) &&
            (criteria.maintainabilityRatings ? matchesMaintainability : true) &&
            (criteria.coverageRatings ? matchesCoverage : true) &&
            (criteria.duplicationRatings ? matchesDuplication : true)
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
