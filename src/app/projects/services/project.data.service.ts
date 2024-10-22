import { Injectable } from "@angular/core";
import { ProjectList } from "../project-list/project-list";
import { SonarQubeProjectGroupData } from "../../shared/services/sonarqube-project.data";

@Injectable({
  providedIn: 'root'
})
export class ProjectDataService {
   projectList: ProjectList[] = [];
   projectData: SonarQubeProjectGroupData[] = [];


}
