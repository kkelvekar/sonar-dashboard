import { Component, Input } from '@angular/core';
import { Project } from '../interfaces/project';

@Component({
  selector: 'app-project-item',
  templateUrl: './project-item.component.html',
  styleUrl: './project-item.component.css'
})
export class ProjectItemComponent {
  @Input()
  projectItem!: Project;

  // Helper method to find a metric by name
  getMetricValue(metricName: string): string | number | undefined {
    const metric = this.projectItem.metrics.find(m => m.name === metricName);
    return metric ? metric.value : undefined;
  }

  // Helper method to check if alert status is passed
  isAlertStatusPassed(): boolean {
    return this.getMetricValue('alert_status') === 'passed';
  }
}
