import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectDetailsMetricCardComponent } from './project-details-metric-card.component';

describe('ProjectDetailsMetricCardComponent', () => {
  let component: ProjectDetailsMetricCardComponent;
  let fixture: ComponentFixture<ProjectDetailsMetricCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProjectDetailsMetricCardComponent]
    });
    fixture = TestBed.createComponent(ProjectDetailsMetricCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
