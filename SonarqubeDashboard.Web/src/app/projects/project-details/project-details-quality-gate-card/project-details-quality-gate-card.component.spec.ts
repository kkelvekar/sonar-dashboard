import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectDetailsQualityGateCardComponent } from './project-details-quality-gate-card.component';

describe('ProjectDetailsQualityGateCardComponent', () => {
  let component: ProjectDetailsQualityGateCardComponent;
  let fixture: ComponentFixture<ProjectDetailsQualityGateCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProjectDetailsQualityGateCardComponent]
    });
    fixture = TestBed.createComponent(ProjectDetailsQualityGateCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
