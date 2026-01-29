variable "target_env" {
  description = "AWS workload account env (dev, test, prod)"
  type        = string
}

variable "app_env" {
  description = "The environment for the app (dev, test, prod)"
  type        = string
}

variable "aws_region" {
  type    = string
  default = "ca-central-1"
}

variable "common_tags" {
  description = "Common tags to be applied to resources"
  type        = map(string)
  default = {
    managed-by = "terraform"
  }
}

variable "admin_frontend_remote_state" {
  description = "Remote state config for admin frontend (to lookup CloudFront domain)"
  type = object({
    bucket         = string
    key            = string
    dynamodb_table = string
    region         = string
  })
  default = null
}
