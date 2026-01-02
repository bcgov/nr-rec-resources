
terraform {
  source = "../../..//infrastructure//frontend"
}

locals {
  region                  = "ca-central-1"

  # Terraform remote S3 config
  tf_remote_state_prefix  = "terraform-remote-state" # Do not change this, given by cloud.pathfinder.
  target_env              = get_env("target_env")
  aws_license_plate       = get_env("aws_license_plate")
  app                     = get_env("app")
  app_env                 = get_env("app_env")
  app_name = local.app == "public" ? "frontend-${local.app_env}" : "${local.app}-frontend-${local.app_env}"
  statefile_bucket_name   = "${local.tf_remote_state_prefix}-${local.aws_license_plate}-${local.target_env}"
  statefile_key           = local.app == "public" ? "${local.app_env}/frontend/terraform.tfstate" : "${local.app_env}/frontend/${local.app}/terraform.tfstate"
  statelock_table_name    = "${local.tf_remote_state_prefix}-lock-${local.aws_license_plate}"
  api_remote_state = {
    bucket         = local.statefile_bucket_name
    key            = local.app == "public" ? "${local.app_env}/api/terraform.tfstate" : "${local.app_env}/api/${local.app}/terraform.tfstate"
    dynamodb_table = local.statelock_table_name
    region         = local.region
  }
  storage_remote_state = {
    bucket         = local.statefile_bucket_name
    key            = "${local.app_env}/storage/terraform.tfstate"
    dynamodb_table = local.statelock_table_name
    region         = local.region
  }
}

# Remote S3 state for Terraform.
generate "remote_state" {
  path      = "backend.tf"
  if_exists = "overwrite"
  contents  = <<EOF
terraform {
  backend "s3" {
    bucket         = "${local.statefile_bucket_name}"
    key            = "${local.statefile_key}"            # Path and name of the state file within the bucket
    region         = "${local.region}"                    # AWS region where the bucket is located
    dynamodb_table = "${local.statelock_table_name}"
    encrypt        = true
  }
}
EOF
}


generate "tfvars" {
  path              = "terragrunt.auto.tfvars"
  if_exists         = "overwrite"
  disable_signature = true
  contents          = <<-EOF
  app="${local.app}"
  app_env="${local.app_env}"
  app_name="${local.app_name}"
  api_remote_state = {
    bucket         = "${local.api_remote_state.bucket}"
    key            = "${local.api_remote_state.key}"
    dynamodb_table = "${local.api_remote_state.dynamodb_table}"
    region         = "${local.api_remote_state.region}"
  }

  storage_remote_state = {
    bucket         = "${local.storage_remote_state.bucket}"
    key            = "${local.storage_remote_state.key}"
    dynamodb_table = "${local.storage_remote_state.dynamodb_table}"
    region         = "${local.storage_remote_state.region}"
  }
EOF
}

generate "provider" {
  path      = "provider.tf"
  if_exists = "overwrite"
  contents  = <<EOF
  provider "aws" {
    region  = "${local.region}"
  }
  # Additional provider configuration for us-east-1 region; resources can reference this as `aws.east`.
  # This is essential for adding WAF ACL rules as they are only available at us-east-1.
  # See AWS doc: https://docs.aws.amazon.com/pdfs/waf/latest/developerguide/waf-dg.pdf#how-aws-waf-works-resources
  #     on section: "Amazon CloudFront distributions"
  provider "aws" {
    alias  = "east"
    region = "us-east-1"
  }
EOF
}
