import { TestBed } from '@angular/core/testing';

import { SonarQubeMetricsServiceService } from './sonarqube-metrics.service';

describe('SonarQubeMetricsServiceService', () => {
  let service: SonarQubeMetricsServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SonarQubeMetricsServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
