# S3 bucket for Exhibit A documents
# Only create for admin app
resource "aws_s3_bucket" "exhibit_a_docs" {
  count  = var.app == "admin" ? 1 : 0
  bucket = "rst-lza-exhibit-a-docs-${var.target_env}"
}

# Enable versioning for the Exhibit A bucket
resource "aws_s3_bucket_versioning" "exhibit_a_docs" {
  count  = var.app == "admin" ? 1 : 0
  bucket = aws_s3_bucket.exhibit_a_docs[0].id

  versioning_configuration {
    status = "Enabled"
  }
}

# Enable encryption for the Exhibit A bucket
resource "aws_s3_bucket_server_side_encryption_configuration" "exhibit_a_docs" {
  count  = var.app == "admin" ? 1 : 0
  bucket = aws_s3_bucket.exhibit_a_docs[0].id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Block public access for Exhibit A bucket
resource "aws_s3_bucket_public_access_block" "exhibit_a_docs" {
  count  = var.app == "admin" ? 1 : 0
  bucket = aws_s3_bucket.exhibit_a_docs[0].id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Lifecycle policy - delete old versions after 30 days
resource "aws_s3_bucket_lifecycle_configuration" "exhibit_a_docs" {
  count  = var.app == "admin" ? 1 : 0
  bucket = aws_s3_bucket.exhibit_a_docs[0].id

  rule {
    id     = "expire-old-versions"
    status = "Enabled"

    filter {
      prefix = ""
    }

    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}

# CORS configuration for Exhibit A docs (admin-only PUT/GET)
resource "aws_s3_bucket_cors_configuration" "exhibit_a_docs" {
  count  = var.app == "admin" ? 1 : 0
  bucket = aws_s3_bucket.exhibit_a_docs[0].id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "GET", "HEAD"]
    allowed_origins = concat(
      contains(["dev"], var.target_env) ? [
        "http://localhost:3000",
        "http://localhost:3001"
      ] : [],
      contains(["dev", "test"], var.target_env) ? [
        "https://${local.frontend_url}"
      ] : [],
      var.target_env == "prod" && var.custom_domain != "" ? [
        "https://${var.custom_domain}"
      ] : []
    )
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# S3 bucket for Establishment Order documents
# Only create for admin app
resource "aws_s3_bucket" "establishment_order_docs" {
  count  = var.app == "admin" ? 1 : 0
  bucket = "rst-lza-establishment-order-docs-${var.target_env}"
}

# Enable versioning for the bucket
resource "aws_s3_bucket_versioning" "establishment_order_docs" {
  count  = var.app == "admin" ? 1 : 0
  bucket = aws_s3_bucket.establishment_order_docs[0].id

  versioning_configuration {
    status = "Enabled"
  }
}

# Enable encryption for the bucket
resource "aws_s3_bucket_server_side_encryption_configuration" "establishment_order_docs" {
  count  = var.app == "admin" ? 1 : 0
  bucket = aws_s3_bucket.establishment_order_docs[0].id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Block public access
resource "aws_s3_bucket_public_access_block" "establishment_order_docs" {
  count  = var.app == "admin" ? 1 : 0
  bucket = aws_s3_bucket.establishment_order_docs[0].id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Lifecycle policy - delete old versions after 30 days
resource "aws_s3_bucket_lifecycle_configuration" "establishment_order_docs" {
  count  = var.app == "admin" ? 1 : 0
  bucket = aws_s3_bucket.establishment_order_docs[0].id

  rule {
    id     = "expire-old-versions"
    status = "Enabled"

    filter {
      prefix = ""
    }

    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}

# CORS configuration for establishment order docs
resource "aws_s3_bucket_cors_configuration" "establishment_order_docs" {
  count  = var.app == "admin" ? 1 : 0
  bucket = aws_s3_bucket.establishment_order_docs[0].id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = concat(
      # Localhost origins for dev
      contains(["dev"], var.target_env) ? [
        "http://localhost:3000",
        "http://localhost:3001"
      ] : [],
      # CloudFront URL for dev and test environments
      contains(["dev", "test"], var.target_env) ? [
        "https://${local.frontend_url}"
      ] : [],
      # Production custom domain
      var.target_env == "prod" && var.custom_domain != "" ? [
        "https://${var.custom_domain}"
      ] : []
    )
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}
