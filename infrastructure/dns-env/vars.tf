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

variable "acm_cert_validation_cname" {
  description = "ACM validation CNAME for the *.{env}.sitesandtrailsbc.ca SAN on the multi-SAN cert. Lives in this env's child zone so ACM automatic renewal survives delegation of the child zone from the prod parent zone."
  type = object({
    name  = string
    value = string
  })
}
