"use client";

import { useState } from "react";

const terraformFiles = [
    {
        name: "providers.tf",
        description: "AWS provider and Terraform backend configuration",
        code: `terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket         = "devsecops-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "us-west-2"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}`,
    },
    {
        name: "ecs.tf",
        description: "ECS Fargate cluster and services for frontend and backend",
        code: `# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "\${var.project_name}-cluster"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
  
  tags = {
    Name = "\${var.project_name}-cluster"
  }
}

# Frontend Task Definition
resource "aws_ecs_task_definition" "frontend" {
  family                   = "\${var.project_name}-frontend"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn
  
  container_definitions = jsonencode([{
    name  = "frontend"
    image = var.frontend_image
    
    portMappings = [{
      containerPort = 3000
      protocol      = "tcp"
    }]
    
    environment = [
      { name = "NODE_ENV", value = "production" },
      { name = "NEXT_PUBLIC_BACKEND_URL", value = "http://\${aws_lb.internal.dns_name}:3001" }
    ]
    
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.frontend.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "frontend"
      }
    }
  }])
}

# Backend Task Definition (Private)
resource "aws_ecs_task_definition" "backend" {
  family                   = "\${var.project_name}-backend"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn
  
  container_definitions = jsonencode([{
    name  = "backend"
    image = var.backend_image
    
    portMappings = [{
      containerPort = 3001
      protocol      = "tcp"
    }]
    
    environment = [
      { name = "NODE_ENV", value = "production" },
      { name = "PORT", value = "3001" }
    ]
    
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.backend.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "backend"
      }
    }
  }])
}`,
    },
    {
        name: "security-groups.tf",
        description: "Security groups with least-privilege access rules",
        code: `# ALB Security Group (Public)
resource "aws_security_group" "alb" {
  name        = "\${var.project_name}-alb-sg"
  description = "Security group for Application Load Balancer"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    description = "HTTPS from internet"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    description = "HTTP from internet (redirect to HTTPS)"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "\${var.project_name}-alb-sg"
  }
}

# Frontend Security Group
resource "aws_security_group" "frontend" {
  name        = "\${var.project_name}-frontend-sg"
  description = "Security group for frontend ECS tasks"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    description     = "Traffic from ALB"
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "\${var.project_name}-frontend-sg"
  }
}

# Backend Security Group (Private - Only accessible from frontend)
resource "aws_security_group" "backend" {
  name        = "\${var.project_name}-backend-sg"
  description = "Security group for backend ECS tasks - PRIVATE"
  vpc_id      = aws_vpc.main.id
  
  # Backend only accepts traffic from frontend
  ingress {
    description     = "Traffic from frontend only"
    from_port       = 3001
    to_port         = 3001
    protocol        = "tcp"
    security_groups = [aws_security_group.frontend.id]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "\${var.project_name}-backend-sg"
  }
}`,
    },
];

export default function InfrastructureSection() {
    const [selectedFile, setSelectedFile] = useState(terraformFiles[0]);

    return (
        <section id="infrastructure" className="scroll-mt-24">
            <div className="text-center mb-12">
                <h2 className="section-heading">Infrastructure as Code</h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                    All infrastructure is defined using Terraform, enabling version control, code review,
                    and automated security scanning of infrastructure changes.
                </p>
            </div>

            <div className="glass-card">
                {/* File Tabs */}
                <div className="flex flex-wrap gap-2 mb-6 p-2 bg-slate-900/50 rounded-lg">
                    {terraformFiles.map((file) => (
                        <button
                            key={file.name}
                            onClick={() => setSelectedFile(file)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedFile.name === file.name
                                    ? "bg-devsec-500 text-white shadow-lg"
                                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                                }`}
                        >
                            {file.name}
                        </button>
                    ))}
                </div>

                {/* File Description */}
                <div className="mb-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/20">
                            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white">{selectedFile.name}</h4>
                            <p className="text-sm text-slate-400">{selectedFile.description}</p>
                        </div>
                    </div>
                </div>

                {/* Code Block */}
                <div className="relative">
                    <div className="absolute top-3 right-3 flex gap-2">
                        <span className="px-2 py-1 rounded bg-slate-700/50 text-slate-400 text-xs">
                            HCL
                        </span>
                    </div>
                    <pre className="code-block overflow-x-auto max-h-[500px]">
                        <code className="text-slate-300 text-sm">{selectedFile.code}</code>
                    </pre>
                </div>
            </div>

            {/* IaC Best Practices */}
            <div className="mt-8 grid md:grid-cols-2 gap-6">
                <div className="glass-card">
                    <h3 className="subsection-heading mb-4">Terraform Best Practices</h3>
                    <ul className="space-y-3">
                        {[
                            "Remote state with S3 backend and DynamoDB locking",
                            "State encryption enabled by default",
                            "Modular structure for reusability",
                            "Version constraints for providers",
                            "Default tags applied to all resources",
                            "Separate workspaces for environments",
                        ].map((practice) => (
                            <li key={practice} className="flex items-start gap-3 text-slate-300">
                                <svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {practice}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="glass-card">
                    <h3 className="subsection-heading mb-4">Security Enforcement</h3>
                    <ul className="space-y-3">
                        {[
                            "Checkov scans all Terraform files",
                            "OPA policies validate plan output",
                            "No public access to backend services",
                            "Encryption required for all data stores",
                            "Mandatory resource tagging",
                            "Drift detection after deployment",
                        ].map((enforcement) => (
                            <li key={enforcement} className="flex items-start gap-3 text-slate-300">
                                <svg className="w-5 h-5 text-devsec-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                {enforcement}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}
