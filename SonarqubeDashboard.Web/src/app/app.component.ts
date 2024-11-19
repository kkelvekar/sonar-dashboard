import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'] // Note: styleUrls instead of styleUrl
})
export class AppComponent  {

  title: string = '';

  constructor() {
    this.title = 'SonarQube Project Dashboard';
  }
}
