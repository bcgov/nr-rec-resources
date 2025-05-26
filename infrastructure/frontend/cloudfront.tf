data "aws_caller_identity" "current" {}

resource "aws_s3_bucket" "frontend" {
  bucket        = "${var.app_name}-frontend-${data.aws_caller_identity.current.account_id}-${var.aws_region}"
  force_destroy = true
}

resource "aws_s3_bucket_public_access_block" "frontend_bucket_block" {
  bucket                  = aws_s3_bucket.frontend.id
  block_public_acls       = true
  block_public_policy     = true
  restrict_public_buckets = true
  ignore_public_acls      = true
}

# CloudFront origin access identity for the S3 bucket
resource "aws_cloudfront_origin_access_identity" "oai" {
  comment = "OAI for ${var.app_name} site."
}

resource "aws_s3_bucket_policy" "site_policy" {
  bucket = aws_s3_bucket.frontend.bucket

  policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [
      {
        Effect    = "Allow",
        Principal = {
          AWS = "${aws_cloudfront_origin_access_identity.oai.iam_arn}"
        },
        Action   = "s3:GetObject",
        Resource = "arn:aws:s3:::${aws_s3_bucket.frontend.bucket}/*"
      }
    ]
  })
}

provider "aws" {
  alias  = "cloudfront_cert"
  region = "us-east-1" # ACM certificates for CloudFront must be in us-east-1
}

data "aws_acm_certificate" "primary_cert" {
  provider    = aws.cloudfront_cert
  for_each    = var.app_env == "prod" ? { "primary_cert" = var.custom_domain } : {}
  domain      = each.value
  statuses    = ["ISSUED"]
  most_recent = true
}

resource "aws_cloudfront_response_headers_policy" "security_headers" {
  name = "${var.app_name}-security-headers"

  security_headers_config {
    # content_security_policy {
    #   content_security_policy = "frame-ancestors 'none'; default-src 'none'; img-src 'self'; script-src 'self'; style-src 'self'; object-src 'none'"
    #   override                = true
    # }
    content_type_options {
      override = true
    }
    frame_options {
      frame_option = "DENY"
      override     = true
    }
    referrer_policy {
      referrer_policy = "same-origin"
      override        = true
    }
    strict_transport_security {
      access_control_max_age_sec = 63072000
      include_subdomains         = true
      preload                    = true
      override                   = true
    }
    xss_protection {
      protection = true
      mode_block = true
      override   = true
    }
  }
}

resource "aws_cloudfront_distribution" "s3_distribution" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Distribution for ${var.app_name} site."
  default_root_object = "index.html"
  price_class         = "PriceClass_100"
  web_acl_id          = "${aws_wafv2_web_acl.waf_cloudfront.arn}"

  aliases = var.app_env == "prod" ? [var.custom_domain] : []

  viewer_certificate {
    acm_certificate_arn            = var.app_env == "prod" ? data.aws_acm_certificate.primary_cert["primary_cert"].arn : null
    ssl_support_method             = "sni-only"
    minimum_protocol_version       = "TLSv1.2_2021"
    cloudfront_default_certificate = var.app_env != "prod"
  }

  origin {
    domain_name = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id   = aws_s3_bucket.frontend.bucket

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }
  }
  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/"
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = aws_s3_bucket.frontend.bucket
    viewer_protocol_policy = "redirect-to-https"

    min_ttl     = 0
    default_ttl = 3600
    max_ttl     = 86400

    response_headers_policy_id = aws_cloudfront_response_headers_policy.security_headers.id

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  tags = {
    Name = "${var.app_name}-distribution"
  }
}
