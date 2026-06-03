variable "env" {
  description = "Environment name (dev or test)"
  type        = string
}

variable "domain_name" {
  description = "Root domain name"
  type        = string
  default     = "sitesandtrailsbc.ca"
}

variable "public_frontend_remote_state" {
  description = "Remote state configuration for the public frontend module"
  type = object({
    bucket         = string
    key            = string
    dynamodb_table = string
    region         = string
  })
}

variable "admin_frontend_remote_state" {
  description = "Remote state configuration for the admin frontend module"
  type = object({
    bucket         = string
    key            = string
    dynamodb_table = string
    region         = string
  })
}
