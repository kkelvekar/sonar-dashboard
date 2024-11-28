import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ProjectDetailService } from './project.detail.service';
import { ProjectDetails } from './project.detail';
import { ActivatedRoute } from '@angular/router';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.css']
})
export class ProjectDetailsComponent implements OnInit, AfterViewInit {

  projectDetails: ProjectDetails | null = null;
  projectKey: string | null = null;

  coverageValue: number = 0;
  duplicatedLinesDensityValue: number = 0;

  isLoading: boolean = true;

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
          // Remove '%' and parse to number
          if (this.projectDetails) {
            this.coverageValue = parseFloat(this.projectDetails.coverage.replace('%', ''));
            this.duplicatedLinesDensityValue = parseFloat(this.projectDetails.duplicatedLinesDensity.replace('%', ''));
          }
          this.isLoading = false;
        });
    } else {
      this.isLoading = false; // No project key, stop loading
    }
  }

  ngAfterViewInit() {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach(tooltipTriggerEl => {
      new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }

}
