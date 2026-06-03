terraform {
  source = "../../..//infrastructure//dns-env"
}

locals {
  region                 = "ca-central-1"
  tf_remote_state_prefix = "terraform-remote-state"
  target_env             = "test"
  aws_license_plate      = get_env("aws_license_plate")
  statefile_bucket_name  = "${local.tf_remote_state_prefix}-${local.aws_license_plate}-${local.target_env}"
  statelock_table_name   = "${local.tf_remote_state_prefix}-lock-${local.aws_license_plate}"
}

generate "remote_state" {
  path      = "backend.tf"
  if_exists = "overwrite"
  contents  = <<EOF
terraform {
  backend "s3" {
    bucket         = "${local.statefile_bucket_name}"
    key            = "${local.target_env}/dns/terraform.tfstate"
    region         = "${local.region}"
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
  env         = "test"
  domain_name = "sitesandtrailsbc.ca"
  public_frontend_remote_state = {
    bucket         = "${local.statefile_bucket_name}"
    key            = "${local.target_env}/frontend/terraform.tfstate"
    dynamodb_table = "${local.statelock_table_name}"
    region         = "${local.region}"
  }
  admin_frontend_remote_state = {
    bucket         = "${local.statefile_bucket_name}"
    key            = "${local.target_env}/frontend/admin/terraform.tfstate"
    dynamodb_table = "${local.statelock_table_name}"
    region         = "${local.region}"
  }
  EOF
}

generate "provider" {
  path      = "provider.tf"
  if_exists = "overwrite"
  contents  = <<EOF
provider "aws" {
  region = "${local.region}"
}
provider "aws" {
  alias  = "east"
  region = "us-east-1"
}
EOF
}
