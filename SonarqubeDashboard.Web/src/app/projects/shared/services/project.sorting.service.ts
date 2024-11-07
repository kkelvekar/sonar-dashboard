// sorting.service.ts
import { Injectable } from '@angular/core';

import * as _ from 'lodash';
import { ProjectItem } from '../../project-list/project-item/project-item';
import { ProjectList } from '../../project-list/project-list';
import { ProjectGroup } from '../../project-list/project-group/project-group';

@Injectable({
  providedIn: 'root'
})
export class ProjectSortingService {

  constructor() { }

  sortProjectsWithinGroups(groups: ProjectList[], sortBy: string | undefined): ProjectList[] {
    if (!sortBy) {
      return groups;
    }
    console.log('Sorting by:', sortBy);
    return groups.map(group => ({
      ...group,
      projectItems: _.orderBy(group.projectItems, project => this.getMetricValue(project, sortBy), 'desc')
    }));
  }

  sortGroupsByMetric(groups: ProjectList[], sortBy: string | undefined): ProjectList[] {
    if (!sortBy) {
      return groups;
    }
    const result = _.orderBy(groups, group => this.getGroupMetricValue(group.projectGroup, sortBy), 'desc');
    return result;
  }

  private getMetricValue(item: ProjectItem, metricName: string): number {
    console.log(JSON.stringify(item));
    const value = item[metricName as keyof ProjectItem];
    return this.parseMetricValue(value);
  }

  private getGroupMetricValue(item: ProjectGroup, metricName: string): number {
    console.log(JSON.stringify(item));
    const value = item[metricName as keyof ProjectGroup];
    return this.parseMetricValue(value);
  }

  parseMetricValue(value: string | number | undefined): number {
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
