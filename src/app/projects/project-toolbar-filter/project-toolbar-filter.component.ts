import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { SortOption, SortOptions } from './toolbar-filter-data';
import { SonarQubeProjectGroupData } from '../../shared/services/sonarqube-project.data';
import { SonarQubeProjectDataService } from '../../shared/services/sonarqube-project-data.service';
import { FilterCriteria } from '../shared/interfaces/filter-criteria';
import { ProjectDataService } from '../shared/services/project.data.service';

@Component({
  selector: 'project-toolbar-filter',
  templateUrl: './project-toolbar-filter.component.html',
  styleUrl: './project-toolbar-filter.component.css'
})
export class ProjectToolbarFilterComponent implements OnInit {
  searchTerm: string = '';
  selectedGroup: string = '';
  projectGroups: string[] = [];
  selectedSort: string = '';
  sortOptions: SortOption[] = [];

  @Output() searchChange = new EventEmitter<string>();
  @Output() groupChange = new EventEmitter<string>();
  @Output() sortChange = new EventEmitter<string>();

  constructor(private sonarQubeProjectDataService: SonarQubeProjectDataService, private projectDataService: ProjectDataService){
  }

  ngOnInit(): void {
    this.sortOptions = SortOptions;
    this.sonarQubeProjectDataService.projectData$.subscribe((projectGroups: SonarQubeProjectGroupData[]) => {
      this.projectGroups = projectGroups.map(group => group.name);
    });
    if (this.projectDataService.resetFilters$) {
      this.projectDataService.resetFilters$.subscribe(() => {
        this.resetFilterToolbar();
      });
    }
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

  private resetFilterToolbar() {
    this.searchTerm = '';
    this.selectedGroup = '';
    this.selectedSort = '';
  }
}
