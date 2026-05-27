// Create a CloudFront Function for beta -> main domain redirect
resource "aws_cloudfront_function" "beta_to_sites_and_trails" {
  # Create only in prod
  count   = var.app_env == "prod" ? 1 : 0
  name    = "beta-to-sitesandtrails-redirect"
  runtime = "cloudfront-js-2.0"
  comment = "Redirect beta.sitesandtrailsbc.ca to sitesandtrailsbc.ca (prod only)"
  publish = true
  code    = file("${path.module}/cloudfront_functions/betaToSitesAndTrails.js")
}
