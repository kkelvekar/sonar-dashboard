import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectToolbarFilterComponent } from './project-toolbar-filter.component';

describe('FilterToolbarComponent', () => {
  let component: ProjectToolbarFilterComponent;
  let fixture: ComponentFixture<ProjectToolbarFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProjectToolbarFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectToolbarFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
