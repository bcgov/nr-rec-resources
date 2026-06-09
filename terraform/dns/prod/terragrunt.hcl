terraform {
  source = "../../..//infrastructure//dns"
}

locals {
  region = "ca-central-1"

  # Terraform remote S3 config
  tf_remote_state_prefix = "terraform-remote-state" # Do not change this, given by cloud.pathfinder.
  target_env            = get_env("target_env")
  aws_license_plate     = get_env("aws_license_plate")
  statefile_bucket_name = "${local.tf_remote_state_prefix}-${local.aws_license_plate}-${local.target_env}"
  statelock_table_name  = "${local.tf_remote_state_prefix}-lock-${local.aws_license_plate}"

  # Get CloudFront domain names from frontend module outputs via remote state
  # This ensures we always use the correct CloudFront distributions
  public_frontend_state_key = "${local.target_env}/frontend/terraform.tfstate"
  admin_frontend_state_key  = "${local.target_env}/frontend/admin/terraform.tfstate"
}

# Remote S3 state for Terraform.
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
  target_env = "${local.target_env}"
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
  google_search_console_verification_txt = get_env("google_search_console_verification_txt", "")
  dev_zone_name_servers  = jsondecode(get_env("dev_zone_name_servers", "[]"))
  test_zone_name_servers = jsondecode(get_env("test_zone_name_servers", "[]"))
  acm_dev_cert_validation_cname = {
    name  = "_9560db82edfb03e47cbe6e9b2a6803c7.sitesandtrailsbc.ca."
    value = "_2f237c901a4c542e46cb7f83077208d9.jkddzztszm.acm-validations.aws."
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
EOF
}
