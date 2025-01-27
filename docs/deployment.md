# Deployment

## Deploying to AWS

On merging to the `main` branch, the GitHub Actions workflow will be triggered
to deploy the application to AWS dev environment.

- Once the deployment to `dev` is successful, deployment to `test` can be
  reviewed through the GitHub workflow.
- Once the deployment to `test` is successful, deployment to `prod` can be
  reviewed through the GitHub workflow.

## Manually deploying pull request to AWS

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

## Clearing Terraform state lock

If you encounter an error with Terraform state lock, you can clear the lock by
logging into the AWS console and navigating to dynamodb tables. Find the state
lock table named `terraform-remote-state-lock`, click `Explore table items` and
delete the lock item.
