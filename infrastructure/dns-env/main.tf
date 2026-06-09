provider "aws" {
  alias  = "east"
  region = "us-east-1"
}

locals {
  cloudfront_hosted_zone_id = "Z2FDTNDATAQYW2"
  zone_name                 = "${var.env}.${var.domain_name}"
  cert_validation_option = one([
    for o in data.aws_acm_certificate.cert.domain_validation_options :
    o if o.domain_name == "*.${local.zone_name}"
  ])
}

# Look up the multi-SAN cert in this account (created manually as a pre-deployment step).
# The lookup domain "*.${var.domain_name}" must match the cert's primary domain; the same
# coupling exists in infrastructure/frontend/cloudfront.tf. If the cert is recreated with a
# different primary domain, update both places.
data "aws_acm_certificate" "cert" {
  provider    = aws.east
  domain      = "*.${var.domain_name}"
  statuses    = ["ISSUED", "PENDING_VALIDATION"]
  most_recent = true
}

resource "aws_route53_zone" "main" {
  name = local.zone_name

  tags = {
    Environment = var.env
  }
}

data "terraform_remote_state" "public_frontend" {
  backend = "s3"
  config = {
    bucket         = var.public_frontend_remote_state.bucket
    key            = var.public_frontend_remote_state.key
    dynamodb_table = var.public_frontend_remote_state.dynamodb_table
    region         = var.public_frontend_remote_state.region
  }
}

data "terraform_remote_state" "admin_frontend" {
  backend = "s3"
  config = {
    bucket         = var.admin_frontend_remote_state.bucket
    key            = var.admin_frontend_remote_state.key
    dynamodb_table = var.admin_frontend_remote_state.dynamodb_table
    region         = var.admin_frontend_remote_state.region
  }
}

resource "aws_route53_record" "apex" {
  zone_id = aws_route53_zone.main.zone_id
  name    = local.zone_name
  type    = "A"

  alias {
    name                   = data.terraform_remote_state.public_frontend.outputs.cloudfront.domain_name
    zone_id                = local.cloudfront_hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "staff" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "staff.${local.zone_name}"
  type    = "A"

  alias {
    name                   = data.terraform_remote_state.admin_frontend.outputs.cloudfront.domain_name
    zone_id                = local.cloudfront_hosted_zone_id
    evaluate_target_health = false
  }
}

# ACM validation CNAME for the *.{env}.{domain} SAN on the shared cert
resource "aws_route53_record" "acm_validation" {
  zone_id = aws_route53_zone.main.zone_id
  name    = local.cert_validation_option.resource_record_name
  type    = "CNAME"
  ttl     = 300
  records = [local.cert_validation_option.resource_record_value]
}

# Waits for the cert to be fully Issued before this module completes
resource "aws_acm_certificate_validation" "cert" {
  provider                = aws.east
  certificate_arn         = data.aws_acm_certificate.cert.arn
  validation_record_fqdns = [aws_route53_record.acm_validation.fqdn]
}
