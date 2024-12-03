import { Injectable } from "@angular/core";
import { ProjectResponse } from "../project.response";
import _ from "lodash";
import { ProjectMetricService } from "../../shared/services/project.metric.service";

@Injectable({
  providedIn: 'root'
})
export class ProjectGroupService {

  constructor(private projectMetricService: ProjectMetricService) { }

  getTotalBugCount(projects: ProjectResponse[]): number {
    return _.sumBy(projects, (project) => Number(this.projectMetricService.getMetricValue(project.metrics, 'bugs')) || 0);
  }

  getAverageReliabilityRating(projects: ProjectResponse[]): string {
    const ratingValues: { [key: string]: number } = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5 };
    const numericRatings: number[] = [];

    projects.forEach(project => {
      const rating = this.projectMetricService.getRatingValue(project.metrics, 'reliability_rating') as string;
      const numericValue = ratingValues[rating] || 1; // Default to 1 (A) if undefined
      numericRatings.push(numericValue);
    });

    const averageNumericRating = numericRatings.reduce((sum, value) => sum + value, 0) / numericRatings.length;
    const roundedAverage = Math.round(averageNumericRating);

    const averageRating = Object.keys(ratingValues).find(key => ratingValues[key] === roundedAverage) || 'A';
    return averageRating;
  }

  getTotalVulnerabilityCount(projects: ProjectResponse[]): number {
    return _.sumBy(projects, (project) => Number(this.projectMetricService.getMetricValue(project.metrics, 'vulnerabilities')) || 0);
  }

  getAverageSecurityRating(projects: ProjectResponse[]): string {
    const ratingValues: { [key: string]: number } = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5 };
    const numericRatings: number[] = [];

    projects.forEach(project => {
      const rating = this.projectMetricService.getRatingValue(project.metrics, 'security_rating') as string;
      const numericValue = ratingValues[rating] || 1; // Default to 1 (A) if undefined
      numericRatings.push(numericValue);
    });

    const averageNumericRating = numericRatings.reduce((sum, value) => sum + value, 0) / numericRatings.length;
    const roundedAverage = Math.round(averageNumericRating);

    const averageRating = Object.keys(ratingValues).find(key => ratingValues[key] === roundedAverage) || 'A';
    return averageRating;
  }

  getTotalSecurityHotspots(projects: ProjectResponse[]): number {
    return _.sumBy(projects, (project) => Number(this.projectMetricService.getMetricValue(project.metrics, 'security_hotspots')) || 0);
  }

  getAverageSecurityReviewRating(projects: ProjectResponse[]): string {
    let totalPercentageReviewed = 0;
    let projectCount = projects.length;

    projects.forEach(project => {
      const securityHotspotsReviewedPercentage = Number(this.projectMetricService.getMetricValue(project.metrics, 'security_hotspots_reviewed')) || 0;
      totalPercentageReviewed += securityHotspotsReviewedPercentage;
    });

    let averagePercentageReviewed = totalPercentageReviewed / projectCount;

    let rating = '';
    if (averagePercentageReviewed >= 80) {
      rating = 'A';
    } else if (averagePercentageReviewed >= 70) {
      rating = 'B';
    } else if (averagePercentageReviewed >= 50) {
      rating = 'C';
    } else if (averagePercentageReviewed >= 30) {
      rating = 'D';
    } else {
      rating = 'E';
    }

    return rating;
  }

  getTotalCodeSmells(projects: ProjectResponse[]): number {
    return _.sumBy(projects, (project) => Number(this.projectMetricService.getMetricValue(project.metrics, 'code_smells')) || 0);
  }

  getAverageSqaleRating(projects: ProjectResponse[]): string {
    const ratingValues: { [key: string]: number } = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5 };
    const numericRatings: number[] = [];

    projects.forEach(project => {
      const rating = this.projectMetricService.getRatingValue(project.metrics, 'sqale_rating') as string;
      const numericValue = ratingValues[rating] || 1; // Default to 1 (A) if undefined
      numericRatings.push(numericValue);
    });

    const averageNumericRating = numericRatings.reduce((sum, value) => sum + value, 0) / numericRatings.length;
    const roundedAverage = Math.round(averageNumericRating);

    const averageRating = Object.keys(ratingValues).find(key => ratingValues[key] === roundedAverage) || 'A';
    return averageRating;
  }

  getAverageCoverage(projects: ProjectResponse[]): number {
    let totalCoveredLines = 0;
    let totalLinesToCover = 0;

    projects.forEach(project => {
      const coveragePercentageString = this.projectMetricService.getMetricValue(project.metrics, 'coverage') as string || "0%";
      const linesOfCodeString = this.projectMetricService.getMetricValue(project.metrics, 'ncloc') || "0";

      // Remove the '%' sign and parse the coverage percentage
      const coveragePercentage = parseFloat(coveragePercentageString.replace('%', '')) || 0;

      // Parse the lines of code correctly
      const linesOfCode = this.parseLineOfCodeValue(linesOfCodeString);

      // Assuming 'lines_to_cover' is equivalent to 'ncloc' for this calculation
      const linesToCover = linesOfCode;
      const coveredLines = (coveragePercentage / 100) * linesToCover;

      totalCoveredLines += coveredLines;
      totalLinesToCover += linesToCover;
    });

    let averageCoverage = 0;
    if (totalLinesToCover > 0) {
      averageCoverage = (totalCoveredLines / totalLinesToCover) * 100;

      // Round to one decimal place
      averageCoverage = parseFloat(averageCoverage.toFixed(1));
    }
    return averageCoverage;
  }

  getAverageDuplicatedLinesDensity(projects: ProjectResponse[]): number {
    let totalDuplicatedLines = 0;
    let totalLinesOfCode = 0;

    projects.forEach(project => {
      const duplicationPercentageString = this.projectMetricService.getMetricValue(project.metrics, 'duplicated_lines_density') as string || "0%";
      const linesOfCodeString = this.projectMetricService.getMetricValue(project.metrics, 'ncloc') || "0";

      // Parse the lines of code correctly
      const linesOfCode = this.parseLineOfCodeValue(linesOfCodeString);

      if (linesOfCode > 0) {
        const duplicationPercentage = parseFloat(duplicationPercentageString.replace('%', '')) || 0;
        const duplicatedLines = (duplicationPercentage / 100) * linesOfCode;
        totalDuplicatedLines += duplicatedLines;
        totalLinesOfCode += linesOfCode;
      }
    });

    let averageDuplicatedLinesDensity = 0;
    if (totalLinesOfCode > 0) {
      averageDuplicatedLinesDensity = (totalDuplicatedLines / totalLinesOfCode) * 100;
      averageDuplicatedLinesDensity = parseFloat(averageDuplicatedLinesDensity.toFixed(1));
    }
    return averageDuplicatedLinesDensity;
  }

  private parseLineOfCodeValue(value: string | number): number {
    if (typeof value === 'number') {
      return value;
    }

    if (typeof value !== 'string') {
      return 0;
    }

    // Remove commas and spaces
    value = value.replace(/,/g, '').trim();

    const units: { [key: string]: number } = {
      'k': 1_000,
      'K': 1_000,
      'm': 1_000_000,
      'M': 1_000_000,
      'b': 1_000_000_000,
      'B': 1_000_000_000,
    };

    const regex = /^([\d\.]+)([kKmMbB])?$/;
    const match = value.match(regex);

    if (match) {
      const num = parseFloat(match[1]);
      const unit = match[2];

      if (unit && units[unit]) {
        return num * units[unit];
      } else {
        return num;
      }
    } else {
      return 0;
    }
  }
}
