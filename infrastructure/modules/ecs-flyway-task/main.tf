resource "null_resource" "trigger_deployment" {
  triggers = {
    deployment_timestamp = timestamp()
  }
}

resource "aws_ecs_task_definition" "flyway_task" {
  family                   = "${var.app_name}-flyway-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.cpu
  memory                   = var.memory
  execution_role_arn       = var.execution_role_arn
  task_role_arn            = var.task_role_arn

  container_definitions = jsonencode([
    {
      name      = "${var.app_name}-flyway"
      image     = var.flyway_image
      essential   = true
      environment = var.environment
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
    create_before_destroy = true
    replace_triggered_by = [null_resource.trigger_deployment]
  }

  provisioner "local-exec" {
    command = <<-EOF
      task_arn=$(aws ecs run-task \
        --task-definition ${var.app_name}-flyway-task \
        --cluster ${var.cluster_id} \
        --count 1 \
        --network-configuration awsvpcConfiguration={securityGroups=[${var.security_group}],subnets=${var.subnet},assignPublicIp=DISABLED} \
        --query 'tasks[0].taskArn' \
        --output text)

      echo "Flyway task started with ARN: $task_arn at $(date)."

      echo "Waiting for Flyway task to complete..."
      aws ecs wait tasks-stopped --cluster ${var.cluster_id} --tasks $task_arn

      echo "Flyway task completed at $(date)."

      task_status=$(aws ecs describe-tasks --cluster ${var.cluster_id} --tasks $task_arn --query 'tasks[0].lastStatus' --output text)
      echo "Flyway task status: $task_status at $(date)."

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

      task_exit_code=$(aws ecs describe-tasks \
        --cluster ${var.cluster_id} \
        --tasks $task_arn \
        --query 'tasks[0].containers[0].exitCode' \
        --output text)

      if [ "$task_exit_code" != "0" ]; then
        echo "Flyway task failed with exit code: $task_exit_code"
        exit 1
      fi

      echo "Flyway task succeeded with exit code: $task_exit_code."
    EOF
  }
}
