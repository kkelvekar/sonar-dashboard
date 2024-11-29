import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectListComponent } from './project-list/project-list.component';
import { ProjectItemComponent } from './project-list/project-item/project-item.component';
import { ProjectGroupComponent } from './project-list/project-group/project-group.component';
import { ProjectSidebarFilterComponent } from './projects/project-sidebar-filter/project-sidebar-filter.component';
import { ProjectToolbarFilterComponent } from './projects/project-toolbar-filter/project-toolbar-filter.component';
import { provideHttpClient  } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ProjectsComponent } from './projects/projects.component';
import { ProjectRoutingModule } from './projects-routing.module';
import { ProjectDetailsComponent } from './project-details/project-details.component';
import { ProjectDetailsMetricCardComponent } from './project-details/project-details-metric-card/project-details-metric-card.component';
import { ProjectDetailsProgressCardComponent } from './project-details/project-details-progress-card/project-details-progress-card.component';
import { ProjectDetailsQualityGateCardComponent } from './project-details/project-details-quality-gate-card/project-details-quality-gate-card.component';

@NgModule({
  declarations: [
    ProjectListComponent,
    ProjectItemComponent,
    ProjectGroupComponent,
    ProjectSidebarFilterComponent,
    ProjectToolbarFilterComponent,
    ProjectsComponent,
    ProjectDetailsComponent,
    ProjectDetailsMetricCardComponent,
    ProjectDetailsProgressCardComponent,
    ProjectDetailsQualityGateCardComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ProjectRoutingModule
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
