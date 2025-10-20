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
variable "frontend_remote_state" {
  description = "Remote state configuration for the frontend module"
  type = object({
    bucket         = string
    key            = string
    dynamodb_table = string
    region         = string
  })
  default = {
    bucket         = "example-frontend-bucket"
    key            = "example/frontend/terraform.tfstate"
    dynamodb_table = "example-frontend-lock-table"
    region         = "ca-central-1"
  }
}

variable "subnet_app_a" {
  description = "Value of the name tag for a subnet in the APP security group"
  type        = string
  default     = "App_Dev_aza_net"
}
variable "subnet_app_b" {
  description = "Value of the name tag for a subnet in the APP security group"
  type        = string
  default     = "App_Dev_azb_net"
}
variable "subnet_web_a" {
  description = "Value of the name tag for a subnet in the APP security group"
  type        = string
  default     = "Web_Dev_aza_net"
}

variable "subnet_web_b" {
  description = "Value of the name tag for a subnet in the APP security group"
  type        = string
  default     = "Web_Dev_azb_net"
}


# Networking Variables
variable "subnet_data_a" {
  description = "Value of the name tag for a subnet in the DATA security group"
  type        = string
  default     = "Data_Dev_aza_net"
}

variable "subnet_data_b" {
  description = "Value of the name tag for a subnet in the DATA security group"
  type        = string
  default     = "Data_Dev_azb_net"
}

variable "app_port" {
  description = "The port of the API container"
  type        = number
  default     = 8000
}
variable "app_name" {
  description = " The APP name with environment (app_env)"
  type        = string
}
variable "app" {
  description = "The app type (admin or public)"
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
variable "api_image" {
  description = "The image for the API container"
  type        = string
}
variable "health_check_path" {
  description = "The path for the health check"
  type        = string
  default     = "/api/health"

}


variable "aws_region" {
  type    = string
  default = "ca-central-1"
}
# Below vars can be manipulated to change the capacity of the ECS cluster based on app environment.
variable "api_cpu" {
  type    = number
  default = "256"
}
variable "api_memory" {
  type    = number
  default = "512"
}
variable "min_capacity" {
  type    = number
  default = 1
}
variable "max_capacity" {
  type    = number
  default = 3
}

variable "fargate_base_capacity" {
  description = "value of the base capacity for the Fargate capacity provider, which is the minimum number of tasks to keep running and not interrupted"
  type        = number
  default     = 1
}
variable "fargate_base_weight" {
  description = "value of the base weight for the Fargate capacity provider, which is the weight of the base capacity provider"
  type        = number
  default     = 20
}
variable "fargate_spot_weight" {
  description = "value of the spot weight for the Fargate capacity provider, which is the weight of the spot capacity provider"
  type        = number
  default     = 80
}
variable "scaling_adjustment_increase" {
  description = "value of the scaling adjustment for the Fargate capacity provider, which is the number of tasks to add or remove"
  type        = number
  default     = 1
}
variable "fta_dataload_bucket" {
  description = "The name of the S3 bucket for FTA CSV files"
  type        = string
  default     = "rst-fta-lza-dataload-oracle"
}

variable "forest_client_api_key" {
  description = "The API key for the Forest client"
  type        = string
}

variable "forest_client_api_url" {
  description = "The API URL for the Forest client"
  type        = string
}

variable "alarm_alert_email_recipients" {
  description = "List of emails to notify for CloudWatch alarms"
  type        = string
  default     = ""
}

variable "keycloak_config" {
  type = object({
    auth_server_url = string
    realm           = string
    client_id       = string
    issuer          = string
  })
  description = "Keycloak configuration for BC Gov Identity Service"
  sensitive   = true
  default = {
    auth_server_url = "https://keycloak.example.com/auth"
    realm           = "example-realm"
    client_id       = "example-client-id"
    issuer          = "https://keycloak.example.com/auth/realms/example-realm"
  }
}

## CORS Configuration Variables
variable "enable_cors" {
  description = "Enable CORS configuration for the API Gateway. This disables caching since it's problematic to cache authorization headers."
  type        = bool
  default     = false
}

variable "cors_allowed_methods" {
  description = "Allowed methods for CORS configuration"
  type        = list(string)
  default     = ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
}

variable "cors_allow_credentials" {
  description = "Whether to allow credentials in CORS configuration"
  type        = bool
  default     = true
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

variable "custom_domain" {
  description = "Custom domain for the admin application (used in prod for CORS)"
  type        = string
  default     = ""
}
