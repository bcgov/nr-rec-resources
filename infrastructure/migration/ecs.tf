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

module "flyway_fta_migration_task" {
  source = "../modules/ecs-flyway-task"

  app_name           = var.app_name
  flyway_image       = var.flyway_image
  cpu                = "512"
  memory             = "1024"
  db_schema          = "fta"
  execution_role_arn = data.aws_iam_role.ecs_task_execution_role.arn
  task_role_arn      = data.aws_iam_role.app_container_role.arn
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
      },
      {
        name = "FLYWAY_PLACEHOLDERS_S3_BUCKET"
        value = "${var.fta_dataload_bucket}"
      },
  ]
  aws_region      = var.aws_region
  cluster_id      = data.aws_ecs_cluster.ecs_cluster.id
  security_group  = data.aws_security_group.app.id
  subnet          = data.aws_subnets.app.ids[0]
}
