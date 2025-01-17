locals {
  common_tags        = var.common_tags
}


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

data "aws_iam_role" "ecs_task_execution_role" {
  name = "${var.app_name}_ecs_task_execution_role"
}

data "aws_iam_role" "app_container_role" {
  name = "${var.app_name}_container_role"
}
