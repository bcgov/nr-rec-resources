# Recreation Resource Uploads S3 Bucket Configuration
# This bucket supports presigned URL uploads for recreation resource files (images and documents)
# with automatic cleanup and security policies for large file uploads

locals {
  upload_bucket_name = "nr-rec-resources-admin-file-uploads-${var.app_name}"
}

# Main S3 bucket for recreation resource file uploads
resource "aws_s3_bucket" "recreation_resource_uploads" {
  bucket        = local.upload_bucket_name
  force_destroy = true

  tags = merge(local.common_tags, {
    Name        = "Recreation Resource Uploads"
    Purpose     = "File uploads for recreation resources"
    MaxFileSize = "100MB"
    Features    = "presigned-urls,auto-cleanup"
  })
}

# Versioning configuration for audit trail and recovery
resource "aws_s3_bucket_versioning" "recreation_resource_uploads_versioning" {
  bucket = aws_s3_bucket.recreation_resource_uploads.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Lifecycle configuration for automatic cleanup of temporary uploads
resource "aws_s3_bucket_lifecycle_configuration" "recreation_resource_uploads_lifecycle" {
  bucket = aws_s3_bucket.recreation_resource_uploads.id

  rule {
    id     = "temporary-upload-cleanup"
    status = "Enabled"

    filter {
      prefix = "uploads/"
    }

    expiration {
      days = var.s3_upload_retention_days
    }

    noncurrent_version_expiration {
      noncurrent_days = var.s3_upload_retention_days
    }

    abort_incomplete_multipart_upload {
      days_after_initiation = var.s3_upload_retention_days
    }
  }
}

# Server-side encryption configuration
resource "aws_s3_bucket_server_side_encryption_configuration" "recreation_resource_uploads_sse" {
  bucket = aws_s3_bucket.recreation_resource_uploads.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

# Public access block for security
resource "aws_s3_bucket_public_access_block" "recreation_resource_uploads_pab" {
  bucket = aws_s3_bucket.recreation_resource_uploads.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Bucket ownership controls
resource "aws_s3_bucket_ownership_controls" "recreation_resource_uploads_ownership" {
  depends_on = [aws_s3_bucket_public_access_block.recreation_resource_uploads_pab]

  bucket = aws_s3_bucket.recreation_resource_uploads.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

# CORS configuration for direct browser uploads
# Uses the same CORS origins as API Gateway, which includes the frontend CloudFront URL from remote state
resource "aws_s3_bucket_cors_configuration" "recreation_resource_uploads_cors" {
  bucket = aws_s3_bucket.recreation_resource_uploads.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "POST", "GET", "HEAD"]
    allowed_origins = concat(
      local.cors_allowed_origins, # Includes frontend CloudFront URL from remote state
      [
        "http://localhost:*",     # Local development
        "https://*.bcgov"         # Additional BC Gov domains
      ]
    )
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# Bucket policy for presigned URL uploads with size restrictions
resource "aws_s3_bucket_policy" "recreation_resource_uploads_policy" {
  depends_on = [aws_s3_bucket_public_access_block.recreation_resource_uploads_pab]
  bucket     = aws_s3_bucket.recreation_resource_uploads.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowPresignedUploads"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:PutObject"
        Resource  = "${aws_s3_bucket.recreation_resource_uploads.arn}/uploads/*"
        Condition = {
          StringEquals = {
            "s3:x-amz-server-side-encryption" = "AES256"
          }
          NumericLessThanEquals = {
            "s3:content-length" = var.s3_upload_max_file_size
          }
          StringLike = {
            "s3:x-amz-meta-rec-resource-id" = "*"
            "s3:x-amz-meta-upload-id"       = "*"
          }
        }
      },
      {
        Sid    = "DenyInsecureConnections"
        Effect = "Deny"
        Principal = "*"
        Action = "s3:*"
        Resource = [
          aws_s3_bucket.recreation_resource_uploads.arn,
          "${aws_s3_bucket.recreation_resource_uploads.arn}/*"
        ]
        Condition = {
          Bool = {
            "aws:SecureTransport" = "false"
          }
        }
      }
    ]
  })
}

# CloudWatch log group for S3 access logging (optional)
resource "aws_cloudwatch_log_group" "s3_upload_logs" {
  name              = "/aws/s3/${local.upload_bucket_name}"
  retention_in_days = 7
  
  tags = local.common_tags
}
