import { Component, Input } from '@angular/core';
import { ProjectGroup } from './project-group';

@Component({
  selector: 'app-project-group',
  templateUrl: './project-group.component.html',
  styleUrls: ['./project-group.component.css']
})
export class ProjectGroupComponent {

  @Input()
  projectGroup!: ProjectGroup;
}
