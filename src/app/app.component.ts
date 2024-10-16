import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'sonarqube-dashboard';

  searchTerm: string = '';
  selectedGroup: string = '';

  onSearchChange(searchValue: string) {
    this.searchTerm = searchValue;
  }

  onGroupFilterChange(selectedGroup: string) {
    this.selectedGroup = selectedGroup;
  }
}
