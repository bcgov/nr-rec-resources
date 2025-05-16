include {
  path = find_in_parent_folders()
}

# Include the common terragrunt configuration for all modules
generate "prod_tfvars" {
  path              = "dev.auto.tfvars"
  if_exists         = "overwrite"
  disable_signature = true
  contents          = <<-EOF
  target_env = "prod"
EOF
}
