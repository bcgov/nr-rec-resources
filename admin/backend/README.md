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
- **File Storage:** S3-based storage for images and documents with CloudFront
  CDN integration.
- **Geospatial data:** Spatial feature geometry, total length/area,
  right-of-way, and site point coordinates (see
  [Geospatial data and spatial calculations](../../docs/geospatial.md)).

## File Storage

The backend manages three types of file storage:

- **Recreation Resource Images**: Stored in S3, served via CloudFront CDN for
  public access. Images are stored in WebP format with multiple variants
  (original, scr, pre, thm). Path pattern:
  `images/{recResourceId}/{imageId}/{sizeCode}.webp`

- **Resource Documents**: Stored in S3, served via CloudFront CDN for public
  access. Path pattern: `documents/{recResourceId}/{documentId}.{extension}`

- **Establishment Order Documents**: Stored in S3, accessed via presigned URLs
  for secure, temporary access (private documents)

All file storage operations use AWS S3 in production, with LocalStack support
for local development.

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm
- PostgreSQL 16 (or use Docker Compose for local development)
- [BC Gov SSO](../docs/auth/auth.md) setup for authentication
- LocalStack (optional, for local S3 development)

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

## File Storage Configuration

The backend requires the following environment variables for S3 and CloudFront
configuration:

### Required Environment Variables

- `RST_STORAGE_IMAGES_BUCKET` - S3 bucket name for recreation resource images
- `RST_STORAGE_PUBLIC_DOCUMENTS_BUCKET` - S3 bucket name for public resource
  documents
- `ESTABLISHMENT_ORDER_DOCS_BUCKET` - S3 bucket name for establishment order
  documents
- `RST_STORAGE_CLOUDFRONT_URL` - CloudFront distribution domain for public
  assets (e.g., `d19itkfm5zoq3.cloudfront.net`)
- `AWS_REGION` - AWS region (e.g., `ca-central-1`)

### Optional Environment Variables

- `AWS_ENDPOINT_URL` - LocalStack endpoint URL for local development (e.g.,
  `http://localhost:4566`). When set, the application will use LocalStack
  instead of AWS S3.

### File Storage Architecture

**Production (AWS):**

- Images and resource documents are served via CloudFront CDN for optimal
  performance and caching
- CloudFront cache behaviors are configured for `/images/*` and `/documents/*`
  path patterns
- Establishment order documents use presigned URLs for secure, time-limited
  access

**Local Development (LocalStack):**

- When `AWS_ENDPOINT_URL` is set, CloudFront URLs are automatically replaced
  with LocalStack direct URLs
- LocalStack uses direct URLs instead of presigned URLs for simplicity
- All S3 operations work identically to production, but against a local S3
  emulator

For detailed LocalStack setup instructions, see
[LocalStack Setup Guide](../docs/localstack-setup.md).

### Image Variants

Recreation resource images are stored in multiple variants:

- `original` - Full resolution image
- `scr` - Screen resolution variant
- `pre` - Preview variant
- `thm` - Thumbnail variant

All variants are stored as WebP format for optimal compression and quality.

## Deployment

Deployment is managed via GitHub Actions workflows located in the
[.github/workflows](../../.github/workflows) directory. See these workflows for
details on automated deployment to AWS.
