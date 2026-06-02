# Data Shape

## Entities

### Project
A wastewater treatment or solid waste management facility that JCA 1221 has built or is building. Each project has a location, scope, operational status, environmental impact metrics, and associated recognition.

### Service
A category of environmental infrastructure work that JCA 1221 offers — currently wastewater treatment and solid waste management, with the model to expand into other areas.

### TeamMember
A person on the JCA 1221 leadership or technical team. Includes founder, executives, and key engineers — each with name, role, credentials, and a brief bio.

### Award
A recognition or honor received by JCA 1221 or its projects, such as the 2025 Asian Water Award. Includes the award title, granting organization, year, and the project it was awarded for.

### Partner
A government unit, investor, or technology partner that has collaborated with JCA 1221 on a project. Includes the partner name, type, and associated project.

## Relationships

- A Project provides one or more Service
- A Service powers one or more Project
- A TeamMember works on many Project
- A Project has many Award
- A Partner collaborates on a Project
- A NewsArticle references one or more Project
