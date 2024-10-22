// filtering.service.ts
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { SonarQubeProjectData, SonarQubeProjectGroupData } from '../../shared/services/sonarqube-project.data';

@Injectable({
  providedIn: 'root'
})
export class FilteringService {

  constructor() { }

  applyFilters(groups: SonarQubeProjectGroupData[], criteria: any): SonarQubeProjectGroupData[] {
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

  applySearchFilter(groups: SonarQubeProjectGroupData[], searchTerm: string): SonarQubeProjectGroupData[] {
    const lowerFilter = searchTerm.toLowerCase();

    return groups
      .map(group => {
        const filteredProjects = group.projects.filter(project =>
          project.projectName.toLowerCase().includes(lowerFilter)
        );
        const groupMatches = group.name.toLowerCase().includes(lowerFilter);

        if (filteredProjects.length > 0 || groupMatches) {
          return { ...group, projects: filteredProjects };
        }
        return null;
      })
      .filter((group): group is SonarQubeProjectGroupData => group !== null);
  }

  applyGroupFilter(groups: SonarQubeProjectGroupData[], groupName: string): SonarQubeProjectGroupData[] {
    return groups.filter(group => group.name === groupName);
  }

  applyQualityGateFilter(groups: SonarQubeProjectGroupData[], status: string): SonarQubeProjectGroupData[] {
    return groups
      .map(group => {
        const filteredProjects = group.projects.filter(project => {
          const metric = project.metrics.find(m => m.name === 'alert_status');
          return metric && metric.value === status;
        });
        if (filteredProjects.length > 0) {
          return { ...group, projects: filteredProjects };
        }
        return null;
      })
      .filter((group): group is SonarQubeProjectGroupData => group !== null);
  }

  applyRatingsFilters(groups: SonarQubeProjectGroupData[], criteria: any): SonarQubeProjectGroupData[] {
    return groups
      .map(group => {
        const filteredProjects = group.projects.filter(project => {
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
          return { ...group, projects: filteredProjects };
        }
        return null;
      })
      .filter((group): group is SonarQubeProjectGroupData => group !== null);
  }

  matchesRating(project: SonarQubeProjectData, metricName: string, ratings?: string[]): boolean | undefined {
    if (!ratings || ratings.length === 0) {
      return true;
    }

    const metric = project.metrics.find(m => m.name === metricName);
    return metric && ratings.includes(metric.value.toString());
  }
}
