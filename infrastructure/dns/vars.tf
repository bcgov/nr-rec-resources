variable "target_env" {
  description = "AWS workload account env"
  type        = string
}

variable "domain_name" {
  description = "The domain name for the Route 53 hosted zone"
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

variable "google_search_console_verification_txt" {
  description = "TXT record value from Google Search Console for domain verification (e.g. google-site-verification=...). Creates a TXT record at the apex domain."
  type        = string
}
