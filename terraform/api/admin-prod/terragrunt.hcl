include {
  path = find_in_parent_folders()
}

# Include the common terragrunt configuration for all modules
generate "prod_tfvars" {
  path                  = "prod.auto.tfvars"
  if_exists             = "overwrite"
  disable_signature     = true
  contents              = <<-EOF
  target_env            = "prod"
  fta_dataload_bucket   = "rst-fta-dataload-oracle-prod"
  api_cpu               = 512
  api_memory            = 1024
  fargate_base_capacity = 1
  scaling_adjustment_increase = 2
  min_capacity          = 1
  max_capacity          = 10
  enable_cors           = true
EOF
}
