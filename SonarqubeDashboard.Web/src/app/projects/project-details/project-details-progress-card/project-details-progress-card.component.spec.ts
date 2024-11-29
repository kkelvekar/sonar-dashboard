import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectDetailsProgressCardComponent } from './project-details-progress-card.component';

describe('ProjectDetailsProgressCardComponent', () => {
  let component: ProjectDetailsProgressCardComponent;
  let fixture: ComponentFixture<ProjectDetailsProgressCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProjectDetailsProgressCardComponent]
    });
    fixture = TestBed.createComponent(ProjectDetailsProgressCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
