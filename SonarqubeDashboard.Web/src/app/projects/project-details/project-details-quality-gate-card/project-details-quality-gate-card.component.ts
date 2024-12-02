import { Component, Input } from '@angular/core';
import { ProjectQualityGate } from '../project.detail';

@Component({
  selector: 'project-details-quality-gate-card',
  templateUrl: './project-details-quality-gate-card.component.html',
  styleUrls: ['./project-details-quality-gate-card.component.css']
})
export class ProjectDetailsQualityGateCardComponent {
  @Input() qualityGate: ProjectQualityGate | undefined = undefined;
  @Input() lastAnalysis: string | undefined = '';
}
