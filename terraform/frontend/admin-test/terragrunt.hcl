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
  csp_urls = {
      image_src = "https://dam.lqc63d-test.nimbus.cloud.gov.bc.ca"
      connect_src = "https://dam.lqc63d-test.nimbus.cloud.gov.bc.ca"
      matomo_src = "https://iuqxrr50zl.execute-api.ca-central-1.amazonaws.com"
  }
EOF
}
