// src/app/services/sonarqube-metrics.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import _ from "lodash";
import { SonarQubeProjectMetricData } from './sonarqube-project.data';

// Configurable Base URL and Token
const BASE_URL = environment.sonarBaseUrl; // e.g., 'http://localhost:9000/api/project_badges/measure'
const TOKEN = environment.sonarToken; // e.g., 'sqb_c5a8cb98077a29d831751686ae50bcae3543cb92'

// Metric Names
const METRICS = [
  'bugs',
  'alert_status',
  'coverage',
  'code_smells',
  'duplicated_lines_density',
  'ncloc',
  'sqale_rating',
  'security_hotspots',
  'reliability_rating',
  'sqale_index',
  'vulnerabilities',
  'security_rating'
];

@Injectable({
  providedIn: 'root',
})
export class SonarQubeMetricsService {
  constructor(private http: HttpClient) { }

  // Function to fetch metrics for a given project
  getProjectMetrics(projectKey: string, projectToken: string): Observable<SonarQubeProjectMetricData[]> {
    const requests = METRICS.map((metric) => {
      const url = `${BASE_URL}?project=${projectKey}&metric=${metric}&token=${projectToken}`;
      return this.http.get(url, { responseType: 'text' }).pipe(
        map((svg) => this.parseMetricFromSvg(svg, metric))
      );
    });

    // Parallel HTTP requests using forkJoin for faster execution
    return forkJoin(requests);
  }

  // Function to parse SVG and extract metric value
  private parseMetricFromSvg(svg: string, metric: string): SonarQubeProjectMetricData {
    // if (metric === 'coverage') {
    //   let value = `${_.round(_.random(0, 100, true), 1)}%`;
    //   return { name: metric, value };
    // }
    // else {
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svg, 'image/svg+xml');
      const texts = svgDoc.getElementsByTagName('text');
      const value = texts[texts.length - 1]?.textContent?.trim() || 'N/A';
      return { name: metric, value };
    //}
  }
}
