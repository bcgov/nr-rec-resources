data "aws_caller_identity" "current" {}

locals {
  # Managed Cache Policy: CachingOptimized
  # https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-cache-policies.html
  cache_policy_caching_optimized = "658327ea-f89d-4fab-a63d-7e88639e58f6"

  # Managed Response Headers Policy: CORS-with-preflight
  # https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-response-headers-policies.html
  response_headers_policy_cors_preflight = "5cc3b908-e619-4b99-88e5-2cf7f45965bd"
}

# =============================================================================
# Origin Access Control for CloudFront to access private S3 buckets
# =============================================================================

resource "aws_cloudfront_origin_access_control" "storage" {
  name                              = "rst-storage-oac-${var.target_env}"
  description                       = "OAC for RST storage buckets"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# =============================================================================
# S3 Bucket Policies to allow CloudFront OAC access
# =============================================================================

resource "aws_s3_bucket_policy" "images" {
  bucket = aws_s3_bucket.images.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipal"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.images.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.storage.arn
          }
        }
      }
    ]
  })
}

resource "aws_s3_bucket_policy" "documents" {
  bucket = aws_s3_bucket.documents.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipal"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.documents.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.storage.arn
          }
        }
      }
    ]
  })
}

# =============================================================================
# CloudFront Distribution for serving assets
# =============================================================================

resource "aws_cloudfront_distribution" "storage" {
  enabled         = true
  is_ipv6_enabled = true
  comment         = "Distribution for s3 public image and document storage-${var.target_env}"
  price_class     = "PriceClass_100"

  origin {
    domain_name              = aws_s3_bucket.images.bucket_regional_domain_name
    origin_id                = "images"
    origin_access_control_id = aws_cloudfront_origin_access_control.storage.id
  }

  origin {
    domain_name              = aws_s3_bucket.documents.bucket_regional_domain_name
    origin_id                = "documents"
    origin_access_control_id = aws_cloudfront_origin_access_control.storage.id
  }

  # Default behavior - serve from images bucket
  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "images"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"

    cache_policy_id            = local.cache_policy_caching_optimized
    response_headers_policy_id = local.response_headers_policy_cors_preflight
  }

  # Cache behavior for images path
  ordered_cache_behavior {
    path_pattern           = "/images/*"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "images"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"

    cache_policy_id            = local.cache_policy_caching_optimized
    response_headers_policy_id = local.response_headers_policy_cors_preflight
  }

  # Cache behavior for documents path
  ordered_cache_behavior {
    path_pattern           = "/documents/*"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "documents"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"

    cache_policy_id            = local.cache_policy_caching_optimized
    response_headers_policy_id = local.response_headers_policy_cors_preflight
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
    minimum_protocol_version       = "TLSv1.2_2021"
  }

  tags = merge(var.common_tags, {
    Name = "rst-storage-cdn-${var.target_env}"
  })
}
