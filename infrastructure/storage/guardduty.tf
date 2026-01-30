# =============================================================================
# GuardDuty Malware Protection for S3
# =============================================================================

data "aws_guardduty_detector" "this" {}
data "aws_region" "current" {}

locals {
  protected_buckets = [aws_s3_bucket.images, aws_s3_bucket.documents, aws_s3_bucket.consent_forms]
}

# IAM role for GuardDuty
resource "aws_iam_role" "guardduty_malware_protection" {
  name = "rst-guardduty-malware-protection-${var.target_env}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "malware-protection-plan.guardduty.amazonaws.com" }
    }]
  })

  tags = var.common_tags
}

# https://docs.aws.amazon.com/guardduty/latest/ug/malware-protection-s3-iam-policy-prerequisite.html
resource "aws_iam_role_policy" "guardduty_malware_protection" {
  name = "rst-guardduty-malware-protection-policy-${var.target_env}"
  role = aws_iam_role.guardduty_malware_protection.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowManagedRuleToSendS3EventsToGuardDuty"
        Effect = "Allow"
        Action = ["events:PutRule", "events:DeleteRule", "events:PutTargets", "events:RemoveTargets"]
        Resource = [
          "arn:aws:events:${data.aws_region.current.id}:${data.aws_caller_identity.current.account_id}:rule/DO-NOT-DELETE-AmazonGuardDutyMalwareProtectionS3*"
        ]
        Condition = {
          StringLike = {
            "events:ManagedBy" = "malware-protection-plan.guardduty.amazonaws.com"
          }
        }
      },
      {
        Sid    = "AllowGuardDutyToMonitorEventBridgeManagedRule"
        Effect = "Allow"
        Action = ["events:DescribeRule", "events:ListTargetsByRule"]
        Resource = [
          "arn:aws:events:${data.aws_region.current.id}:${data.aws_caller_identity.current.account_id}:rule/DO-NOT-DELETE-AmazonGuardDutyMalwareProtectionS3*"
        ]
      },
      {
        Sid      = "AllowMalwareScan"
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:GetObjectVersion"]
        Resource = [for b in local.protected_buckets : "${b.arn}/*"]
      },
      {
        Sid      = "AllowPostScanTag"
        Effect   = "Allow"
        Action   = ["s3:PutObjectTagging", "s3:GetObjectTagging", "s3:PutObjectVersionTagging", "s3:GetObjectVersionTagging"]
        Resource = [for b in local.protected_buckets : "${b.arn}/*"]
      },
      {
        Sid      = "AllowCheckBucketOwnership"
        Effect   = "Allow"
        Action   = ["s3:ListBucket"]
        Resource = [for b in local.protected_buckets : b.arn]
      },
      {
        Sid      = "AllowEnableS3EventBridgeEvents"
        Effect   = "Allow"
        Action   = ["s3:GetBucketNotification", "s3:PutBucketNotification"]
        Resource = [for b in local.protected_buckets : b.arn]
      },
      {
        Sid      = "AllowPutValidationObject"
        Effect   = "Allow"
        Action   = ["s3:PutObject"]
        Resource = [for b in local.protected_buckets : "${b.arn}/malware-protection-resource-validation-object"]
      }
    ]
  })
}

# Malware Protection Plans
resource "aws_guardduty_malware_protection_plan" "images" {
  role = aws_iam_role.guardduty_malware_protection.arn

  protected_resource {
    s3_bucket {
      bucket_name = aws_s3_bucket.images.id
    }
  }

  actions {
    tagging {
      status = "ENABLED"
    }
  }

  tags = merge(var.common_tags, {
    Name      = "rst-malware-protection-images-${var.target_env}"
    UpdatedAt = "2026-01-22-force-revalidation"
  })

  depends_on = [aws_iam_role_policy.guardduty_malware_protection]
}

resource "aws_guardduty_malware_protection_plan" "documents" {
  role = aws_iam_role.guardduty_malware_protection.arn

  protected_resource {
    s3_bucket {
      bucket_name = aws_s3_bucket.documents.id
    }
  }

  actions {
    tagging {
      status = "ENABLED"
    }
  }

  tags = merge(var.common_tags, {
    Name      = "rst-malware-protection-documents-${var.target_env}"
    UpdatedAt = "2026-01-22-force-revalidation"
  })

  depends_on = [aws_iam_role_policy.guardduty_malware_protection]
}

resource "aws_guardduty_malware_protection_plan" "consent_forms" {
  role = aws_iam_role.guardduty_malware_protection.arn

  protected_resource {
    s3_bucket {
      bucket_name = aws_s3_bucket.consent_forms.id
    }
  }

  actions {
    tagging {
      status = "ENABLED"
    }
  }

  tags = merge(var.common_tags, {
    Name      = "rst-malware-protection-consent-forms-${var.target_env}"
    UpdatedAt = "2026-01-22-force-revalidation"
  })

  depends_on = [aws_iam_role_policy.guardduty_malware_protection]
}
