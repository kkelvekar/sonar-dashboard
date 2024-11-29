import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ProjectDetailService } from './project.detail.service';
import { ProjectDetails } from './project.detail';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.css']
})
export class ProjectDetailsComponent implements OnInit {

  projectDetails: ProjectDetails | null = null;
  projectKey: string | null = null;

  // Overall Metrics
  overallCoverageValue: number = 0;
  overallDuplicatedLinesDensityValue: number = 0;

  // New Code Metrics
  newCoverageValue: number = 0;
  newDuplicatedLinesDensityValue: number = 0;

  isLoading: boolean = true;

  // Arrays to hold metrics for iteration
  newCodeMetricsArray: any[] = [];
  overallCodeMetricsArray: any[] = [];

  constructor(
    private route: ActivatedRoute, // Inject ActivatedRoute
    private projectDetailService: ProjectDetailService
  ) { }

  ngOnInit(): void {
    this.projectKey = this.route.snapshot.paramMap.get('key');
    if (this.projectKey) {
      this.projectDetailService.getProjectDetails(this.projectKey)
        .subscribe(data => {
          this.projectDetails = data;
          // Access overallCodeMetrics and newCodeMetrics safely
          if (this.projectDetails) {
            if (this.projectDetails.overallCodeMetrics) {
              this.overallCoverageValue = this.parsePercentage(this.projectDetails.overallCodeMetrics.coverage);
              this.overallDuplicatedLinesDensityValue = this.parsePercentage(this.projectDetails.overallCodeMetrics.duplicatedLinesDensity);
              this.overallCodeMetricsArray = this.createMetricsArray(this.projectDetails.overallCodeMetrics);
            } else {
              // If overallCodeMetrics is null, default to zero
              this.overallCoverageValue = 0;
              this.overallDuplicatedLinesDensityValue = 0;
            }

            if (this.projectDetails.newCodeMetrics) {
              this.newCoverageValue = this.parsePercentage(this.projectDetails.newCodeMetrics.coverage);
              this.newDuplicatedLinesDensityValue = this.parsePercentage(this.projectDetails.newCodeMetrics.duplicatedLinesDensity);
              this.newCodeMetricsArray = this.createMetricsArray(this.projectDetails.newCodeMetrics);
            } else {
              // If newCodeMetrics is null, default to zero
              this.newCoverageValue = 0;
              this.newDuplicatedLinesDensityValue = 0;
            }
          }
          this.isLoading = false;
        });
    } else {
      this.isLoading = false; // No project key, stop loading
    }
  }

  /**
   * Parses a percentage string and returns its numerical value.
   * If the input is invalid or undefined, returns 0.
   * @param value The percentage string (e.g., "85.5%")
   * @returns The numerical value as a float.
   */
  private parsePercentage(value: string | undefined | null): number {
    if (!value) return 0;
    const numericValue = value.replace('%', '').trim();
    const parsed = parseFloat(numericValue);
    return isNaN(parsed) ? 0 : parsed;
  }

   /**
   * Creates an array of metric objects for use in the template.
   * @param metrics The metrics object from the project details.
   * @returns An array of metric objects.
   */
   private createMetricsArray(metrics: any): any[] {
    return [
      {
        iconClass: 'bi bi-bug',
        iconColor: 'text-success',
        title: 'Bugs',
        ratingValue: metrics.bugs?.rating?.ratingValue,
        ratingDescription: metrics.bugs?.rating?.ratingDescription,
        count: metrics.bugs?.count
      },
      {
        iconClass: 'bi bi-exclamation-triangle',
        iconColor: 'text-success',
        title: 'Vulnerabilities',
        ratingValue: metrics.vulnerabilities?.rating?.ratingValue,
        ratingDescription: metrics.vulnerabilities?.rating?.ratingDescription,
        count: metrics.vulnerabilities?.count
      },
      {
        iconClass: 'bi bi-shield-shaded',
        iconColor: 'text-success',
        title: 'Hotspots Reviewed',
        ratingValue: metrics.securityHotspots?.rating?.ratingValue,
        ratingDescription: metrics.securityHotspots?.rating?.ratingDescription,
        count: metrics.securityHotspots?.count
      },
      {
        iconClass: 'bi bi-radioactive',
        iconColor: 'text-success',
        title: 'Code Smells',
        ratingValue: metrics.codeSmells?.rating?.ratingValue,
        ratingDescription: metrics.codeSmells?.rating?.ratingDescription,
        count: metrics.codeSmells?.count
      }
    ];
  }

}
