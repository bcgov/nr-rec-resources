provider "aws" {
  alias  = "cloudfront_waf"
  region = "us-east-1"  # WAF is only available in us-east-1 for CloudFront
}

locals {
  frontend_url = (
    can(data.terraform_remote_state.frontend[0].outputs.cloudfront.domain_name)
    ? data.terraform_remote_state.frontend[0].outputs.cloudfront.domain_name
    : "example.com" # Placeholder for ephemeral environments
  )

  cors_allowed_origins = [
    "https://${local.frontend_url}",
    "https://sitesandtrailsbc.ca",
    "https://beta.sitesandtrailsbc.ca",
    "https://staff.sitesandtrailsbc.ca"
  ]

  cors_headers = [
    "Authorization",
    "Content-Type",
    "Origin",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers",
    "Accept"
  ]

  headers = [
    "Content-Type",
    "Origin"
  ]

  allowed_headers = (
    var.enable_cors ? local.cors_headers : local.headers
  )
}


resource "aws_cloudfront_response_headers_policy" "api_cors" {
  name = "api-cors-policy-${var.app_name}"

  cors_config {
    access_control_allow_credentials = var.enable_cors
    access_control_allow_headers {
      items = local.cors_headers
    }
    access_control_allow_methods {
      items = ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
    }
    access_control_allow_origins {
      items = local.cors_allowed_origins
    }
    origin_override = true
  }
}

resource "aws_wafv2_web_acl" "cloudfront_acl" {
  provider = aws.cloudfront_waf
  name     = "api-web-acl-${var.app_name}"
  scope    = "CLOUDFRONT"

  default_action {
    allow {}
  }

  rule {
    name     = "RateLimitPerIP"
    priority = 1

    action {
      block {}
    }

    statement {
      rate_based_statement {
        limit              = 500
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "RateLimitPerIP"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "AppWebACL"
    sampled_requests_enabled   = true
  }
}

resource "aws_cloudfront_distribution" "api" {
  provider   = aws.cloudfront_waf
  web_acl_id = aws_wafv2_web_acl.cloudfront_acl.arn
  comment    = "Distribution for ${var.app_name} api."

  origin {
    domain_name = "${aws_apigatewayv2_api.app.id}.execute-api.${var.aws_region}.amazonaws.com"
    origin_id   = "http-api-origin"

    custom_origin_config {
      origin_protocol_policy = "https-only"
      http_port              = 80
      https_port             = 443
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  enabled = true

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS", "POST", "PUT", "DELETE", "PATCH"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "http-api-origin"
    viewer_protocol_policy = "https-only"

    forwarded_values {
      query_string = true

      headers = local.cors_headers

      cookies {
        forward = "all"
      }
    }

    response_headers_policy_id = aws_cloudfront_response_headers_policy.api_cors.id

    default_ttl = var.enable_cors ? 0 : 900
    min_ttl     = 0
    max_ttl     = var.enable_cors ? 0 : 900
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  logging_config {
    bucket          = "${aws_s3_bucket.cloudfront_api_logs.bucket}.s3.amazonaws.com"
    include_cookies = true
    prefix          = "cloudfront/api/"
  }

  depends_on = [aws_s3_bucket_policy.cloudfront_log_policy]
}

resource "aws_s3_bucket" "cloudfront_api_logs" {
  bucket        = "cloudfront-api-logs-lza-${var.app_name}"
  force_destroy = true
}

resource "aws_s3_bucket_public_access_block" "cloudfront_api_logs_block" {
  bucket = aws_s3_bucket.cloudfront_api_logs.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "cloudfront_api_logs_ownership" {
  depends_on = [aws_s3_bucket.cloudfront_api_logs]

  bucket = aws_s3_bucket.cloudfront_api_logs.id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "cloudfront_api_logs_sse" {
  bucket = aws_s3_bucket.cloudfront_api_logs.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_policy" "cloudfront_log_policy" {
  bucket = aws_s3_bucket.cloudfront_api_logs.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid       = "AllowCloudFrontLogs",
        Effect    = "Allow",
        Principal = {
          Service = "cloudfront.amazonaws.com"
        },
        Action    = "s3:PutObject",
        Resource  = "arn:aws:s3:::${aws_s3_bucket.cloudfront_api_logs.bucket}/cloudfront/api/*",
        Condition = {
          StringEquals = {
            "AWS:SourceAccount" = data.aws_caller_identity.current.account_id
          }
        }
      }
    ]
  })
}
