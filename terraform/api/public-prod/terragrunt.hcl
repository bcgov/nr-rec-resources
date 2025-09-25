include {
  path = find_in_parent_folders()
}

# Include the common terragrunt configuration for all modules
generate "prod_tfvars" {
  path              = "prod.auto.tfvars"
  if_exists         = "overwrite"
  disable_signature = true
  contents          = <<-EOF
  target_env = "prod"
  fta_dataload_bucket = "rst-fta-dataload-oracle-prod"
  api_cpu = 512
  api_memory = 1024
  fargate_base_capacity = 2
  scaling_adjustment_increase = 5
  min_capacity = 2
  max_capacity = 30
EOF
}
