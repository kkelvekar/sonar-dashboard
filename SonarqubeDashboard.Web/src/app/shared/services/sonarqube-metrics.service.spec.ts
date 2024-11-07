import { TestBed } from '@angular/core/testing';
import { SonarQubeMetricsService } from './sonarqube-metrics.service';

describe('SonarQubeMetricsServiceService', () => {
  let service: SonarQubeMetricsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SonarQubeMetricsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
