import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { FilterToolbarComponent } from './filter-toolbar/filter-toolbar.component';

@NgModule({
  declarations: [
    NavbarComponent,
    SidebarComponent,
    FilterToolbarComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    NavbarComponent,
    SidebarComponent,
    FilterToolbarComponent
  ]
})
export class SharedModule { }
