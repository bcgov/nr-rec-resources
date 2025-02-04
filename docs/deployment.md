# Deployment

## Deploying to AWS

On merging to the `main` branch, the GitHub Actions workflow will be triggered
to deploy the application to AWS dev environment.

- Once the deployment to `dev` is successful, deployment to `test` can be
  reviewed through the GitHub workflow.
- Once the deployment to `test` is successful, deployment to `prod` can be
  reviewed through the GitHub workflow.

## Manually deploying pull request to AWS

### Using Deploy PR manual workflow dispatch

Sometimes you may want to deploy a pull request to AWS for testing. To do this,
open the pull request and check to workflow to make sure the images have been
built successfully. Get the image tag which is the `github.sha` for that run
from the build logs or the ghcr.io image page. It will be the same for all
images.

- Go to the `Actions` tab in the pull request.
- Click on the `Deploy PR` workflow in the left sidebar
- Click on the `Run workflow` button
- Select your pull requests in the `Use workflow from` dropdown
- Enter the image tag in the `Image tag` input field

The `Deploy PR` workflow will be triggered and the application will be deployed
to the AWS `dev` environment.

### Altering the `deploy-to-aws-dev` GitHub Actions workflow

Alternatively you can comment out the `if` condition in the `deploy-to-aws-dev`
workflow in and push a test commit to the pull request to manually deploy to aws
dev for testing.

Find the deploy-to-aws-dev job in `.github/workflows/main.yml`:

```yaml
deploy-to-aws-dev:
  # if: github.ref_name == 'main' || github.head_ref == 'main'
  name: Deploys Application to AWS dev ...
```

## Clearing Terraform state lock

If you encounter an error with Terraform state lock, you can clear the lock by
logging into the AWS console and navigating to dynamodb tables. Find the state
lock table named `terraform-remote-state-lock`, click `Explore table items` and
delete the lock item.

## AWS Logging

### Cloudwatch

Cloudwatch is used to aggregate and store logs for the application, API,
migrations and Aurora RDS. To view logs in Cloudwatch:

- Login to AWS console
- Go to AWS Cloudwatch
- Click on `Log groups` in the left sidebar
- Select the log group for the environment ie `/ecs/ecs-cluster-node-api-dev`
- Click on the log stream to view the logs

### API logs

Alternatively it may be helpful to view logs directly in the actual service:

- Login to AWS console
- Go to AWS Elastic Container Service (ECS)
- Select the cluster for the environment ie `ecs-cluster-node-api-dev`
- Select the service ie `node-api-dev-service`
- Click the `Logs` tab

### Aurora RDS PostgreSQL logs

- Login to AWS console
- Go to AWS RDS
- Click on DB instances resource
- Select the database cluster ie `aurora-cluster-dev-one`
- Click on the `Logs & events` tab
- Sort by logs by `Last written` and click on the log file to view the latest
  log

### Aurora RDS PostgreSQL Query Editor

Using the Query editor lets you run SQL queries on the database in AWS. This can
be useful for viewing the data, testing migrations and debugging.

To access the Query editor:

- Login to AWS console
- Go to AWS RDS
- Select Query Editor from the left sidebar
- Select the database cluster ie `aurora-cluster-dev-one`
- Select user `sysadmin`
- Enter the name of the database or schema ie `rst`
