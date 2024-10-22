import { AfterViewInit, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { SonarQubeProjectService } from '../../shared/services/sonarqube-project.service';
import { SortOption, SortOptions } from './toolbar-filter-data';
import { SonarQubeProjectGroupData } from '../../shared/services/sonarqube-project.data';
import { SonarQubeProjectDataService } from '../../shared/services/sonarqube-project-data.service';

@Component({
  selector: 'project-toolbar-filter',
  templateUrl: './project-toolbar-filter.component.html',
  styleUrl: './project-toolbar-filter.component.css'
})
export class ProjectToolbarFilterComponent {
  searchTerm: string = '';
  selectedGroup: string = '';
  projectGroups: string[] = [];
  selectedSort: string = '';
  sortOptions: SortOption[] = [];

  @Output() searchChange = new EventEmitter<string>();
  @Output() groupChange = new EventEmitter<string>();
  @Output() sortChange = new EventEmitter<string>();

  constructor(private projectService: SonarQubeProjectService, private sonarQubeProjectDataService: SonarQubeProjectDataService, ){
    this.sortOptions = SortOptions;
    this.sonarQubeProjectDataService.projectData$.subscribe((projectGroups: SonarQubeProjectGroupData[]) => {
      this.projectGroups = projectGroups.map(group => group.name);
    });
  }

  onSearchChange(value: string) {
    this.searchChange.emit(value);
  }

  onGroupChange(groupName: string) {
    this.groupChange.emit(groupName);  // Emit the selected group
  }

  onSortChange(value: string) {
    this.sortChange.emit(value);
  }
}
