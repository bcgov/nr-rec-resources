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
  csp_urls = {
      image_src = "https://dam.lqc63d-prod.nimbus.cloud.gov.bc.ca https://beta.sitesandtrailsbc.ca https://sitesandtrailsbc.ca"
      connect_src = "https://bcparks.api.gov.bc.ca"
      matomo_src = "https://iuqxrr50zl.execute-api.ca-central-1.amazonaws.com"
    }
EOF
}
