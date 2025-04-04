data "aws_iam_policy_document" "s3_import_assume" {
  statement {
    actions = [
      "sts:AssumeRole",
    ]

    principals {
      type        = "Service"
      identifiers = ["rds.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "s3_import" {
  name                  = "${var.app_env}-rds-s3-import-role"
  description           = "IAM role to allow RDS to import CSV backup from S3"
  assume_role_policy    = data.aws_iam_policy_document.s3_import_assume.json
  force_detach_policies = true
}

data "aws_iam_policy_document" "s3_import" {
  statement {
    actions = [
      "s3:GetObject",
      "s3:ListBucket"
    ]
    effect = "Allow"
    resources = [
        "arn:aws:s3:::${var.fta_dataload_bucket}",
        "arn:aws:s3:::${var.fta_dataload_bucket}/*"
      ]
  }
}

resource "aws_iam_role_policy" "s3_import" {
  role   = aws_iam_role.s3_import.name
  policy = data.aws_iam_policy_document.s3_import.json
}

resource "aws_rds_cluster_role_association" "s3_import" {
  db_cluster_identifier = var.db_cluster_name
  feature_name          = "s3Import"
  role_arn              = aws_iam_role.s3_import.arn

  depends_on = [module.aurora_postgresql_v2]
}
