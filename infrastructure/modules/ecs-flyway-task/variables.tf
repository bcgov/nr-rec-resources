variable "app_name" {
  description = "Name of the application"
  type        = string
}

variable "flyway_image" {
  description = "Flyway Docker image"
  type        = string
}

variable "cpu" {
  description = "Task CPU"
  type        = string
  default     = "512"
}

variable "memory" {
  description = "Task memory"
  type        = string
  default     = "1024"
}

variable "execution_role_arn" {
  description = "ARN of the ECS execution role"
  type        = string
}

variable "task_role_arn" {
  description = "ARN of the ECS task role"
  type        = string
}

variable "environment" {
  description = "Environment variables for the container"
  type        = list(object({
    name  = string
    value = string
  }))
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "cluster_id" {
  description = "ECS cluster ID"
  type        = string
}

variable "security_group" {
  description = "Security group ID for the task"
  type        = string
}

variable "subnet" {
  description = "Subnet ID for the task"
  type        = string
}

variable "db_schema" {
  description = "Database schema for Flyway migrations"
  type        = string
  default     = "fta"
}