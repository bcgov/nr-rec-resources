locals {
  common_tags        = var.common_tags
  container_name = "${var.app_name}"
  rds_app_env = (contains(["dev", "test", "prod"], var.app_env) ? var.app_env : "dev") # if app_env is not dev, test, or prod, default to dev
}

data "aws_iam_role" "ecs_task_execution_role" {
  name = "${var.app_name}_ecs_task_execution_role"
}

data "aws_iam_role" "app_container_role" {
  name = "${var.app_name}_container_role"
}

data "aws_secretsmanager_secret" "db_master_creds" {
  name = "aurora-postgis-db-master-creds-${var.target_env}_${local.rds_app_env}"
}

data "aws_rds_cluster" "rds_cluster" {
  cluster_identifier = "qsawsc-aurora-cluster-${local.rds_app_env}"
}

data "aws_secretsmanager_secret_version" "db_master_creds_version" {
  secret_id = data.aws_secretsmanager_secret.db_master_creds.id
}

locals {
  db_master_creds = jsondecode(data.aws_secretsmanager_secret_version.db_master_creds_version.secret_string)
}

data "aws_ecs_cluster" "ecs_cluster" {
  cluster_name = "ecs-cluster-${var.app_name}"
}

resource "terraform_data" "trigger_deployment" {
  input = "${timestamp()}"
}

resource "aws_ecs_task_definition" "flyway_task" {
  family                   = "${var.app_name}-flyway-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = data.aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = data.aws_iam_role.app_container_role.arn
  container_definitions = jsonencode([
    {
      name      = "${var.app_name}-flyway"
      image     = "${var.flyway_image}"
      essential   = true
      environment = [
        {
          name = "APP_ENV"
          value = local.rds_app_env
        },
        {
          name  = "FLYWAY_URL"
          value = "jdbc:postgresql://${data.aws_rds_cluster.rds_cluster.endpoint}/${var.db_name}"
        },
        {
          name  = "FLYWAY_USER"
          value = local.db_master_creds.username
        },
        {
          name  = "FLYWAY_PASSWORD"
          value = local.db_master_creds.password
        },
        {
          name  = "FLYWAY_DEFAULT_SCHEMA"
          value = "${var.db_schema}"
        },
        {
          name  = "FLYWAY_CONNECT_RETRIES"
          value = "2"
        },
        {
          name  = "FLYWAY_GROUP"
          value = "true"
        },
        {
          # Enable Flyway clean
          name = "FLYWAY_CLEAN_DISABLED"
          value = "false"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-create-group  = "true"
          awslogs-group         = "/ecs/${var.app_name}/flyway"
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }
      mountPoints = []
      volumesFrom = []

    }
  ])
  lifecycle {
    replace_triggered_by = [terraform_data.trigger_deployment]
  }
  provisioner "local-exec" {
  command = <<-EOF
    task_arn=$(aws ecs run-task \
      --task-definition ${var.app_name}-flyway-task \
      --cluster ${data.aws_ecs_cluster.ecs_cluster.id} \
      --count 1 \
      --network-configuration awsvpcConfiguration={securityGroups=[${data.aws_security_group.app.id}],subnets=${data.aws_subnets.app.ids[0]},assignPublicIp=DISABLED} \
      --query 'tasks[0].taskArn' \
      --output text)

    echo "Flyway task started with ARN: $task_arn at $(date)."

    echo "Waiting for Flyway task to complete..."
    aws ecs wait tasks-stopped --cluster ${data.aws_ecs_cluster.ecs_cluster.id} --tasks $task_arn

    echo "Flyway task completed at $(date)."

    # Fetch the task's exit code
    task_exit_code=$(aws ecs describe-tasks \
      --cluster ${data.aws_ecs_cluster.ecs_cluster.id} \
      --tasks $task_arn \
      --query 'tasks[0].containers[0].exitCode' \
      --output text)

    if [ "$task_exit_code" != "0" ]; then
      echo "Flyway task failed with exit code: $task_exit_code"
      log_stream_name=$(aws logs describe-log-streams \
        --log-group-name "/ecs/${var.app_name}/flyway" \
        --order-by "LastEventTime" \
        --descending \
        --limit 1 \
        --query 'logStreams[0].logStreamName' \
        --output text)

      echo "Fetching logs from log stream: $log_stream_name"
      aws logs get-log-events \
        --log-group-name "/ecs/${var.app_name}/flyway" \
        --log-stream-name $log_stream_name \
        --limit 1000 \
        --no-cli-pager

      exit 1
    fi

    echo "Flyway task succeeded with exit code: $task_exit_code."
  EOF
}
}
