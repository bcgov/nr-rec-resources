provider "aws" {
  alias  = "cloudfront_cert"
  region = "us-east-1" # ACM certificates for CloudFront must be in us-east-1
}

# Look up the validated ACM certificate
# The certificate should include both sitesandtrailsbc.ca (apex) and *.sitesandtrailsbc.ca (wildcard)
# We look up by wildcard as it's the primary identifier that covers subdomains
# This cert was validated by providing the CNAME to the domain registrar during initial setup (see Jira issue: ORCA-401)
data "aws_acm_certificate" "wildcard_cert" {
  provider    = aws.cloudfront_cert
  domain      = "*.sitesandtrailsbc.ca"
  statuses    = ["ISSUED"]
  most_recent = true
}

# Route 53 hosted zone
resource "aws_route53_zone" "main" {
  name = var.domain_name

  tags = {
    Name        = "${var.domain_name}-zone"
    Environment = var.target_env
  }
}

# CloudFront hosted zone ID is a constant value for all CloudFront distributions globally
# Reference: https://docs.aws.amazon.com/general/latest/gr/cf_region.html
locals {
  cloudfront_hosted_zone_id = "Z2FDTNDATAQYW2"
}

# Remote state for public frontend CloudFront distribution
data "terraform_remote_state" "public_frontend" {
  backend = "s3"
  config = {
    bucket         = var.public_frontend_remote_state.bucket
    key            = var.public_frontend_remote_state.key
    dynamodb_table = var.public_frontend_remote_state.dynamodb_table
    region         = var.public_frontend_remote_state.region
  }
}

# Remote state for admin frontend CloudFront distribution
data "terraform_remote_state" "admin_frontend" {
  backend = "s3"
  config = {
    bucket         = var.admin_frontend_remote_state.bucket
    key            = var.admin_frontend_remote_state.key
    dynamodb_table = var.admin_frontend_remote_state.dynamodb_table
    region         = var.admin_frontend_remote_state.region
  }
}

# A record for apex domain -> Public CloudFront
resource "aws_route53_record" "apex" {
  zone_id = aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = data.terraform_remote_state.public_frontend.outputs.cloudfront.domain_name
    zone_id                = local.cloudfront_hosted_zone_id
    evaluate_target_health = false
  }
}

# A record for www subdomain -> Public CloudFront
resource "aws_route53_record" "www" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "www.${var.domain_name}"
  type    = "A"

  alias {
    name                   = data.terraform_remote_state.public_frontend.outputs.cloudfront.domain_name
    zone_id                = local.cloudfront_hosted_zone_id
    evaluate_target_health = false
  }
}

# A record for beta subdomain -> Public CloudFront
resource "aws_route53_record" "beta" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "beta.${var.domain_name}"
  type    = "A"

  alias {
    name                   = data.terraform_remote_state.public_frontend.outputs.cloudfront.domain_name
    zone_id                = local.cloudfront_hosted_zone_id
    evaluate_target_health = false
  }
}

# A record for staff subdomain -> Admin CloudFront
resource "aws_route53_record" "staff" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "staff.${var.domain_name}"
  type    = "A"

  alias {
    name                   = data.terraform_remote_state.admin_frontend.outputs.cloudfront.domain_name
    zone_id                = local.cloudfront_hosted_zone_id
    evaluate_target_health = false
  }
}

# TXT record for Google Search Console domain verification (apex only)
resource "aws_route53_record" "google_search_console_verification" {
  count   = length(var.google_search_console_verification_txt) > 0 ? 1 : 0
  zone_id = aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "TXT"
  ttl     = 300
  records = [var.google_search_console_verification_txt]
}
