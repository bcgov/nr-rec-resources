include {
  path = find_in_parent_folders()
}
locals {
  app_env              = get_env("app_env")
}

# Include the common terragrunt configuration for all modules
generate "prod_tfvars" {
  path              = "test.auto.tfvars"
  if_exists         = "overwrite"
  disable_signature = true
  contents          = <<-EOF
  target_env = "prod"
  db_cluster_name = "qsawsc-aurora-cluster-${local.app_env}"
  app_env="${local.app_env}"
  fta_dataload_bucket = "rst-fta-dataload-oracle-prod"
  ha_enabled = true
  min_capacity = 2
  max_capacity = 64
EOF
}
