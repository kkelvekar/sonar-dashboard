import { Component, Input, OnInit } from '@angular/core';
import { ProjectItem } from './project-item';


@Component({
  selector: 'app-project-item',
  templateUrl: './project-item.component.html',
  styleUrl: './project-item.component.css'
})
export class ProjectItemComponent implements OnInit {
  @Input()
  projectItem!: ProjectItem;

  constructor() {

  }

  ngOnInit(): void {
    // console.log(JSON.stringify(this.projectItem));
  }

  getCircleValue(): string {
    if (!this.projectItem.coverage) return '0';
    return ((this.projectItem.coverage as number / 100) * 100).toFixed(2);
  }

  // Helper method to check if alert status is passed
  isAlertStatusPassed(): boolean {
    return this.projectItem.qualityGate === 'passed';
  }
}
