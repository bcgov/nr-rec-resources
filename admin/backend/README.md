# NR Rec Resources Admin Backend

This project is the backend service for the NR Rec Resources Admin application.
It is built using the [NestJS](https://nestjs.com/) framework and provides the
API and business logic for administering recreation resources in British
Columbia.

## Overview

The NR Rec Resources Admin backend is responsible for:

- Managing recreation resource data, including sites, trails, agreements, and
  related entities.
- Providing secure RESTful APIs for the admin frontend and other internal tools.
- Integrating with authentication and authorization systems (e.g., BC Gov
  SSO/Keycloak).
- Supporting data validation, business rules, and audit logging.
- Enabling administrative workflows for resource management.

## Features

- **NestJS & TypeScript:** Modern, scalable Node.js backend framework.
- **Authentication & Authorization:** Integrates with BC Gov SSO for secure
  access.
- **REST API:** Well-structured endpoints for CRUD operations on recreation
  resources.
- **Database Integration:** Connects to a PostgreSQL database using Prisma ORM.
- **Testing:** Includes unit tests.
- **API Documentation:** OpenAPI/Swagger documentation available for all
  endpoints.
- **Cloud Ready:** Designed for deployment to AWS.

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm
- PostgreSQL 16 (or use Docker Compose for local development)
- [BC Gov SSO](../docs/auth/auth.md) setup for authentication

### Installation

```bash
npm install
```

### Running the Application

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

### Running Tests

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## Deployment

Deployment is managed via GitHub Actions workflows located in the
[.github/workflows](../../.github/workflows) directory. See these workflows for
details on automated deployment to AWS.
