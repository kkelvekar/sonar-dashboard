import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectSidebarFilterComponent } from './project-sidebar-filter.component';

describe('SidebarComponent', () => {
  let component: ProjectSidebarFilterComponent;
  let fixture: ComponentFixture<ProjectSidebarFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProjectSidebarFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectSidebarFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
