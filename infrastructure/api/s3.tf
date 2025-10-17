# S3 bucket for Establishment Order documents
resource "aws_s3_bucket" "establishment_order_docs" {
  bucket = "rst-lza-establishment-order-docs-${var.target_env}"
}

# Enable versioning for the bucket
resource "aws_s3_bucket_versioning" "establishment_order_docs" {
  bucket = aws_s3_bucket.establishment_order_docs.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Enable encryption for the bucket
resource "aws_s3_bucket_server_side_encryption_configuration" "establishment_order_docs" {
  bucket = aws_s3_bucket.establishment_order_docs.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Block public access
resource "aws_s3_bucket_public_access_block" "establishment_order_docs" {
  bucket = aws_s3_bucket.establishment_order_docs.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Lifecycle policy - delete old versions after 30 days
resource "aws_s3_bucket_lifecycle_configuration" "establishment_order_docs" {
  bucket = aws_s3_bucket.establishment_order_docs.id

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
