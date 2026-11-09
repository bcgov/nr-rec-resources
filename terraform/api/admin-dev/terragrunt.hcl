include {
  path = find_in_parent_folders()
}

# Include the common terragrunt configuration for all modules
generate "dev_tfvars" {
  path              = "dev.auto.tfvars"
  if_exists         = "overwrite"
  disable_signature = true
  contents          = <<-EOF
  target_env        = "dev"
  enable_cors       = true
  api_custom_domains = ["staff-api.dev.sitesandtrailsbc.ca"]
  use_api_custom_domain_url = true
EOF
}
