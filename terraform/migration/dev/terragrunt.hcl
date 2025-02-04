include {
  path = find_in_parent_folders()
}
locals {
  app_env          = get_env("app_env")
  flyway_image              = get_env("flyway_image")
  api_image          = get_env("api_image")
  target_env              = get_env("target_env")
  vpc_target_env              = get_env("vpc_target_env")
}

# Include the common terragrunt configuration for all modules
generate "dev_tfvars" {
  path              = "dev.auto.tfvars"
  if_exists         = "overwrite"
  disable_signature = true
  contents          = <<-EOF
  target_env = "dev"
  flyway_image="${local.flyway_image}"
  api_image="${local.api_image}"
  app_env="${local.app_env}"
  vpc_target_env="${local.vpc_target_env}"
  app_name="node-api-${local.app_env}"
EOF
}
