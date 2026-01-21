locals {
  images_bucket_name           = "rst-storage-images-${var.target_env}"
  public_documents_bucket_name = "rst-storage-public-documents-${var.target_env}"
  consent_forms_bucket_name    = "rst-storage-consent-forms-${var.target_env}"
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

# =============================================================================
# Consent Forms S3 Bucket (Private - contains PII)
# =============================================================================

resource "aws_s3_bucket" "consent_forms" {
  bucket = local.consent_forms_bucket_name

  tags = var.common_tags
}

resource "aws_s3_bucket_server_side_encryption_configuration" "consent_forms" {
  bucket = aws_s3_bucket.consent_forms.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "consent_forms" {
  bucket = aws_s3_bucket.consent_forms.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
