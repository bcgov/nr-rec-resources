include {
  path = find_in_parent_folders()
}
locals {
  app_env          = get_env("app_env")
  flyway_image              = get_env("flyway_image")
  api_image          = get_env("api_image")
  target_env              = get_env("target_env")

}

# Include the common terragrunt configuration for all modules
generate "prod_tfvars" {
  path              = "prod.auto.tfvars"
  if_exists         = "overwrite"
  disable_signature = true
  contents          = <<-EOF
  target_env = "prod"
  flyway_image="${local.flyway_image}"
  api_image="${local.api_image}"
  app_env="${local.app_env}"
  app_name="node-api-${local.app_env}"
  fta_dataload_bucket = "rst-fta-dataload-oracle-prod"
  fargate_base_capacity = 2
  min_capacity = 2
  max_capacity = 10
EOF
}
