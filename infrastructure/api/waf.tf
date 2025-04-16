provider "aws" {
  alias  = "cloudfront_waf"
  region = "us-east-1" # WAF is only available in us-east-1 for CloudFront
}

resource "aws_wafv2_web_acl" "cloudfront_acl" {
  provider = aws.cloudfront_waf
  name     = "app-web-acl-${var.app_name}"
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
    allowed_methods  = ["GET", "HEAD", "OPTIONS", "POST", "PUT", "DELETE", "PATCH"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "http-api-origin"

    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = true

      cookies {
        forward = "all"
      }
    }
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
    bucket          = aws_s3_bucket.cloudfront_api_logs.bucket_regional_domain_name
    include_cookies = true
    prefix          = "cloudfront/api/"
  }
}

resource "aws_s3_bucket" "cloudfront_api_logs" {
  bucket        = "cloudfront-api-logs-${var.app_name}"
  force_destroy = true
}

resource "aws_s3_bucket_ownership_controls" "cloudfront_api_logs_ownership" {
  depends_on = [aws_s3_bucket.cloudfront_api_logs]

  bucket = aws_s3_bucket.cloudfront_api_logs.id

  rule {
    object_ownership = "BucketOwnerEnforced"
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
        Effect    = "Allow",
        Action    = "s3:PutObject",
        Resource  = "arn:aws:s3:::${aws_s3_bucket.cloudfront_api_logs.bucket}/cloudfront/api/*",
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
      }
    ]
  })
}
