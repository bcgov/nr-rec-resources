include {
  path = find_in_parent_folders()
}

# Include the common terragrunt configuration for all modules
generate "test_tfvars" {
  path              = "test.auto.tfvars"
  if_exists         = "overwrite"
  disable_signature = true
  contents          = <<-EOF
  target_env = "test"
  fargate_base_capacity = 1
  min_capacity = 1
  max_capacity = 2
EOF
}
