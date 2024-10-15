import { Component } from '@angular/core';
import { ProjectGroup } from '../interfaces/projectGroup';
import { ProjectService } from '../services/project.service';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.css'
})
export class ProjectListComponent {

  projectGroups!: ProjectGroup[];

  constructor(private projectService: ProjectService) {
    //this.projectGroups = mockProjectGroups;
    this.projectService.getProjectsByGroup().subscribe((projectGroups: ProjectGroup[]) => this.projectGroups = projectGroups);
  }
}
