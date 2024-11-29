import { Component, Input } from '@angular/core';

@Component({
  selector: 'project-details-metric-card',
  templateUrl: './project-details-metric-card.component.html',
  styleUrls: ['./project-details-metric-card.component.css']
})
export class ProjectDetailsMetricCardComponent {
  @Input() iconClass: string = '';
  @Input() iconColor: string = 'text-success';
  @Input() title: string = '';
  @Input() ratingValue: string = '';
  @Input() ratingDescription: string = '';
  @Input() count: string = '0';
}
