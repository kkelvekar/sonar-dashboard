import { Component, Input } from '@angular/core';

@Component({
  selector: 'project-details-progress-card',
  templateUrl: './project-details-progress-card.component.html',
  styleUrls: ['./project-details-progress-card.component.css']
})
export class ProjectDetailsProgressCardComponent {
  @Input() title: string = '';
  @Input() value: number = 0;
  @Input() displayValue: string = '0%';

  get progressBarClass(): string {
    if (this.value < 30) {
      return 'bg-danger';
    } else if (this.value >= 30 && this.value < 80) {
      return 'bg-warning';
    } else {
      return 'bg-success';
    }
  }
}
