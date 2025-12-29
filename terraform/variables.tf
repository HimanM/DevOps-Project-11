# -----------------------------
# Input Variables
# -----------------------------

variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-west-2"
}

variable "project_name" {
  description = "Name of the project, used for resource naming"
  type        = string
  default     = "devsecops-project-11"
}

variable "environment" {
  description = "Deployment environment (development, staging, production)"
  type        = string
  default     = "production"

  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "Environment must be one of: development, staging, production."
  }
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of availability zones to use"
  type        = list(string)
  default     = ["us-west-2a", "us-west-2b"]
}

variable "frontend_image" {
  description = "Docker image for frontend service"
  type        = string
  default     = "ghcr.io/himanm/devops-project-11-frontend:1c5ecb0"
}

variable "backend_image" {
  description = "Docker image for backend service"
  type        = string
  default     = "ghcr.io/himanm/devops-project-11-backend:1c5ecb0"
}

variable "frontend_cpu" {
  description = "CPU units for frontend task (1 vCPU = 1024)"
  type        = number
  default     = 256
}

variable "frontend_memory" {
  description = "Memory in MB for frontend task"
  type        = number
  default     = 512
}

variable "backend_cpu" {
  description = "CPU units for backend task (1 vCPU = 1024)"
  type        = number
  default     = 256
}

variable "backend_memory" {
  description = "Memory in MB for backend task"
  type        = number
  default     = 512
}

variable "frontend_desired_count" {
  description = "Desired number of frontend task instances"
  type        = number
  default     = 2
}

variable "backend_desired_count" {
  description = "Desired number of backend task instances"
  type        = number
  default     = 2
}

variable "enable_https" {
  description = "Enable HTTPS on the load balancer (requires certificate ARN)"
  type        = bool
  default     = false
}

variable "certificate_arn" {
  description = "ARN of ACM certificate for HTTPS"
  type        = string
  default     = ""
}

variable "common_tags" {
  description = "Additional tags to apply to all resources"
  type        = map(string)
  default     = {}
}
