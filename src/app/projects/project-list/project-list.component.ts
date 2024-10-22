import { Component, Input, OnInit } from '@angular/core';
import { SonarQubeProjectGroupData } from '../../shared/services/sonarqube-project.data';
import { SonarQubeProjectDataService } from '../../shared/services/sonarqube-project-data.service';
import { FilterCriteria } from '../interfaces/filter-criteria';
import * as _ from 'lodash';
import { FilteringService } from '../services/filtering.service';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})
export class ProjectListComponent implements OnInit {

  @Input() filterCriteria: FilterCriteria = {};

  private _projectGroups: SonarQubeProjectGroupData[] = [];

  noProjectsFound: boolean = false;

  constructor(
    private sonarQubeProjectDataService: SonarQubeProjectDataService,
    private filteringService: FilteringService
  ) { }

  ngOnInit() {
    this.sonarQubeProjectDataService.projectData$.subscribe((projectGroups: SonarQubeProjectGroupData[]) => {
      this._projectGroups = projectGroups;
    });
  }

  get projectGroups(): SonarQubeProjectGroupData[] {
    let filteredGroups = this._projectGroups || [];

    filteredGroups = this.filteringService.applyFilters(filteredGroups, this.filterCriteria);
    filteredGroups = this.sortProjectsWithinGroups(filteredGroups);
    filteredGroups = this.sortGroupsByMetric(filteredGroups);

    this.noProjectsFound = filteredGroups.length === 0;
    return filteredGroups;
  }

  private sortProjectsWithinGroups(groups: SonarQubeProjectGroupData[]): SonarQubeProjectGroupData[] {
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

  private sortGroupsByMetric(groups: SonarQubeProjectGroupData[]): SonarQubeProjectGroupData[] {
    if (!this.filterCriteria.sortBy) {
      return groups;
    }

    return _.orderBy(
      groups,
      group => this.getGroupMetricValue(group, this.filterCriteria.sortBy),
      'desc'
    );
  }

  private getMetricValue(project: any, metricName: any): number { // Type 'any' used for simplicity
    const metric = project.metrics.find((m: { name: any; }) => m.name === metricName);
    return this.parseMetricValue(metric ? metric.value : '0');
  }

  private getGroupMetricValue(group: SonarQubeProjectGroupData, metricName: string | undefined): number {
    if (!group.projects.length) {
      return 0;
    }
    const highestValue = _.maxBy(group.projects, project =>
      this.getMetricValue(project, metricName)
    );
    return highestValue ? this.getMetricValue(highestValue, metricName) : 0;
  }

  private parseMetricValue(value: string | number): number {
    if (typeof value === 'number') {
      return value;
    }

    if (!value) {
      return 0;
    }

    let stringValue = value.toString().trim();

    if (stringValue.endsWith('%')) {
      stringValue = stringValue.slice(0, -1);
    }

    let multiplier = 1;
    if (stringValue.endsWith('k')) {
      multiplier = 1000;
      stringValue = stringValue.slice(0, -1);
    } else if (stringValue.endsWith('M')) {
      multiplier = 1000000;
      stringValue = stringValue.slice(0, -1);
    }

    stringValue = stringValue.replace(/,/g, '');

    const num = parseFloat(stringValue);
    return isNaN(num) ? 0 : num * multiplier;
  }
}
