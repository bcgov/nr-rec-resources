include {
  path = find_in_parent_folders()
}

generate "prod_tfvars" {
  path              = "prod.auto.tfvars"
  if_exists         = "overwrite"
  disable_signature = true
  contents          = <<-EOF
  target_env = "prod"
  admin_frontend_custom_domains = ["staff.sitesandtrailsbc.ca"]
EOF
}
