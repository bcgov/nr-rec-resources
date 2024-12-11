data "aws_caller_identity" "current" {}
locals {
  src_dir = "./"
  content_type_map = {
    html = "text/html",
    ico  = "image/x-icon",
    js   = "application/javascript",
    json = "application/json",
    svg  = "image/svg+xml",
    ttf  = "font/ttf",
    txt  = "text/txt",
    css  = "text/css"
  }
  files_raw = fileset(local.src_dir, "**")
  files = toset([
    for jsFile in local.files_raw:
      jsFile if jsFile != ".terragrunt-source-manifest" && jsFile != "assets/.terragrunt-source-manifest"
  ])
}

resource "aws_s3_bucket" "frontend" {
  bucket = "${var.app_name}-frontend-${data.aws_caller_identity.current.account_id}-${var.aws_region}"
  force_destroy = true
}

resource "aws_s3_bucket_public_access_block" "frontend_bucket_block" {
  bucket            = aws_s3_bucket.frontend.id
  block_public_acls = true
  block_public_policy = true
  restrict_public_buckets = true
  ignore_public_acls      = true

}


# CloudFront distribution for the S3 bucket
resource "aws_cloudfront_origin_access_identity" "oai" {
  comment = "OAI for ${var.app_name} site."
}

resource "aws_s3_bucket_policy" "site_policy" {
  bucket = aws_s3_bucket.frontend.bucket

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Principal = {
          "AWS" : "${aws_cloudfront_origin_access_identity.oai.iam_arn}"
        },
        Action   = "s3:GetObject",
        Resource = "arn:aws:s3:::${aws_s3_bucket.frontend.bucket}/*"
      }
    ]
  })
}

resource "aws_cloudfront_distribution" "s3_distribution" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Distribution for ${var.app_name} site."
  default_root_object = "index.html"
  price_class         = "PriceClass_100"
  web_acl_id          = "${aws_wafv2_web_acl.waf_cloudfront.arn}"

  origin {
    domain_name = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id   = aws_s3_bucket.frontend.bucket

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }
  }
  # Required for SPA application to redirect requests to deep links to root, which loads index.html, which loads the Vue app
  # and then the Vue router properly resolves the deep link.
  custom_error_response {
    error_code = 403
    response_code = 200
    response_page_path = "/"
  }


  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = aws_s3_bucket.frontend.bucket

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Name = "${var.app_name}-distribution"
  }
}

resource "aws_s3_object" "site_files" {
  
  for_each = local.files

  # Create an object from each
  bucket = aws_s3_bucket.frontend.id
  key    = each.value
  source = "${local.src_dir}/${each.value}"
  etag = filemd5("${local.src_dir}/${each.value}")

  content_type = lookup(local.content_type_map, regex("\\.(?P<extension>[A-Za-z0-9]+)$", each.value).extension, "application/octet-stream")
}
