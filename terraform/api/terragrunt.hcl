terraform {
  source = "../../..//infrastructure//api"
}



locals {
  region                  = "ca-central-1"

  # Terraform remote S3 config
  tf_remote_state_prefix       = "terraform-remote-state" # Do not change this, given by cloud.pathfinder.
  target_env                   = get_env("target_env")
  aws_license_plate            = get_env("aws_license_plate")
  app                          = get_env("app")
  app_env                      = get_env("app_env")
  statefile_bucket_name        = "${local.tf_remote_state_prefix}-${local.aws_license_plate}-${local.target_env}"
  statefile_key                = local.app == "public" ? "${local.app_env}/api/terraform.tfstate" : "${local.app_env}/api/${local.app}/terraform.tfstate"
  statelock_table_name         = "${local.tf_remote_state_prefix}-lock-${local.aws_license_plate}"
  frontend_remote_state = {
    bucket         = "${local.tf_remote_state_prefix}-${local.aws_license_plate}-${local.target_env}"
    key            = local.app == "public" ? "${local.app_env}/frontend/terraform.tfstate" : "${local.app_env}/frontend/${local.app}/terraform.tfstate"
    dynamodb_table = "${local.tf_remote_state_prefix}-lock-${local.aws_license_plate}"
    region         = "ca-central-1"
  }
  storage_remote_state = {
    bucket         = "${local.tf_remote_state_prefix}-${local.aws_license_plate}-${local.target_env}"
    key            = "${local.app_env}/storage/terraform.tfstate"
    dynamodb_table = "${local.tf_remote_state_prefix}-lock-${local.aws_license_plate}"
    region         = "ca-central-1"
  }
  flyway_image                 = get_env("flyway_image")
  api_image                    = get_env("api_image")
  forest_client_api_key        = get_env("forest_client_api_key")
  forest_client_api_url        = get_env("forest_client_api_url")
  alarm_alert_email_recipients = get_env("alarm_alert_email_recipients")
  app_name = local.app == "public" ? "node-api-${local.app_env}" : "node-api-${local.app}-${local.app_env}"
  keycloak_config = jsonencode({
    auth_server_url = get_env("keycloak_auth_server_url")
    realm          = get_env("keycloak_realm")
    client_id      = get_env("keycloak_client_id")
    issuer         = get_env("keycloak_issuer")
  })
  dam_config = jsonencode({
    dam_url = get_env("dam_url")
    dam_private_key = get_env("dam_private_key")
    dam_user = get_env("dam_user")
    dam_rst_pdf_collection_id = get_env("dam_rst_pdf_collection_id")
    dam_rst_image_collection_id = get_env("dam_rst_image_collection_id")
    dam_rst_pdf_type_id = get_env("dam_rst_pdf_type_id")
    dam_rst_image_type_id = get_env("dam_rst_image_type_id")
  })
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
  forest_client_api_key="${local.forest_client_api_key}"
  forest_client_api_url="${local.forest_client_api_url}"
  alarm_alert_email_recipients="${local.alarm_alert_email_recipients}"
  app_env="${local.app_env}"
  app="${local.app}"
  flyway_image="${local.flyway_image}"
  api_image="${local.api_image}"
  app_name="${local.app_name}"
  keycloak_config = ${local.keycloak_config}
  dam_config = ${local.dam_config}

  frontend_remote_state = {
    bucket         = "${local.frontend_remote_state.bucket}"
    key            = "${local.frontend_remote_state.key}"
    dynamodb_table = "${local.frontend_remote_state.dynamodb_table}"
    region         = "${local.frontend_remote_state.region}"
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
EOF
}
