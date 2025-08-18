variable "target_env" {
  description = "AWS workload account env"
  type        = string
}

variable "app_env" {
  description = "The environment for the app, since multiple instances can be deployed to same dev environment of AWS, this represents whether it is PR or dev or test"
  type        = string
}

variable "db_name" {
  description = "The default database for Flyway"
  type        = string
  default     = "rst"
}

variable "db_schema" {
  description = "The default schema for Flyway"
  type        = string
  default     = "fta"
}

variable "app_name" {
  description  = " The APP name with environment (app_env)"
  type        = string
}

variable "api_image" {
  description = "The image for the API container"
  type        = string
}

variable "common_tags" {
  description = "Common tags to be applied to resources"
  type        = map(string)
  default     = {}
}

variable "flyway_image" {
  description = "The image for the Flyway container"
  type        = string
}

variable "flyway_clean_disabled" {
  description = "Enable Flyway clean"
  type        = bool
  default     = true
}

variable "aws_region" {
  type = string
  default = "ca-central-1"
}

variable "fta_dataload_bucket" {
  description = "The name of the S3 bucket for FTA CSV files"
  type        = string
  default     = "rst-fta-lza-dataload-oracle"
}
