locals {
  rds_app_env = (contains(["dev", "test", "prod"], var.app_env) ? var.app_env : "dev") # if app_env is not dev, test, or prod, default to dev
}

data "aws_kms_alias" "rds_key" {
  name = "alias/aws/rds"
}
data "aws_caller_identity" "current" {}

resource "random_password" "db_master_password" {
  length           = 12
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

resource "aws_db_subnet_group" "db_subnet_group" {
  description = "For Aurora cluster ${var.db_cluster_name}"
  name        = "${var.db_cluster_name}-subnet-group"
  subnet_ids  = [ for s in data.aws_subnet.data : s.id ]

  tags = {
    managed-by = "terraform"
  }

  tags_all = {
    managed-by = "terraform"
  }
}

data "aws_rds_engine_version" "postgresql" {
  engine  = "aurora-postgresql"
  version = "16.4"
}

resource "aws_db_parameter_group" "db_postgresql" {
  name        = "${var.db_cluster_name}-parameter-group"
  family      = "aurora-postgresql16"
  description = "${var.db_cluster_name}-parameter-group"
  tags = {
    managed-by = "terraform"
  }
}

resource "aws_rds_cluster_parameter_group" "db_postgresql" {
  name        = "${var.db_cluster_name}-cluster-parameter-group"
  family      = "aurora-postgresql16"
  description = "${var.db_cluster_name}-cluster-parameter-group"
  tags = {
    managed-by = "terraform"
  }
}


resource "aws_secretsmanager_secret" "db_mastercreds_secret" {
  name = "aurora-postgis-db-master-creds-${var.target_env}_${var.app_env}"

  tags = {
    managed-by = "terraform"
  }
}

resource "aws_secretsmanager_secret_version" "db_mastercreds_secret_version" {
  secret_id     = aws_secretsmanager_secret.db_mastercreds_secret.id
  secret_string = <<EOF
   {
    "username": "${var.db_master_username}",
    "password": "${random_password.db_master_password.result}"
   }
EOF
}
module "aurora_postgresql_v2" {
  source = "terraform-aws-modules/rds-aurora/aws"
  version = "9.12.0"

  name              = var.db_cluster_name
  engine            = data.aws_rds_engine_version.postgresql.engine
  engine_mode       = "provisioned"
  engine_version    = data.aws_rds_engine_version.postgresql.version
  storage_encrypted = true
  database_name     = var.db_database_name

  enable_http_endpoint = contains(["dev", "test"], local.rds_app_env) ? true : false

  vpc_id                 = data.aws_vpc.main.id
  vpc_security_group_ids = [data.aws_security_group.data.id]
  db_subnet_group_name   = aws_db_subnet_group.db_subnet_group.name

  master_username = var.db_master_username
  master_password = random_password.db_master_password.result
  manage_master_user_password = false


  create_security_group  = false
  create_db_subnet_group = false
  create_monitoring_role = false

  apply_immediately   = true
  skip_final_snapshot = true
  auto_minor_version_upgrade = false

  db_parameter_group_name         = aws_db_parameter_group.db_postgresql.id
  db_cluster_parameter_group_name = aws_rds_cluster_parameter_group.db_postgresql.id

  serverlessv2_scaling_configuration = {
    min_capacity = 0.5
    max_capacity = 1.0
  }

  instance_class = "db.serverless"
  instances = {
    one = {}
  }

  tags = {
    managed-by = "terraform"
  }

  enabled_cloudwatch_logs_exports = ["postgresql"]
}

resource "aws_rds_cluster_role_association" "s3_import" {
  db_cluster_identifier = var.db_cluster_name
  feature_name           = "s3Import"
  role_arn               = aws_iam_role.s3_import.arn
}
