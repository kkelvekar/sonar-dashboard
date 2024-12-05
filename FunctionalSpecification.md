# Functional Document for SonarqubeDashboard Web Application

## Overview

The **SonarqubeDashboard** is a web application designed to provide teams with a comprehensive overview of their projects' code quality metrics. By leveraging data from SonarQube, the application presents critical information in an accessible and user-friendly interface, enabling developers and stakeholders to monitor code health, identify issues, and drive continuous improvement.

## Main Features

### Project Listing

- **Comprehensive Project List**: Displays all projects, each accompanied by key metrics that reflect their current state.
- **Group Metrics**: Projects are organized into groups, allowing users to view aggregated metrics for project collections.
- **At-a-Glance Metrics**:
  - **Quality Gate Status**: Indicates whether a project has passed or failed the predefined quality criteria.
  - **Bugs**: Shows the number of bugs detected within the project.
  - **Vulnerabilities**: Displays the count of security vulnerabilities identified.
  - **Code Smells**: Highlights maintainability issues by showing the number of code smells.
  - **Coverage**: Presents the percentage of code covered by automated tests.
  - **Duplicated Lines Density**: Indicates the proportion of code that is duplicated.
  - **Ratings**: Provides reliability, security, and maintainability ratings (A to E).

### Project Details View

- **Detailed Metrics Overview**: Offers an in-depth look at individual projects, including specific metrics and ratings.
- **New Code vs. Overall Code**:
  - **New Code Metrics**: Focuses on recent code changes to ensure new contributions meet quality standards.
  - **Overall Code Metrics**: Provides metrics for the entire codebase, reflecting long-term code health.
- **Quality Gate Analysis**:
  - **Status Display**: Clearly shows whether the project passed or failed the quality gate.
  - **Failure Reasons**: If a project fails the quality gate, detailed reasons are provided, including which conditions failed and why.

### Interactive Features

- **Filtering and Sorting**:
  - Users can filter projects based on metrics like coverage percentage, ratings, and more.
  - Sorting options allow users to organize projects according to different criteria.
- **User-Friendly Interface**:
  - **Metric Cards**: Visual components that display metrics with icons, counts, and ratings.
  - **Charts and Graphs**: Utilizes circular progress charts to represent percentage-based metrics.
  - **Tooltips and Info Icons**: Provides additional information on metrics and features when users hover over certain elements.

## Metrics Covered

### Quality Gate Status

- **Definition**: A Quality Gate is a set of conditions that a project must meet to ensure it adheres to the organization's code quality standards. It acts as a pass/fail threshold during code analysis in SonarQube.
- **Functionality**:
  - Evaluates various metrics like coverage, bugs, vulnerabilities, and code smells against predefined thresholds.
  - The status can be **Passed** or **Failed**.
  - **Failure Reasons**: If failed, specific conditions that did not meet the criteria are listed with explanatory messages.
- **Impact**:
  - Ensures that the code meets the minimum acceptable quality criteria.
  - Prevents the introduction of new issues and maintains code health.
  - Failing the Quality Gate highlights critical areas needing immediate attention.

### Bugs

- **Definition**: Bugs are coding errors that can cause incorrect or unexpected behavior at runtime. They represent flaws that need to be fixed to prevent potential malfunctions.
- **Examples**:
  - Null pointer dereferences.
  - Incorrect calculations.
  - Resource leaks.
- **Impact**:
  - Can lead to application crashes, data corruption, or security vulnerabilities.
  - Identifying and resolving bugs is crucial for software reliability and user satisfaction.
- **Severity Levels**:
  - **Blocker**: Must be fixed immediately.
  - **Critical**: High impact; should be fixed as soon as possible.
  - **Major**, **Minor**, **Info**: Varying degrees of impact on the system.

### Vulnerabilities

- **Definition**: Security weaknesses in the code that could be exploited by attackers to compromise the system.
- **Examples**:
  - SQL injection risks.
  - Cross-site scripting (XSS).
  - Insecure cryptographic storage.
- **Impact**:
  - Can lead to unauthorized access, data breaches, and significant reputational damage.
  - Addressing vulnerabilities is essential for protecting sensitive data and complying with security standards.
- **Severity Levels**:
  - Similar to bugs, vulnerabilities are classified from **Blocker** to **Info** based on their potential impact.

### Code Smells

- **Definition**: Indicators of suboptimal coding practices that may not be immediately harmful but could lead to deeper problems. They suggest areas that require refactoring to improve readability and maintainability.
- **Examples**:
  - Duplicated code blocks.
  - Excessively long methods.
  - Complex conditional logic.
- **Impact**:
  - Increases technical debt, making the codebase harder to understand and maintain.
  - Addressing code smells improves code quality and reduces future defect risks.
- **Technical Debt**:
  - **Technical Debt**: Effort required to fix all code smells.
  - **Technical Debt Ratio**: Ratio between the cost to fix code smells and the cost to develop the software.

### Coverage

- **Definition**: Measures the proportion of the codebase executed during automated testing.
  - **Line Coverage**: Percentage of executable lines of code tested.
  - **Condition Coverage**: Percentage of decision points (like if-else branches) tested.
- **Impact**:
  - Higher coverage levels indicate thorough testing.
  - Reduces the likelihood of undetected bugs.
  - Increases confidence in code changes.
- **Calculation**:
  - **Line Coverage** = (Covered Lines) / (Total Executable Lines) * 100%
  - **Condition Coverage** considers the evaluation of boolean expressions to both true and false.

### Duplicated Lines Density

- **Definition**: The percentage of lines of code that are duplicated across the project.
- **Calculation**:
  - **Duplicated Lines (%)** = (Duplicated Lines) / (Lines of Code) * 100%
- **Impact**:
  - Code duplication increases maintenance efforts.
  - Changes in one place may need replication elsewhere.
  - Raises risk of inconsistencies and bugs.
  - Reducing duplication enhances maintainability and efficiency.

### Ratings

SonarQube provides ratings from **A** (best) to **E** (worst) for various aspects of code quality, allowing teams to quickly assess and prioritize areas for improvement.

#### Reliability Rating

- **Definition**: Reflects the code's susceptibility to causing failures, based on the severity and number of bugs.
  - **A**: 0 Bugs.
  - **B**: At least 1 Minor Bug.
  - **C**: At least 1 Major Bug.
  - **D**: At least 1 Critical Bug.
  - **E**: At least 1 Blocker Bug.
- **Impact**:
  - Lower ratings suggest a higher chance of software failures.
  - Affects user experience and system stability.
  - Improving reliability is crucial for robust applications.

#### Security Rating

- **Definition**: Assesses the code's strength against potential security threats, based on vulnerabilities found.
  - **A**: 0 Vulnerabilities.
  - **B**: At least 1 Minor Vulnerability.
  - **C**: At least 1 Major Vulnerability.
  - **D**: At least 1 Critical Vulnerability.
  - **E**: At least 1 Blocker Vulnerability.
- **Impact**:
  - Poor ratings indicate vulnerability to attacks.
  - Can lead to data loss, legal issues, and reputational damage.
  - Enhancing security is vital for safeguarding assets and user trust.

#### Maintainability Rating

- **Definition**: Evaluates how easy it is to maintain, modify, or extend the codebase.
  - Based on the **Technical Debt Ratio**.
  - **A**: ≤5% Technical Debt Ratio.
  - **B**: >5% and ≤10%.
  - **C**: >10% and ≤20%.
  - **D**: >20% and ≤50%.
  - **E**: >50%.
- **Impact**:
  - Lower ratings suggest a codebase that's harder to work with.
  - Can slow down development and increase costs.
  - Improving maintainability through refactoring enhances productivity.

### Security Hotspots

- **Definition**: Areas in the code that require manual review to determine if they are vulnerable.
- **Security Review Rating**:
  - **A**: ≥80% of hotspots reviewed.
  - **B**: ≥70% and <80%.
  - **C**: ≥50% and <70%.
  - **D**: ≥30% and <50%.
  - **E**: <30%.
- **Impact**:
  - Ensures that potential security issues are examined and addressed.
  - Improves overall security posture of the application.

### Complexity

- **Complexity**:
  - **Definition**: Cyclomatic Complexity measures the number of linearly independent paths through the code.
  - **Impact**:
    - Higher complexity can make code harder to understand and maintain.
    - May increase the risk of defects.
- **Cognitive Complexity**:
  - **Definition**: Measures how difficult code is to understand.
  - **Impact**:
    - High cognitive complexity can slow down development and increase error rates.
    - Encourages simpler, more readable code structures.

### Issues

- **Definition**: Problems identified in the codebase, including bugs, vulnerabilities, and code smells.
- **Types**:
  - **Open Issues**: Issues that are not yet resolved.
  - **Confirmed Issues**: Issues that have been acknowledged.
  - **Reopened Issues**: Issues that were closed but reopened due to recurrence or incomplete fixes.
- **Impact**:
  - Tracking and managing issues helps prioritize work.
  - Resolving issues improves code quality and reduces risks.

### Tests

- **Unit Tests**:
  - **Definition**: Automated tests that verify the functionality of individual units of code.
  - **Metrics**:
    - **Unit Tests**: Total number of unit tests.
    - **Unit Test Success Density**: Percentage of passed tests.
- **Coverage Metrics**:
  - **Lines to Cover**: Executable lines that should be covered by tests.
  - **Uncovered Lines**: Lines not covered by tests.
- **Impact**:
  - High test coverage increases confidence in code changes.
  - Reduces the likelihood of regression bugs.

## User Interface and Experience

### Project List Page

- **Navigation**:
  - Users can navigate through projects and groups efficiently.
  - Search and filter functionalities enhance user experience.
- **Visual Indicators**:
  - **Badges**: Display statuses like passed or failed quality gates.
  - **Color Codes**: Represent different ratings and alert levels.
- **Interactivity**:
  - Clickable project names lead to detailed views.
  - Hover effects provide tooltips with additional information.

### Project Details Page

- **Tabs for Metrics**:
  - **New Code Tab**: Highlights recent changes and their impact.
  - **Overall Code Tab**: Provides a holistic view of code quality.
- **Quality Gate Section**:
  - **Status Display**: Prominently shows pass or fail status.
  - **Failure Details**: Lists conditions that did not meet criteria.
- **Metrics Presentation**:
  - **Metric Cards**: Display counts and ratings with icons.
  - **Progress Bars and Charts**:
    - Visualize coverage and duplication metrics.
    - Circular charts for percentage-based metrics.
- **Security Hotspots**:
  - **Review Status**: Indicates the percentage of hotspots reviewed.
  - **Action Items**: Guides users to review unexamined hotspots.

## Functional Workflow

1. **Accessing the Dashboard**:
   - Users open the application to view the main dashboard.
   - The dashboard lists all projects and groups with key metrics.

2. **Viewing Projects and Groups**:
   - Users can see overall group metrics to identify high-level trends.
   - Projects are displayed with at-a-glance metrics.

3. **Filtering Projects**:
   - Users can apply filters based on metrics like coverage, ratings, duplications, etc.
   - Enables focusing on projects meeting certain conditions or requiring attention.

4. **Exploring Project Details**:
   - Selecting a project navigates to its detail page.
   - Users can switch between "New Code" and "Overall Code" tabs.

5. **Analyzing Quality Gate Status**:
   - The quality gate status is prominently displayed.
   - Failure reasons are detailed, aiding swift remediation.

6. **Reviewing Metrics**:
   - Detailed metrics include counts and ratings for bugs, vulnerabilities, code smells, and more.
   - Coverage and duplication are visualized for quick assessment.
   - Security hotspots review status helps prioritize security efforts.

7. **Navigating Back and Forth**:
   - Users can return to the main dashboard or navigate to other projects seamlessly.

## Clean as You Code Approach

The **SonarqubeDashboard** supports the **Clean as You Code** methodology, focusing on maintaining high standards in new code.

- **New Code Definition**:
  - Configurable starting point to define what is considered new code.
  - Options include previous version, specific number of days, or specific events.
- **Quality Gate Alignment**:
  - Quality gates focus on new code metrics to enforce standards on recent changes.
  - Ensures that new features are delivered cleanly without introducing new issues.
- **Developer Responsibility**:
  - Developers own the quality and security of the code they write.
  - Issues are automatically assigned to the relevant developer for prompt action.
- **Benefits**:
  - Incremental improvement of the overall codebase.
  - Higher code quality and fewer defects over time.
  - Encourages a culture of quality and accountability.

## Conclusion

The **SonarqubeDashboard** web application provides a centralized platform for teams to monitor and improve their projects' code quality. By presenting vital metrics and quality gate statuses in an intuitive format, the application helps users identify areas of concern, understand the impact of recent changes, and make informed decisions to enhance code reliability, security, and maintainability.