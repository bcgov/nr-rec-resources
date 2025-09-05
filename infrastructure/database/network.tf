locals {
  env_map = {
    dev     = "Dev"
    test    = "Test"
    prod    = "Prod"
    tools   = "Tools"
    unclass = "UnClass"
  }

  environment = local.env_map[lower(var.target_env) == "test" ? "dev" : lower(var.target_env)]
  vpc_name    = "${local.environment}"

  availability_zones = ["A", "B"]

  web_subnet_names  = [for az in local.availability_zones : "${local.environment}-Web-MainTgwAttach-${az}"]
  app_subnet_names  = [for az in local.availability_zones : "${local.environment}-App-${az}"]
  data_subnet_names = [for az in local.availability_zones : "${local.environment}-Data-${az}"]
  mgmt_subnet_names = [for az in local.availability_zones : "${local.environment}-Mgmt-${az}"]

  web_security_group_name  = "Web"
  app_security_group_name  = "App"
  data_security_group_name = "Data"
}


data "aws_vpc" "main" {
  filter {
    name = "tag:Name"
    values = [
    local.vpc_name]
  }
}

data "aws_subnets" "web" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.main.id]
  }

  filter {
    name   = "tag:Name"
    values = local.web_subnet_names
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

data "aws_subnets" "data" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.main.id]
  }

  filter {
    name   = "tag:Name"
    values = local.data_subnet_names
  }
}

data "aws_subnet" "web" {
  for_each = toset(data.aws_subnets.web.ids)
  id       = each.value
}

data "aws_subnet" "app" {
  for_each = toset(data.aws_subnets.app.ids)
  id       = each.value
}

data "aws_subnet" "data" {
  for_each = toset(data.aws_subnets.data.ids)
  id       = each.value
}

data "aws_security_group" "web" {
  name = local.web_security_group_name
}

data "aws_security_group" "app" {
  name = local.app_security_group_name
}

data "aws_security_group" "data" {
  name = local.data_security_group_name
}
