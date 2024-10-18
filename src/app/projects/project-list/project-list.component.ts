import { Component, Input } from '@angular/core';
import { ProjectGroup } from '../interfaces/projectGroup';
import { ProjectService } from '../services/project.service';
import * as _ from 'lodash';
import { Project } from '../interfaces/project';
import { FilterCriteria } from '../interfaces/filter-criteria';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})
export class ProjectListComponent {

  @Input() filterCriteria: FilterCriteria = {};

  private _projectGroups: ProjectGroup[] = [];

  noProjectsFound: boolean = false;

  constructor(private projectService: ProjectService) {
    this.projectService.getProjectsByGroup().subscribe((projectGroups: ProjectGroup[]) => {
      this._projectGroups = projectGroups;
    });
  }

  // Getter for filtered and sorted project groups
  get projectGroups(): ProjectGroup[] {
    let filteredGroups = this._projectGroups || [];

    // Apply filters and sorting
    filteredGroups = this.applyFilters(filteredGroups);
    filteredGroups = this.sortProjectsWithinGroups(filteredGroups);
    filteredGroups = this.sortGroupsByMetric(filteredGroups);

    // Set flag to determine if any projects are found
    this.noProjectsFound = filteredGroups.length === 0;
    return filteredGroups;
  }

  // Apply all filters based on filter criteria
  private applyFilters(groups: ProjectGroup[]): ProjectGroup[] {
    let filteredGroups = groups;

    if (this.filterCriteria.searchTerm) {
      filteredGroups = this.applySearchFilter(filteredGroups, this.filterCriteria.searchTerm);
    }

    if (this.filterCriteria.group) {
      filteredGroups = this.applyGroupFilter(filteredGroups, this.filterCriteria.group);
    }

    if (this.filterCriteria.qualityGate) {
      filteredGroups = this.applyQualityGateFilter(filteredGroups, this.filterCriteria.qualityGate);
    }

    // Apply ratings filters
    filteredGroups = this.applyRatingsFilters(filteredGroups, this.filterCriteria);

    return filteredGroups;
  }

  // Apply search term filter
  private applySearchFilter(groups: ProjectGroup[], searchTerm: string): ProjectGroup[] {
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
      .filter((group): group is ProjectGroup => group !== null);
  }

  // Apply group filter
  private applyGroupFilter(groups: ProjectGroup[], groupName: string): ProjectGroup[] {
    return groups.filter(group => group.name === groupName);
  }

  // Apply quality gate filter
  private applyQualityGateFilter(groups: ProjectGroup[], status: string): ProjectGroup[] {
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
      .filter((group): group is ProjectGroup => group !== null);
  }

  // Apply ratings filters
  private applyRatingsFilters(groups: ProjectGroup[], criteria: FilterCriteria): ProjectGroup[] {
    return groups
      .map(group => {
        const filteredProjects = group.projects.filter(project => {
          // Check each rating filter
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

          // Project matches if it satisfies all provided rating filters
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
      .filter((group): group is ProjectGroup => group !== null);
  }

  // Helper to check if a project matches the rating criteria
  private matchesRating(project: Project, metricName: string, ratings?: string[]): boolean | undefined {
    if (!ratings || ratings.length === 0) {
      return true;
    }

    const metric = project.metrics.find(m => m.name === metricName);
    return metric && ratings.includes(metric.value.toString());
  }

  // Sort projects within each group based on selected metric
  private sortProjectsWithinGroups(groups: ProjectGroup[]): ProjectGroup[] {
    if (!this.filterCriteria.sortBy) {
      return groups;
    }

    return groups.map(group => {
      const sortedProjects = _.orderBy(
        group.projects,
        project => this.getMetricValue(project, this.filterCriteria.sortBy),
        'desc'
      );
      return { ...group, projects: sortedProjects };
    });
  }

  // Sort groups based on the highest metric value of their projects
  private sortGroupsByMetric(groups: ProjectGroup[]): ProjectGroup[] {
    if (!this.filterCriteria.sortBy) {
      return groups;
    }

    return _.orderBy(
      groups,
      group => this.getGroupMetricValue(group, this.filterCriteria.sortBy),
      'desc'
    );
  }

  // Helper to get metric value from a project
  private getMetricValue(project: Project, metricName: string | undefined): number {
    const metric = project.metrics.find(m => m.name === metricName);
    return this.parseMetricValue(metric ? metric.value : '0');
  }

  // Helper to get the highest metric value from a group's projects
  private getGroupMetricValue(group: ProjectGroup, metricName: string | undefined): number {
    if (!group.projects.length) {
      return 0;
    }
    const highestValue = _.maxBy(group.projects, project =>
      this.getMetricValue(project, metricName)
    );
    return highestValue ? this.getMetricValue(highestValue, metricName) : 0;
  }

  // Function to parse metric values
  private parseMetricValue(value: string | number): number {
    if (typeof value === 'number') {
      return value;
    }

    if (!value) {
      return 0;
    }

    let stringValue = value.toString().trim();

    // Remove '%' sign
    if (stringValue.endsWith('%')) {
      stringValue = stringValue.slice(0, -1);
    }

    // Handle 'k' and 'M' suffixes
    let multiplier = 1;
    if (stringValue.endsWith('k')) {
      multiplier = 1000;
      stringValue = stringValue.slice(0, -1);
    } else if (stringValue.endsWith('M')) {
      multiplier = 1000000;
      stringValue = stringValue.slice(0, -1);
    }

    // Remove commas
    stringValue = stringValue.replace(/,/g, '');

    const num = parseFloat(stringValue);
    return isNaN(num) ? 0 : num * multiplier;
  }
}
