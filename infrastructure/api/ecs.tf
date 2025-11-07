locals {
  container_name = var.app_name
  rds_app_env    = (contains(["dev", "test", "prod"], var.app_env) ? var.app_env : "dev") # if app_env is not dev, test, or prod, default to dev
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


resource "aws_ecs_cluster" "ecs_cluster" {
  name = "ecs-cluster-${var.app_name}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_ecs_cluster_capacity_providers" "ecs_cluster_capacity_providers" {
  cluster_name = aws_ecs_cluster.ecs_cluster.name

  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  default_capacity_provider_strategy {
    base              = 1
    weight            = 100
    capacity_provider = "FARGATE_SPOT"
  }
}

resource "terraform_data" "trigger_deployment" {
  input = timestamp()
}


module "flyway_rst_migration_task" {
  source = "../modules/ecs-flyway-task"

  app_name           = var.app_name
  flyway_image       = var.flyway_image
  cpu                = "512"
  memory             = "1024"
  db_schema          = "rst"
  execution_role_arn = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn      = aws_iam_role.app_container_role.arn
  environment = [
    {
      name  = "APP_ENV"
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
      # This defaults to true, though we want to enable it only in dev to reset the database
      # also needs an update in migrations/rst/entrypoint.sh file for the flyaway ecs task to run correctly
      name  = "FLYWAY_CLEAN_DISABLED"
      value = contains(["dev"], local.rds_app_env) ? "false" : "true"
    }
  ]
  aws_region     = var.aws_region
  cluster_id     = aws_ecs_cluster.ecs_cluster.id
  security_group = data.aws_security_group.app.id
  subnet         = data.aws_subnets.app.ids[0]
}


resource "aws_ecs_task_definition" "node_api_task" {
  family                   = "${var.app_name}-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.api_cpu
  memory                   = var.api_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.app_container_role.arn
  container_definitions = jsonencode([
    {
      name      = "${local.container_name}"
      image     = "${var.api_image}"
      essential = true
      environment = [
        {
          name  = "POSTGRES_HOST"
          value = data.aws_rds_cluster.rds_cluster.endpoint
        },
        {
          name  = "POSTGRES_USER"
          value = local.db_master_creds.username
        },
        {
          name  = "POSTGRES_PASSWORD"
          value = local.db_master_creds.password
        },
        {
          name  = "POSTGRES_DATABASE"
          value = var.db_name
        },
        {
          name  = "POSTGRES_SCHEMA"
          value = "${var.db_schema}"
        },
        {
          name  = "PORT"
          value = "8000"
        },
        {
          name  = "FOREST_CLIENT_API_KEY"
          value = var.forest_client_api_key
        },
        {
          name  = "FOREST_CLIENT_API_URL"
          value = var.forest_client_api_url
        },
        {
          name  = "APP_ENV"
          value = var.app_env
        },
        {
          name  = "KEYCLOAK_AUTH_SERVER_URL"
          value = var.keycloak_config.auth_server_url
        },
        {
          name  = "KEYCLOAK_REALM"
          value = var.keycloak_config.realm
        },
        {
          name  = "KEYCLOAK_CLIENT_ID"
          value = var.keycloak_config.client_id
        },
        {
          name  = "KEYCLOAK_ISSUER"
          value = var.keycloak_config.issuer
        },
        {
          name  = "DAM_URL"
          value = var.dam_config.dam_url
        },
        {
          name  = "DAM_PRIVATE_KEY"
          value = var.dam_config.dam_private_key
        },
        {
          name  = "DAM_USER"
          value = var.dam_config.dam_user
        },
        {
          name  = "DAM_RST_PDF_COLLECTION_ID"
          value = var.dam_config.dam_rst_pdf_collection_id
        },
        {
          name  = "DAM_RST_IMAGE_COLLECTION_ID"
          value = var.dam_config.dam_rst_image_collection_id
        },
        {
          name  = "DAM_RESOURCE_TYPE_PDF"
          value = var.dam_config.dam_rst_pdf_type_id
        },
        {
          name  = "DAM_RESOURCE_TYPE_IMAGE"
          value = var.dam_config.dam_rst_image_type_id
        },
        {
          name  = "ESTABLISHMENT_ORDER_DOCS_BUCKET"
          value = var.app == "admin" ? aws_s3_bucket.establishment_order_docs[0].id : ""
        },
        {
          name  = "AWS_REGION"
          value = var.aws_region
        }
      ]
      portMappings = [
        {
          protocol      = "tcp"
          containerPort = var.app_port
          hostPort      = var.app_port
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-create-group  = "true"
          awslogs-group         = "/ecs/${var.app_name}/api"
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
    replace_triggered_by  = [terraform_data.trigger_deployment]
  }
}


resource "aws_ecs_service" "node_api_service" {
  name                              = "${var.app_name}-service"
  cluster                           = aws_ecs_cluster.ecs_cluster.id
  task_definition                   = aws_ecs_task_definition.node_api_task.arn
  desired_count                     = var.min_capacity
  health_check_grace_period_seconds = 60

  # fargate spot which may get interrupted
  #https://docs.aws.amazon.com/AmazonECS/latest/developerguide/fargate-capacity-providers.html
  capacity_provider_strategy {
    capacity_provider = "FARGATE_SPOT"
    weight            = var.fargate_spot_weight
  }
  # non interrupted service by fargate, makes sure there is alaways minimum capacity
  capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = var.fargate_base_weight
    base              = var.fargate_base_capacity
  }


  network_configuration {
    security_groups  = [data.aws_security_group.app.id]
    subnets          = data.aws_subnets.app.ids
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_alb_target_group.app.id
    container_name   = local.container_name
    container_port   = var.app_port
  }
  wait_for_steady_state = true
  depends_on            = [aws_iam_role_policy_attachment.ecs_task_execution_role]
  tags                  = local.common_tags
}
