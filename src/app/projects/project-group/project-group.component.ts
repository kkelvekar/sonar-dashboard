import { Component, Input } from '@angular/core';
import { ProjectGroup } from '../interfaces/projectGroup';

@Component({
  selector: 'app-project-group',
  templateUrl: './project-group.component.html',
  styleUrl: './project-group.component.css'
})
export class ProjectGroupComponent {

  @Input()
  projectGroup!: ProjectGroup;
}
