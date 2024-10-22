import { Component, Input } from '@angular/core';
import { SonarQubeProjectGroupData } from '../../shared/services/sonarqube-project.data';

@Component({
  selector: 'app-project-group',
  templateUrl: './project-group.component.html',
  styleUrl: './project-group.component.css'
})
export class ProjectGroupComponent {

  @Input()
  projectGroup!: SonarQubeProjectGroupData;
}
