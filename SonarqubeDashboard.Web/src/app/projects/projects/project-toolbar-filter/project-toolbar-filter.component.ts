import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { SortOption, SortOptions } from './toolbar-filter-data';
import _ from 'lodash';
import { ProjectService as ProjectService } from '../projects.service';

@Component({
  selector: 'project-toolbar-filter',
  templateUrl: './project-toolbar-filter.component.html',
  styleUrls: ['./project-toolbar-filter.component.css']
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

  constructor(private projectService: ProjectService) {
  }

  ngOnInit(): void {
    this.sortOptions = SortOptions;
    this.projectService.projectGroups$.subscribe((groups: string[]) => {
      if (groups) {
        this.projectGroups = groups;
      }
    });
    if (this.projectService.resetFilters$) {
      this.projectService.resetFilters$.subscribe(() => {
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
