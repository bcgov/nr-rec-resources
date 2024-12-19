[![MIT License](https://img.shields.io/github/license/bcgov/quickstart-openshift.svg)](/LICENSE)
[![Lifecycle](https://img.shields.io/badge/Lifecycle-Experimental-339999)](https://github.com/bcgov/repomountie/blob/master/doc/lifecycle-badges.md)

[![Merge](https://github.com/bcgov/quickstart-openshift/actions/workflows/merge.yml/badge.svg)](https://github.com/bcgov/nr-rec-resources/actions/workflows/merge.yml)
[![Analysis](https://github.com/bcgov/quickstart-openshift/actions/workflows/analysis.yml/badge.svg)](https://github.com/bcgov/nr-rec-resources/actions/workflows/analysis.yml)
[![Scheduled](https://github.com/bcgov/quickstart-openshift/actions/workflows/scheduled.yml/badge.svg)](https://github.com/bcgov/nr-rec-resources/actions/workflows/scheduled.yml)

# Recreation Resource Services - RSTBC

- [Contributing](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [License](LICENSE.md)
- [Security](SECURITY.md)

## Local Development

### Prerequisites

- Node.js
- npm
- Docker OR PostgreSQL 15

### Docker Compose

To run the entire application using Docker Compose, run the following commands:

```bash
git clone git@github.com:bcgov/nr-rec-resources.git
cd nr-rec-resources
docker-compose up
```

Navigate to `http://localhost:3000` in your web browser to view the application.

### Installation

Before starting development on this project, run `npm install` in the base
directory to install eslint and plugins to ensure linting is working correctly.

### Database

To run this on your local machine, you will need a working installation of
PostgreSQL 16.

Create an `.env` file in the `backend` directory using the example in
`backend/.env.example` as a template.

```bash
cd nr-rec-resources
make create_db
make migrate
```

### Backend

Ensure you have the `.env` file in the `backend` directory from the previous
step.

```bash
cd backend
npm install
npm run dev
```

### Frontend

Create an `.env` file in the `frontend` directory using the example in
`frontend/.env.example` as a template.

```bash
cd frontend
npm install
npm run dev
```

Navigate to `http://localhost:3000` in your web browser to view the application.

## Pre-commit hooks

Pre-commit is set up to run checks for linting, formatting, and secrets.

- Install [pre-commit](https://pre-commit.com/)
- With pre-commit installed run `pre-commit install` in the root directory of
  the project
- Pre-commit should now run on your staged files every time you make a commit

### Skipping pre-commit hooks

If you need to skip the pre-commit hooks for a specific commit, you can use the
`--no-verify` flag. Some developers may use this when they are making a commit
that they know will fail the pre-commit checks, but they still want to commit
the changes. This is a perfectly acceptible workflow, though there is a
pre-commit check in CI so it may be necessary to run pre-commit on all files
before putting a PR up for review if this is skipped.

```bash
git commit -m "Your commit message" --no-verify
```

### Running pre-commit on all files

Sometimes it may be necessary to run `pre-commit` on the entire project due to a
mistake or a configuration change.

```bash
pre-commit run --all-files
```

## Style Guide

Commits follow the conventions defined in the
[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
specification.

## Schemaspy Database Schema Documentation

Schedule job runs every saturday and keep schema documentation upto date in
[github pages](https://bcgov.github.io/nr-rec-resources/).
