variable "target_env" {
  description = "AWS workload account env"
  type        = string
}
variable "app_env" {
  description = "The environment for the app, since multiple instances can be deployed to same dev environment of AWS, this represents whether it is PR or dev or test"
  type        = string
}

variable "db_name" {
  description = "The default schema for Flyway"
  type        = string
  default     = "app"
}

variable "db_schema" {
  description = "The default schema for Flyway"
  type        = string
  default     = "app"
}

variable "subnet_app_a" {
  description = "Value of the name tag for a subnet in the APP security group"
  type = string
  default = "App_Dev_aza_net"
}

variable "subnet_app_b" {
  description = "Value of the name tag for a subnet in the APP security group"
  type = string
  default = "App_Dev_azb_net"
}
variable "subnet_web_a" {
  description = "Value of the name tag for a subnet in the APP security group"
  type = string
  default = "Web_Dev_aza_net"
}

variable "subnet_web_b" {
  description = "Value of the name tag for a subnet in the APP security group"
  type = string
  default = "Web_Dev_azb_net"
}


# Networking Variables
variable "subnet_data_a" {
  description = "Value of the name tag for a subnet in the DATA security group"
  type = string
  default = "Data_Dev_aza_net"
}

variable "subnet_data_b" {
  description = "Value of the name tag for a subnet in the DATA security group"
  type = string
  default = "Data_Dev_azb_net"
}

variable "app_port" {
  description = "The port of the API container"
  type        = number
  default     = 8000
}
variable "app_name" {
  description  = " The APP name"
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

variable "api_cpu" {
  type = number
  default     = "256"
}
variable "api_memory" {
  type = number
  default     = "512"
}
variable "aws_region" {
  type = string
  default = "ca-central-1"
}
