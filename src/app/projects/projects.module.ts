import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectListComponent } from './project-list/project-list.component';
import { ProjectItemComponent } from './project-item/project-item.component';
import { ProjectGroupComponent } from './project-group/project-group.component';
import { ProjectSidebarFilterComponent } from './project-sidebar-filter/project-sidebar-filter.component';
import { ProjectToolbarFilterComponent } from './project-toolbar-filter/project-toolbar-filter.component';
import { provideHttpClient  } from '@angular/common/http';

@NgModule({
  declarations: [
    ProjectListComponent,
    ProjectItemComponent,
    ProjectGroupComponent,
    ProjectSidebarFilterComponent,
    ProjectToolbarFilterComponent
  ],
  imports: [
    CommonModule
  ],
  providers: [
    provideHttpClient()  // Configures HttpClient with default interceptors and services
  ],
  exports: [
    ProjectListComponent,
    ProjectItemComponent,
    ProjectGroupComponent,
    ProjectSidebarFilterComponent,
    ProjectToolbarFilterComponent
  ]
})
export class ProjectsModule { }
