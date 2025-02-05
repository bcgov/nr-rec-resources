# CI/CD pipeline with GitHub Actions

The CI/CD pipeline runs using GitHub Actions. The main workflow used to
orchestrate the pipeline is located in `.github/workflows/main.yml` which runs
on every pull request as well as when merging to the main branch.

## Docker image build and push

The pipeline builds and pushes Docker images for the frontend, backend and
migrations to the ghcr.io container registry. The images are tagged with the
GitHub SHA and can be viewed in the packages section of the repository.

We currently build these images:

### Backend

NextJS backend image\
[ghcr.io/bcgov/nr-rec-resources/backend](https://github.com/bcgov/nr-rec-resources/pkgs/container/nr-rec-resources%2Fbackend)

### Frontend

Vite/React frontend image - we do not use this for deployment as we build and
upload our app to S3 and deploy it via Cloudfront. This is used for running e2e
in ci with `docker compose`.\
[ghcr.io/bcgov/nr-rec-resources/frontend](https://github.com/bcgov/nr-rec-resources/pkgs/container/nr-rec-resources%2Ffrontend)

### Migrations/RST

Migration for our database which is run as an ECS task during our API
deployment\
[ghcr.io/bcgov/nr-rec-resources/migrations/rst](https://github.com/bcgov/nr-rec-resources/pkgs/container/nr-rec-resources%2Fmigrations%2Frst)

### Migrations/FTA

Migration for the FTA schema which creates the FTA shadow schema, imports the
FTA CSV data and then inserts the data into our main RST schema.\
[ghcr.io/bcgov/nr-rec-resources/migrations/fta](https://github.com/bcgov/nr-rec-resources/pkgs/container/nr-rec-resources%2Fmigrations%2Ffta)

## E2E Testing

### Visual Regression Testing with Happo

[Happo](https://happo.io/) is a cross browser screenshot testing library used to
test for visual regressions. It is integrated with Playwright to capture
screenshots of your application and compare them against a baseline to detect
any visual changes and will upload the screenshots to the happo servers.

To view and approve Happo diffs, open a pull request with your changes and let
the e2e tests run. Once the tests are complete, the Happo report will appear in
the list of CI jobs. If there are differences, you can approve or reject them.
If you approve them, the new screenshots will be used as the baseline for future
tests once merged.

Read more about Happo and how to review diffs here:
[Reviewing Happo Diffs](https://docs.happo.io/docs/reviewing-diffs)
