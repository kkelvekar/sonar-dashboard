## Overview

The **SonarqubeDashboard** is a web application designed to provide teams with a comprehensive overview of their projects' code quality metrics. It leverages data from SonarQube and local JSON files to present critical information in an accessible and user-friendly interface. The application enables developers and stakeholders to monitor code health, identify issues, and drive continuous improvement.

## Architecture

The application consists of two main components:

- **SonarqubeDashboard.Web**: The front-end web application built with Angular.
- **SonarqubeDashboard.API**: The back-end API built with ASP.NET Core that communicates with local JSON files and the SonarQube server to retrieve data.

### Web Application (SonarqubeDashboard.Web)

The web application is an Angular-based client that interacts with the API to display project metrics and details. It provides:

- **Project List Page**: Displays all projects with key metrics.
- **Project Details Page**: Shows detailed metrics for individual projects, including new code and overall code metrics.

### API (SonarqubeDashboard.API)

The API is built with ASP.NET Core and serves as an intermediary between the web application, local data sources, and the SonarQube server. It handles:

- **Data Retrieval**:
  - Fetches the project list from a local `projects.json` file.
  - Retrieves rating definitions from a local JSON file.
  - Retrieves detailed project data from the SonarQube server using the official API.
- **Data Processing**: Processes and aggregates data to be consumed by the web application.

## Services

### Web Application Services

The web application includes several services that manage data retrieval and state:

- **ProjectService**: Communicates with the API to fetch the project list and project details.
- **GroupService**: Manages grouping of projects and aggregation of metrics.
- **FilterService**: Provides functionalities for filtering and sorting projects based on various criteria.
- **NavigationService**: Manages routing and navigation within the application.

### API Services

The API includes services that handle data retrieval and processing:

- **ProjectService**:
  - **GetProjects**: Reads the project list from `projects.json`.
- **RatingDefinitionService**:
  - **GetRatingDefinitions**: Reads rating definitions from a local JSON file.
- **ProjectDetailService**:
  - **GetProjectDetail**: Uses the project key from the project list to call the official SonarQube API and retrieve detailed project information.
    - Calls methods like `GetHumanizeNewCodeBaseLine` to process dates.
  - **MapMeasures**: Maps raw measures from SonarQube to domain models.
    - Processes various metrics like bugs, vulnerabilities, code smells, and more.
  - **CreateProjectMetric**: Creates specific metric objects based on measures (e.g., bugs, vulnerabilities).

## Code Flow

1. **User Interaction**: The user navigates the web application, accessing the project list or details.

2. **Data Request**: The web application sends HTTP requests to the API.

3. **API Data Retrieval**:
   - **Project List**: The API reads from `projects.json` to obtain the list of projects.
   - **Rating Definitions**: The API reads rating thresholds from the local JSON file.
   - **Project Details**: For a selected project, the API calls the SonarQube API using the project's key to get detailed metrics and quality gate status.

4. **Data Processing**:
   - The API maps and aggregates the data into domain models.
   - Calculates metrics and applies rating definitions.

5. **Data Response**: The API sends the processed data back to the web application as JSON.

6. **Data Presentation**:
   - The web application updates the UI with the received data.
   - Renders metrics using cards, charts, and tables.
   - Provides filtering and sorting options for user interaction.

## Functional Aspects of the Final Product

### Key Features

- **Comprehensive Project Listing**: Displays all projects with key metrics at a glance.
- **Detailed Project View**: Provides in-depth metrics for individual projects, focusing on new code and overall code.
- **Quality Gate Analysis**: Shows quality gate status and detailed failure reasons if applicable.
- **Interactive Filtering and Sorting**: Allows users to filter and sort projects based on various metrics.
- **Visual Indicators**: Uses badges, color codes, and charts to represent statuses and metrics effectively.
- **Support for 'Clean as You Code'**: Emphasizes new code quality to maintain high standards over time.

### User Interaction Flow

1. **Accessing the Dashboard**:
   - Users open the application and see a list of projects populated from `projects.json`.
   - Key metrics are displayed for each project.

2. **Filtering and Sorting**:
   - Users can filter projects based on metrics like coverage or ratings.
   - Sorting options help organize projects by criteria such as the number of bugs.

3. **Viewing Project Details**:
   - Selecting a project navigates to its detail page.
   - The application requests detailed data from the API.

4. **Retrieving Project Details**:
   - The API uses the project key to fetch details from the SonarQube API.
   - Detailed metrics and quality gate status are retrieved.

5. **Analyzing Metrics**:
   - Detailed metrics are displayed, including counts and ratings.
   - Visual elements like charts represent coverage and duplication.

6. **Quality Gate Evaluation**:
   - The quality gate status is prominently shown.
   - Detailed failure reasons are provided if the quality gate is failed.

7. **Security Hotspots Review**:
   - Displays the percentage of security hotspots reviewed.
   - Encourages users to address unreviewed hotspots.

## Deployment

The SonarqubeDashboard application is deployed on an Azure Kubernetes Service (AKS) cluster. Each component (web and API) is containerized using Docker and managed using Helm charts for deployment on the AKS cluster.

### Containerization

Each project (web and API) has its own `Dockerfile`. When changes are made to the codebase, the following steps are taken to build and deploy the application:

1. **Build Docker Images**:
   - Navigate to the project directory.
   - Build the Docker image using the `docker build` command.
     ```bash
     docker build -t <registry>/<image-name>:<version> .
     ```
   - Repeat for both the web and API projects.

2. **Push Docker Images to Container Registry**:
   - Tag the images appropriately if not already tagged.
   - Push the images to the container registry.
     ```bash
     docker push <registry>/<image-name>:<version>
     ```

### Deployment to AKS Cluster

The application is deployed using Helm charts on the AKS cluster under the `sonarqube` namespace in the development cluster.

1. **Update Helm Charts**:
   - Update the image versions in the Helm chart values files for both the web and API components.
     - For the web app Helm chart (`<placeholder>`):
       - Update the image tag in `values.yaml` or the appropriate values file.
     - For the API Helm chart (`<placeholder>`):
       - Update the image tag similarly.

2. **Upgrade Helm Releases**:
   - Use Helm to upgrade the releases with the updated image versions.
     ```bash
     helm upgrade <release-name> <chart-path> -n sonarqube -f <values-file>
     ```
   - Replace `<release-name>`, `<chart-path>`, and `<values-file>` with the appropriate names and paths for the web and API components.

3. **Verify Deployment**:
   - Check the status of the deployments in the AKS cluster.
     ```bash
     kubectl get deployments -n sonarqube
     ```
   - Ensure that the new pods are running with the updated images.

## Conclusion

The **SonarqubeDashboard** provides a centralized platform for monitoring and improving code quality across projects. By integrating data from SonarQube and local JSON files, it presents actionable insights that help teams prioritize efforts, track improvements, and maintain high standards in both new and existing code. Deployment on the AKS cluster using Docker and Helm ensures scalability and ease of management for the application.