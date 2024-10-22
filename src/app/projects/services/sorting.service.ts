// sorting.service.ts
import { Injectable } from '@angular/core';
import { SonarQubeProjectGroupData } from '../../shared/services/sonarqube-project.data';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class SortingService {

  constructor() { }

  sortProjectsWithinGroups(groups: SonarQubeProjectGroupData[], sortBy: string | undefined): SonarQubeProjectGroupData[] {
    if (!sortBy) {
      return groups;
    }

    return groups.map(group => ({
      ...group,
      projects: _.orderBy(group.projects, project => this.getMetricValue(project, sortBy), 'desc')
    }));
  }

  sortGroupsByMetric(groups: SonarQubeProjectGroupData[], sortBy: string | undefined): SonarQubeProjectGroupData[] {
    return this.sortGroups(groups, sortBy);
  }

  private sortGroups(groups: SonarQubeProjectGroupData[], sortBy: string | undefined): SonarQubeProjectGroupData[] {
    if (!sortBy) {
      return groups;
    }

    return _.orderBy(groups, group => {
      const highestValue = _.maxBy(group.projects, project => this.getMetricValue(project, sortBy));
      return highestValue ? this.getMetricValue(highestValue, sortBy) : 0;
    }, 'desc');
  }

  private getMetricValue(item: any, metricName: string | undefined): number {
    const metric = item.metrics.find((m: { name: string; value: string | number }) => m.name === metricName);
    return this.parseMetricValue(metric ? metric.value : '0');
  }

  parseMetricValue(value: string | number): number {
    if (typeof value === 'number') {
      return value;
    }

    if (!value) {
      return 0;
    }

    const match = value.toString().trim().match(/(\d+(?:\.\d+)?)([kM])?/); // Removed '%' from regex
    if (match) {
      let num = parseFloat(match[1]);
      const unit = match[2];
      if (unit === 'k') {
        num *= 1000;
      } else if (unit === 'M') {
        num *= 1000000;
      }
      return num;
    } else {
      return 0;
    }
  }
}
