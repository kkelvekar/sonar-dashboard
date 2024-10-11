import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectListComponent } from './project-list/project-list.component';
import { ProjectItemComponent } from './project-item/project-item.component';
import { ProjectGroupComponent } from './project-group/project-group.component';

@NgModule({
  declarations: [
    ProjectListComponent,
    ProjectItemComponent,
    ProjectGroupComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ProjectListComponent,
    ProjectItemComponent,
    ProjectGroupComponent
  ]
})
export class ProjectsModule { }
