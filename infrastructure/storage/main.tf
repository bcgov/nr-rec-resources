# =============================================================================
# Remote State Data Sources
# =============================================================================

data "terraform_remote_state" "admin_frontend" {
  # Skip remote state lookup for ephemeral environments where frontend state doesn't exist yet
  count   = can(regex("ephemeral", var.app_env)) ? 0 : 1
  backend = "s3"
  config = {
    bucket         = var.admin_frontend_remote_state.bucket
    key            = var.admin_frontend_remote_state.key
    dynamodb_table = var.admin_frontend_remote_state.dynamodb_table
    region         = var.admin_frontend_remote_state.region
  }
}

locals {
  images_bucket_name           = "rst-storage-images-${var.target_env}"
  public_documents_bucket_name = "rst-storage-public-documents-${var.target_env}"
  consent_forms_bucket_name    = "rst-storage-consent-forms-${var.target_env}"

  # Get CloudFront domain from remote state
  admin_cf_domain = try(data.terraform_remote_state.admin_frontend[0].outputs.cloudfront.domain_name, "")

  # Get custom domains from remote state (for prod CORS)
  admin_custom_domains = try(data.terraform_remote_state.admin_frontend[0].outputs.custom_domains, [])

  # CORS allowed origins:
  # - Dev: localhost:3001 for local development
  # - All environments: CloudFront domain (from remote state)
  # - Prod: Custom domain aliases (from remote state)
  cors_allowed_origins = compact(concat(
    var.target_env == "dev" ? ["http://localhost:3001"] : [],
    local.admin_cf_domain != "" ? ["https://${local.admin_cf_domain}"] : [],
    var.target_env == "prod" ? [for domain in local.admin_custom_domains : "https://${domain}"] : []
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
  # Skip CORS config when no origins available (ephemeral/initial deployments)
  count  = length(local.cors_allowed_origins) > 0 ? 1 : 0
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
  # Skip CORS config when no origins available (ephemeral/initial deployments)
  count  = length(local.cors_allowed_origins) > 0 ? 1 : 0
  bucket = aws_s3_bucket.documents.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "GET", "HEAD"]
    allowed_origins = local.cors_allowed_origins
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
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
