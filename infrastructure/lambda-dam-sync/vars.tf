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
  default     = "rst"
}

variable "aws_region" {
  type    = string
  default = "ca-central-1"
}

variable "dam_config" {
  type = object({
    dam_url = string
    dam_private_key = string
    dam_user = string
    dam_rst_pdf_collection_id = string
    dam_rst_image_collection_id = string
  })
  description = "DAM configuration for BC Image and Documents storage"
  sensitive = true
}

variable "lambda_function_name" {
  type    = string
  default = "my-lambda"
}

variable "s3_bucket" {
  type    = string
}

variable "s3_key" {
  type    = string
}

variable "lambda_role_arn" {
  type = string
}
