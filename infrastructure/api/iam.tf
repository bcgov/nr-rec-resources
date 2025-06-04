
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
        Effect = "Allow"
        Action = "cloudwatch:PutMetricData"
        Resource = "*"
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
  table_name = "BCGOV_IAM_USER_TABLE"
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
          "s3:PutObject",

          // Additional permissions for running Flyway migration ECS task
          "iam:PassRole",
          "ecs:RunTask",
          "ecs:DescribeTasks",
          "ec2:DescribeSubnets",
          "ec2:DescribeSecurityGroups"
        ]
        Resource = [
          "arn:aws:s3:::${var.fta_dataload_bucket}",
          "arn:aws:s3:::${var.fta_dataload_bucket}/*"
        ]
      }
    ]
  })

  depends_on = [aws_dynamodb_table_item.iam_user]
}
