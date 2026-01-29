locals {
  images_bucket_name           = "rst-storage-images-${var.target_env}"
  public_documents_bucket_name = "rst-storage-public-documents-${var.target_env}"


  # CORS allowed origins:
  # - Dev: localhost:3001 for local development
  # - All environments: CloudFront domain (if provided)
  # - Prod: Custom domain aliases (e.g., staff.sitesandtrailsbc.ca)
  cors_allowed_origins = compact(concat(
    contains(["dev", "test"], var.target_env) ? ["http://localhost:3001"] : [],
    var.admin_frontend_cloudfront_domain != "" ? ["https://${var.admin_frontend_cloudfront_domain}"] : [],
    var.target_env == "prod" ? [for domain in var.admin_frontend_custom_domains : "https://${domain}"] : []
  ))
}

# =============================================================================
# Images S3 Bucket
# =============================================================================

resource "aws_s3_bucket" "images" {
  bucket = local.images_bucket_name

  tags = var.common_tags
}

resource "aws_s3_bucket_server_side_encryption_configuration" "images" {
  bucket = aws_s3_bucket.images.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "images" {
  bucket = aws_s3_bucket.images.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_cors_configuration" "images" {
  bucket = aws_s3_bucket.images.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "GET", "HEAD"]
    allowed_origins = local.cors_allowed_origins
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# =============================================================================
# Documents S3 Bucket
# =============================================================================

resource "aws_s3_bucket" "documents" {
  bucket = local.public_documents_bucket_name

  tags = var.common_tags
}

resource "aws_s3_bucket_server_side_encryption_configuration" "documents" {
  bucket = aws_s3_bucket.documents.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "documents" {
  bucket = aws_s3_bucket.documents.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_cors_configuration" "documents" {
  bucket = aws_s3_bucket.documents.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "GET", "HEAD"]
    allowed_origins = local.cors_allowed_origins
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}
