locals {
  env_map = {
    dev     = "Dev"
    test    = "Test"
    prod    = "Prod"
    tools   = "Tools"
    unclass = "UnClass"
  }
  environment = local.env_map[lower(var.target_env) == "test" ? "dev" : lower(var.target_env)]
  vpc_name           = "${local.environment}_vpc"
  availability_zones = ["a", "b"]
  app_subnet_names   = [for az in local.availability_zones : "App_${local.environment}_az${az}_net"]

  security_group_name_suffix = "_sg"

  app_security_group_name  = "App${local.security_group_name_suffix}"
}

data "aws_vpc" "main" {
  filter {
    name = "tag:Name"
    values = [
    local.vpc_name]
  }
}

data "aws_subnets" "app" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.main.id]
  }

  filter {
    name   = "tag:Name"
    values = local.app_subnet_names
  }
}

data "aws_security_group" "app" {
  name = local.app_security_group_name
}
