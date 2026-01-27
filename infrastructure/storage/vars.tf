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

variable "admin_frontend_custom_domains" {
  description = "List of custom domain names for the admin frontend (used for CORS in prod). These are the CloudFront aliases."
  type        = list(string)
  default     = []
}

variable "admin_frontend_cloudfront_domain" {
  description = "Admin frontend CloudFront domain"
  type        = string
  default     = ""
}
