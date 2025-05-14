include {
  path = find_in_parent_folders()
}
locals {
  app_env              = get_env("app_env")
}

# Include the common terragrunt configuration for all modules
generate "test_tfvars" {
  path              = "test.auto.tfvars"
  if_exists         = "overwrite"
  disable_signature = true
  contents          = <<-EOF
  target_env = "test"
  db_cluster_name = "qsawsc-aurora-cluster-${local.app_env}"
  app_env="${local.app_env}"
  seconds_until_auto_pause = 3600
EOF
}
