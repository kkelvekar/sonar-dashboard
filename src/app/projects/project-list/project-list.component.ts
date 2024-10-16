import { Component, Input } from '@angular/core';
import { ProjectGroup } from '../interfaces/projectGroup';
import { ProjectService } from '../services/project.service';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.css'
})
export class ProjectListComponent {

  @Input() filter: string = '';
  @Input() groupFilter: string = '';
  projectGroups!: ProjectGroup[];

  // Track if any projects are found
  get filteredProjectGroups() {
    let filteredGroups = this.projectGroups;

    // Filter by search term if provided
    if (this.filter) {
      const lowerFilter = this.filter.toLowerCase();
      filteredGroups = filteredGroups
        .map(group => {
          const filteredProjects = group.projects.filter(project => project.projectName.toLowerCase().includes(lowerFilter));
          return { ...group, projects: filteredProjects };
        })
        .filter(group => group.projects.length > 0 || group.name.toLowerCase().includes(lowerFilter));
    }

    // Filter by selected group if provided
    if (this.groupFilter) {
      filteredGroups = filteredGroups.filter(group => group.name === this.groupFilter);
    }

    // Set flag to determine if any projects are found
    this.noProjectsFound = filteredGroups.length === 0;
    return filteredGroups;
  }

  noProjectsFound: boolean = false;

  constructor(private projectService: ProjectService) {
    //this.projectGroups = mockProjectGroups;
    this.projectService.getProjectsByGroup().subscribe((projectGroups: ProjectGroup[]) => {
      this.projectGroups = projectGroups;
    });
  }
}
