import { ProjectGroup } from "./project-group/project-group";
import { ProjectItem } from "./project-item/project-item";

export interface ProjectList {
  projectGroup: ProjectGroup;
  projectItems: ProjectItem[];
}
