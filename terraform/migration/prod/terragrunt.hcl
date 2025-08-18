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
  path              = "test.auto.tfvars"
  if_exists         = "overwrite"
  disable_signature = true
  contents          = <<-EOF
  target_env = "prod"
  flyway_image="${local.flyway_image}"
  api_image="${local.api_image}"
  app_env="${local.app_env}"
  fta_dataload_bucket = "rst-fta-lza-dataload-oracle-prod"
EOF
}
