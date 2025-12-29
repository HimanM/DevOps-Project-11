# Production Environment Configuration
# Copy to terraform.tfvars and customize

aws_region   = "us-west-2"
project_name = "devsecops-project-11"
environment  = "production"

vpc_cidr           = "10.0.0.0/16"
availability_zones = ["us-west-2a", "us-west-2b"]

# Container Images
frontend_image = "ghcr.io/himanm/devops-project-11-frontend:latest"
backend_image  = "ghcr.io/himanm/devops-project-11-backend:latest"

# Task Resources
frontend_cpu    = 256
frontend_memory = 512
backend_cpu     = 256
backend_memory  = 512

# Scaling
frontend_desired_count = 2
backend_desired_count  = 2

# HTTPS (set to true and provide certificate ARN for production)
enable_https    = false
certificate_arn = ""
