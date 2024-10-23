// sorting.service.ts
import { Injectable } from '@angular/core';

import * as _ from 'lodash';
import { ProjectItem } from '../project-list/project-item/project-item';
import { ProjectList } from '../project-list/project-list';

@Injectable({
  providedIn: 'root'
})
export class SortingService {

  constructor() { }

  sortProjectsWithinGroups(groups: ProjectList[], sortBy: string | undefined): ProjectList[] {
    if (!sortBy) {
      return groups;
    }

    return groups.map(group => ({
      ...group,
      projectItems: _.orderBy(group.projectItems, project => this.getMetricValue(project, sortBy), 'desc')
    }));
  }

  sortGroupsByMetric(groups: ProjectList[], sortBy: string | undefined): ProjectList[] {
    return this.sortGroups(groups, sortBy);
  }

  private sortGroups(groups: ProjectList[], sortBy: string | undefined): ProjectList[] {
    if (!sortBy) {
      return groups;
    }

    return _.orderBy(groups, group => {
      const highestValue = _.maxBy(group.projectItems, project => this.getMetricValue(project, sortBy));
      return highestValue ? this.getMetricValue(highestValue, sortBy) : 0;
    }, 'desc');
  }

  private getMetricValue(item: ProjectItem, metricName: string): number {
    const value = item[metricName as keyof ProjectItem];
    return this.parseMetricValue(value);
  }

  parseMetricValue(value: string | number): number {
    if (typeof value === 'number') {
      return value;
    }

    if (!value) {
      return 0;
    }

    const match = value.toString().trim().match(/(\d+(?:\.\d+)?)([kM])?/);
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
