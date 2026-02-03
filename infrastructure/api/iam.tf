
data "aws_caller_identity" "current" {}
# ECS task execution role data
data "aws_iam_policy_document" "ecs_task_execution_role" {
  version = "2012-10-17"
  statement {
    sid     = ""
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}
data "aws_iam_policy" "appRDS" {
  name = "AmazonRDSDataFullAccess"
}

# ECS task execution role
resource "aws_iam_role" "ecs_task_execution_role" {
  name               = "${var.app_name}_ecs_task_execution_role"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_execution_role.json

  tags = local.common_tags
}

# ECS task execution role policy attachment
resource "aws_iam_role_policy_attachment" "ecs_task_execution_role" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy" "ecs_task_execution_cwlogs" {
  name = "${var.app_name}-ecs_task_execution_cwlogs"
  role = aws_iam_role.ecs_task_execution_role.id

  policy = <<-EOF
  {
      "Version": "2012-10-17",
      "Statement": [
          {
              "Effect": "Allow",
              "Action": [
                  "logs:CreateLogGroup"
              ],
              "Resource": [
                  "arn:aws:logs:*:*:*"
              ]
          }
      ]
  }
EOF
}

resource "aws_iam_role" "app_container_role" {
  name = "${var.app_name}_container_role"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF

  tags = local.common_tags
}

# IAM policy needed to publish CloudWatch metrics
resource "aws_iam_role_policy" "cloudwatch_metrics" {
  name = "cloudwatch_metrics"
  role = aws_iam_role.app_container_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = "cloudwatch:PutMetricData"
        Resource = "*"
      }
    ]
  })
}

# IAM policy for S3 access to Establishment Order documents
# Only create for admin app
resource "aws_iam_role_policy" "s3_establishment_order_docs" {
  count = var.app == "admin" ? 1 : 0
  name  = "${var.app_name}_s3_establishment_order_docs"
  role  = aws_iam_role.app_container_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          "arn:aws:s3:::rst-lza-establishment-order-docs-${var.target_env}",
          "arn:aws:s3:::rst-lza-establishment-order-docs-${var.target_env}/*"
        ]
      }
    ]
  })
}

# IAM policy for S3 access to shared storage buckets (images and documents)
# Admin app gets read/write access, public app gets read-only access
resource "aws_iam_role_policy" "s3_storage_buckets" {
  name = "${var.app_name}_s3_storage_buckets"
  role = aws_iam_role.app_container_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = var.app == "admin" ? [
          "s3:GetObject",
          "s3:PutObject",
          "s3:PutObjectTagging",
          "s3:DeleteObject",
          "s3:ListBucket"
          ] : [
          "s3:GetObject",
          "s3:ListBucket"
        ]
        Resource = [
          "arn:aws:s3:::rst-storage-images-${var.target_env}",
          "arn:aws:s3:::rst-storage-images-${var.target_env}/*",
          "arn:aws:s3:::rst-storage-public-documents-${var.target_env}",
          "arn:aws:s3:::rst-storage-public-documents-${var.target_env}/*"
        ]
      }
    ]
  })
}

# IAM policy for S3 access to consent forms bucket (contains PII)
# Only admin app needs access - consent forms are sensitive documents
resource "aws_iam_role_policy" "s3_consent_forms" {
  count = var.app == "admin" ? 1 : 0
  name  = "${var.app_name}_s3_consent_forms"
  role  = aws_iam_role.app_container_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:PutObjectTagging",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          "arn:aws:s3:::rst-storage-consent-forms-${var.target_env}",
          "arn:aws:s3:::rst-storage-consent-forms-${var.target_env}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy" "app_container_cwlogs" {
  name = "${var.app_name}_container_cwlogs"
  role = aws_iam_role.app_container_role.id

  policy = <<-EOF
  {
      "Version": "2012-10-17",
      "Statement": [
          {
              "Effect": "Allow",
              "Action": [
                  "logs:CreateLogGroup",
                  "logs:CreateLogStream",
                  "logs:PutLogEvents",
                  "logs:DescribeLogStreams"
              ],
              "Resource": [
                  "arn:aws:logs:*:*:*"
              ]
          }
      ]
  }
EOF
}
resource "aws_iam_role_policy_attachment" "rdsAttach" {
  role       = aws_iam_role.app_container_role.name
  policy_arn = data.aws_iam_policy.appRDS.arn
}

resource "aws_dynamodb_table_item" "iam_user" {
  table_name = "BCGOV-LZA-IAM-USER-TABLE"
  hash_key   = "UserName"

  item = jsonencode({
    UserName = {
      S = "${var.app_name}-fta-rec-s3-upload-service-account"
    }
  })
}

resource "aws_iam_user_policy" "s3_upload_policy" {
  name = "${var.app_name}_fta_rec_s3_upload_policy"
  user = "${var.app_name}-fta-rec-s3-upload-service-account"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:ListBucket",
          "s3:GetObject",
          "s3:ListObjects",
          "s3:PutObject"
        ]
        Resource = [
          "arn:aws:s3:::${var.fta_dataload_bucket}",
          "arn:aws:s3:::${var.fta_dataload_bucket}/*"
        ]
      },
      {
        Effect = "Allow",
        Action = "iam:PassRole",
        Resource = [
          "*"
        ]
      },
      {
        Effect = "Allow",
        Action = [
          "ecs:RunTask",
          "ecs:DescribeTasks",
          "ec2:DescribeSubnets",
          "ec2:DescribeSecurityGroups"
        ],
        Resource = [
          "*"
        ]
      }
    ]
  })

  depends_on = [aws_dynamodb_table_item.iam_user]
}
