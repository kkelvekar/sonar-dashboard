import { AfterViewInit, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ProjectService } from '../services/project.service';
import { ProjectGroup } from '../interfaces/projectGroup';

@Component({
  selector: 'project-toolbar-filter',
  templateUrl: './project-toolbar-filter.component.html',
  styleUrl: './project-toolbar-filter.component.css'
})
export class ProjectToolbarFilterComponent {
  searchTerm: string = '';
  selectedGroup: string = '';
  projectGroups: string[] = [];

  @Output() searchChange = new EventEmitter<string>();
  @Output() groupChange = new EventEmitter<string>();

  constructor(private projectService: ProjectService){
    this.projectService.projectData$.subscribe((projectGroups: ProjectGroup[]) => {
      this.projectGroups = projectGroups.map(group => group.name);
    });
  }

  onSearchChange(value: string) {
    this.searchChange.emit(value);
  }

  onGroupChange(groupName: string) {
    this.groupChange.emit(groupName);  // Emit the selected group
  }
}
