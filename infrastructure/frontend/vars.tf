variable "target_env" {
  description = "AWS workload account env"
  type        = string
}
variable "app_env" {
  description = "The environment for the app, since multiple instances can be deployed to same dev environment of AWS, this represents whether it is PR or dev or test"
  type        = string
}

variable "app_name" {
  description  = " The APP name with environment (app_env)"
  type        = string
}

variable "aws_region" {
  type = string
  default = "ca-central-1"
}

variable "custom_domain" {
  description = "The custom domain name for the CloudFront distribution."
  type        = string
  default     = "beta.sitesandtrailsbc.ca"
}

variable "api_remote_state" {
  description = "Remote state configuration for the api module"
  type = object({
    bucket         = string
    key            = string
    dynamodb_table = string
    region         = string
  })
  default = {
    bucket         = "example-api-bucket"
    key            = "example/api/terraform.tfstate"
    dynamodb_table = "example-api-lock-table"
    region         = "ca-central-1"
  }
}

variable "csp_urls" {
  description = "List of URLs to be included in the Content Security Policy"
  type        = object({
    script_src = optional(string, "")
    style_src  = optional(string, "")
    connect_src = optional(string, "")
    matomo_src = optional(string, "")
    image_src = optional(string, "")
  })
  default = {}
}
