import { TestBed } from '@angular/core/testing';

import { SonarQubeProjectService } from './sonarqube-project.service';

describe('ProjectService', () => {
  let service: SonarQubeProjectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SonarQubeProjectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
