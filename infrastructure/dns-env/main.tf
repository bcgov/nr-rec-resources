locals {
  cloudfront_hosted_zone_id = "Z2FDTNDATAQYW2"
  zone_name                 = "${var.env}.${var.domain_name}"
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

# ACM validation CNAME for the *.{env}.{domain} SAN on the shared multi-SAN cert.
# The cert is created and validated outside Terraform (already ISSUED), so we do not
# validate it here. This record must live in THIS child zone so that ACM automatic
# renewal keeps succeeding once the prod parent zone delegates {env}.{domain} to us.
# The name/value are supplied statically because the aws_acm_certificate data source
# no longer exposes domain_validation_options in AWS provider v6.
resource "aws_route53_record" "acm_validation" {
  zone_id = aws_route53_zone.main.zone_id
  name    = var.acm_cert_validation_cname.name
  type    = "CNAME"
  ttl     = 300
  records = [var.acm_cert_validation_cname.value]
}
