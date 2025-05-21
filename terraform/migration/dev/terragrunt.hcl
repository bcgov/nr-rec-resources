include {
  path = find_in_parent_folders()
}
locals {
  app              = get_env("app")
  app_env          = get_env("app_env")
  flyway_image     = get_env("flyway_image")
  api_image        = get_env("api_image")
  target_env       = get_env("target_env")
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
  app_name="node-api-${local.app}-${local.app_env}"
EOF
}
