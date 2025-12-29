# DevSecOps Pipeline Platform

[![Pipeline Status](https://github.com/HimanM/DevOps-Project-11/actions/workflows/devsecops-pipeline.yml/badge.svg)](https://github.com/HimanM/DevOps-Project-11/actions/workflows/devsecops-pipeline.yml)

A production-grade DevSecOps demonstration platform implementing enterprise-level security standards across the entire software delivery lifecycle. This project showcases **Security** as a first-class citizen in CI/CD, Infrastructure as Code, container management, and Policy-as-Code enforcement.

---

<!-- DEPLOYMENT_OUTPUTS_START -->
## Live Deployment

> **Infrastructure is deployed and running!**

| Resource | Value |
|----------|-------|
| **Frontend URL** | [http://devsecops-11-pub-alb-194705882.us-west-2.elb.amazonaws.com](http://devsecops-11-pub-alb-194705882.us-west-2.elb.amazonaws.com) |
| **ECS Cluster** | `devsecops-project-11-cluster` |
| **AWS Region** | `us-west-2` |
| **Last Deployed** | 2025-12-29 05:41:00 UTC |

<!-- DEPLOYMENT_OUTPUTS_END -->


---

## Table of Contents

- [What is DevSecOps?](#what-is-devsecops)
- [Security Concepts Implemented](#security-concepts-implemented)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [CI/CD Pipeline (14 Jobs)](#cicd-pipeline-14-jobs)
- [Security Controls by Phase](#security-controls-by-phase)
- [How to Run Locally](#how-to-run-locally)
- [Repository Structure](#repository-structure)
- [Configuration](#configuration)
- [Infrastructure Teardown](#infrastructure-teardown)
- [Contributing](#contributing)
- [License](#license)

---

## What is DevSecOps?

**DevSecOps** is the practice of integrating security practices within the DevOps process. The term combines **Development (Dev)**, **Security (Sec)**, and **Operations (Ops)** to emphasize that security is a shared responsibility throughout the entire software delivery lifecycle.

### The "Sec" in DevSecOps

Traditional software development treated security as a final gate before release—a bottleneck that caused delays and friction. DevSecOps fundamentally changes this by:

1. **Shifting Security Left**: Moving security checks earlier in the development process
2. **Automating Security**: Removing manual security reviews through automated tooling
3. **Continuous Security**: Treating security as a continuous process, not a one-time check
4. **Shared Responsibility**: Making every team member responsible for security

### Why DevSecOps Matters

| Traditional Approach | DevSecOps Approach |
|---------------------|-------------------|
| Security at the end | Security from the start |
| Manual security reviews | Automated security scanning |
| Security team bottleneck | Distributed responsibility |
| Expensive late-stage fixes | Cheap early-stage fixes |
| Compliance as afterthought | Compliance as code |

---

## Security Concepts Implemented

This project implements the following security concepts:

### 1. 🔐 Secret Detection (Gitleaks)

**Concept**: Prevent sensitive data (API keys, passwords, tokens) from being committed to source control.

**Implementation**:
- Gitleaks scans every push for hardcoded secrets
- Patterns detect AWS keys, GitHub tokens, private keys, and more
- Pipeline fails immediately if secrets are detected
- Prevents credentials from reaching production

```yaml
# Pipeline Job: secret-scan
- uses: gitleaks/gitleaks-action@v2
```

### 2. 🛡️ Static Application Security Testing (SAST)

**Concept**: Analyze source code for security vulnerabilities without executing it.

**Implementation**:
- ESLint with security rules analyzes JavaScript/TypeScript
- Identifies code patterns that could lead to vulnerabilities
- npm audit checks dependencies for known vulnerabilities
- Runs before container images are built

### 3. 📦 Container Security

**Concept**: Ensure container images are free from vulnerabilities and follow security best practices.

**Implementation**:
- **Trivy scanning**: Scans images for CVEs in OS packages and application dependencies
- **Non-root users**: Containers run as unprivileged users (UID 1001)
- **Minimal base images**: Alpine Linux reduces attack surface
- **Multi-stage builds**: Final images contain only runtime dependencies
- **Read-only considerations**: Containers designed for minimal write access

```dockerfile
# Non-root user in Dockerfile
RUN adduser --system --uid 1001 appuser
USER appuser
```

### 4. 🏗️ Infrastructure as Code (IaC) Security

**Concept**: Apply security policies to infrastructure definitions before deployment.

**Implementation**:
- **Checkov**: Evaluates 400+ security policies against Terraform
- Detects misconfigurations like public S3 buckets, open security groups
- Enforces encryption, logging, and tagging requirements
- Blocks deployment if critical issues found

### 5. 📜 Policy-as-Code (OPA/Rego)

**Concept**: Define and enforce organizational policies through code that can be versioned and tested.

**Implementation**:
- Custom Rego policies in `/policies` directory
- Enforces rules like:
  - Backend must not be publicly accessible
  - Security groups must not allow 0.0.0.0/0 on sensitive ports
  - All resources must have required tags
- Policies evaluated against Terraform plan before apply

```rego
# Example: No public backend access
deny[msg] {
    resource := input.resource_changes[_]
    resource.type == "aws_lb"
    resource.change.after.internal == false
    contains(resource.address, "backend")
    msg := "Backend load balancer must be internal"
}
```

### 6. 🔑 OIDC Authentication

**Concept**: Passwordless authentication between CI/CD and cloud providers using identity federation.

**Implementation**:
- GitHub Actions uses OIDC to authenticate to AWS
- No long-lived credentials stored in secrets
- IAM role trust policy validates GitHub token claims
- Tokens are short-lived and automatically rotated

```yaml
# OIDC in workflow
- uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
```

### 7. 🎯 Least Privilege IAM

**Concept**: Grant only the minimum permissions required for each component to function.

**Implementation**:
- **ECS Execution Role**: Only ECR pull and CloudWatch logs
- **ECS Task Role**: X-Ray, Secrets Manager access only
- **GitHub Actions Role**: Scoped to specific resources
- No wildcard `*` actions on sensitive services

### 8. 🌐 Network Segmentation

**Concept**: Isolate components into security zones to limit blast radius of breaches.

**Implementation**:
- **Public subnets**: Only ALB exposed to internet
- **Private subnets**: Backend services with no direct internet access
- **Security groups**: Strict ingress/egress rules per component
- **Internal ALB**: Backend only accessible from frontend

### 9. ✅ Manual Approval Gates

**Concept**: Require human review before production deployments.

**Implementation**:
- GitHub Environments with required reviewers
- Terraform plan visible before approval
- Audit trail of who approved what and when
- Prevents automated but unauthorized deployments

### 10. 🔄 Drift Detection

**Concept**: Detect when actual infrastructure differs from defined state.

**Implementation**:
- Runs after every deployment
- Compares AWS state to Terraform configuration
- Re-evaluates OPA policies against current state
- Alerts on unauthorized manual changes

---

## Architecture

### Infrastructure Diagram

```
                                    INTERNET
                                        │
                                        ▼
                            ┌───────────────────┐
                            │   Public ALB      │
                            │   (HTTP:80)       │
                            └───────────────────┘
                                        │
                        ┌───────────────┴───────────────┐
                        │             VPC               │
                        │   ┌───────┐       ┌───────┐   │
                        │   │Public │       │Public │   │
                        │   │Subnet │       │Subnet │   │
                        │   │ AZ-a  │       │ AZ-b  │   │
                        │   └───────┘       └───────┘   │
                        │       │               │       │
                        │       └───────┬───────┘       │
                        │               │               │
                        │   ┌───────────────────────┐   │
                        │   │   Frontend ECS        │   │
                        │   │   (Fargate:3000)      │   │
                        │   └───────────────────────┘   │
                        │               │               │
                        │               ▼               │
                        │   ┌───────────────────────┐   │
                        │   │   Internal ALB        │   │
                        │   │   (HTTP:3001)         │   │
                        │   └───────────────────────┘   │
                        │               │               │
                        │   ┌───────────────────────┐   │
                        │   │   Backend ECS         │   │
                        │   │   (Fargate:3001)      │   │
                        │   │   PRIVATE ONLY        │   │
                        │   └───────────────────────┘   │
                        │   ┌───────┐       ┌───────┐   │
                        │   │Private│       │Private│   │
                        │   │Subnet │       │Subnet │   │
                        │   │ AZ-a  │       │ AZ-b  │   │
                        │   └───────┘       └───────┘   │
                        └───────────────────────────────┘
```

### Security Architecture

| Layer | Security Control | Implementation |
|-------|-----------------|----------------|
| Network | Segmentation | Public/Private subnets, NAT Gateway |
| Network | Access Control | Security groups with least privilege |
| Network | Internal Routing | Backend only via Internal ALB |
| Compute | Isolation | Fargate (no EC2 management required) |
| Compute | Non-root | Containers run as UID 1001 |
| Application | Headers | Helmet.js security headers |
| Application | CORS | Restricted origin policy |
| Data | Encryption | TLS in transit, S3 encryption at rest |
| IAM | Least Privilege | Minimal permissions per role |
| CI/CD | OIDC | No long-lived credentials |

---

## Technology Stack

### Application

| Component | Technology | Purpose |
|-----------|------------|---------| 
| Frontend | Next.js 15, React 19, Tailwind CSS | Pipeline visualization and demo |
| Backend | Node.js 20, Express, Helmet | Health endpoints with security headers |
| Runtime | AWS ECS Fargate | Serverless container execution |

### Infrastructure

| Component | Technology | Purpose |
|-----------|------------|---------|
| IaC | Terraform 1.x | Infrastructure definition |
| Cloud | AWS (us-west-2) | Cloud provider |
| Networking | VPC, ALB, NAT | Network infrastructure |
| Container Registry | GitHub Container Registry | Image storage |

### Security Tooling

| Tool | Category | Purpose |
|------|----------|---------|
| Gitleaks | Secret Detection | Scans for hardcoded credentials |
| Trivy | Container Security | CVE scanning for images |
| Checkov | IaC Security | 400+ policy checks for Terraform |
| OPA/Conftest | Policy-as-Code | Custom organizational policies |
| ESLint | SAST | JavaScript security linting |
| npm audit | Dependency Security | Known vulnerability detection |

---

## CI/CD Pipeline (14 Jobs)

The pipeline implements security at every stage with 14 distinct jobs:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SECURITY GATES                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [1. Secret Scan] ──► [2. Change Detection] ──┬──► [3. Frontend Build]     │
│                                               │                             │
│                                               └──► [4. Backend Build]       │
│                                                          │                  │
│                                                          ▼                  │
│                                               [5. Container Build & Push]   │
│                                                          │                  │
│                                                          ▼                  │
│                                               [6. Container Security Scan]  │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                          INFRASTRUCTURE VALIDATION                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [7. Terraform Validate] ──► [8. Checkov Scan] ──► [9. OPA Policy Check]   │
│                                                          │                  │
│                                                          ▼                  │
│                                               [10. Terraform Plan]          │
│                                                          │                  │
│                                                          ▼                  │
│                                               [11. Manual Approval] 🔒      │
│                                                          │                  │
│                                                          ▼                  │
│                                               [12. Terraform Apply]         │
│                                                          │                  │
│                                                          ▼                  │
│                                               [13. Drift Detection]         │
│                                                          │                  │
│                                                          ▼                  │
│                                               [14. Update README/Tags]      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Job Descriptions

| # | Job | Security Function |
|---|-----|------------------|
| 1 | Secret Scanning | Detects hardcoded credentials before they reach the repo |
| 2 | Change Detection | Smart filtering to skip unchanged components |
| 3 | Frontend Lint & Build | SAST and compilation verification |
| 4 | Backend Lint & Build | SAST and dependency audit |
| 5 | Container Build | Multi-arch builds with security hardening |
| 6 | Container Scan | Trivy CVE detection on built images |
| 7 | Terraform Validate | Syntax and configuration validation |
| 8 | Checkov Scan | 400+ IaC security policy checks |
| 9 | OPA Policy Check | Custom organizational policy enforcement |
| 10 | Terraform Plan | Preview infrastructure changes |
| 11 | Manual Approval | Human gate before production deploy |
| 12 | Terraform Apply | Controlled infrastructure deployment |
| 13 | Drift Detection | Post-deploy compliance verification |
| 14 | Update Outputs | Automated documentation and version updates |

---

## Security Controls by Phase

### 🔍 Pre-Commit / Push

- Gitleaks secret detection
- Branch protection rules
- Required code reviews

### 🔨 Build Phase

- ESLint static analysis with security rules
- npm audit for dependency vulnerabilities
- Multi-stage Docker builds (minimal attack surface)
- Non-root container users

### 🏗️ Infrastructure Phase

- Terraform format and validation
- Checkov security policy evaluation
- Custom OPA policy enforcement
- Terraform plan review

### 🚀 Deployment Phase

- Manual approval with audit trail
- GitHub Environments with required reviewers
- OIDC authentication (no stored credentials)
- Least privilege IAM roles

### ✅ Post-Deployment

- Drift detection comparing state vs. config
- OPA policy re-evaluation
- CloudWatch monitoring
- Automated documentation updates

---

## How to Run Locally

### Prerequisites

- Node.js 20+
- Docker and Docker Compose
- Terraform 1.5+ (for infrastructure)
- AWS CLI configured (for deployment)

### Initial Setup (One-Time)

Before running the pipeline or Terraform for the first time, you must:

1. **Create the S3 State Bucket**:
   Terraform uses this bucket to store state. You must create it manually before `terraform init`.
   ```bash
   aws s3 mb s3://devsecops-project-11-tfstate --region us-west-2
   ```

2. **Initial Container Build & Push**:
   Terraform needs the container images to exist before it can deploy the ECS tasks.
   ```bash
   # Login to GHCR (use your GitHub token with package:write scope)
   echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin

   # Build and push frontend
   docker build -t ghcr.io/your_username/devops-project-11-frontend:latest ./frontend
   docker push ghcr.io/your_username/devops-project-11-frontend:latest

   # Build and push backend
   docker build -t ghcr.io/your_username/devops-project-11-backend:latest ./backend
   docker push ghcr.io/your_username/devops-project-11-backend:latest
   ```

3. **Run Terraform Apply**:
   Now you can initialize and apply Terraform.
   ```bash
   cd terraform
   terraform init
   terraform apply -var="frontend_image=ghcr.io/your_username/devops-project-11-frontend:latest" -var="backend_image=ghcr.io/your_username/devops-project-11-backend:latest"
   ```

After this initial setup, the **CI/CD pipeline is fully automated**!

### Running the Applications Locally

```bash
# Clone the repository
git clone https://github.com/HimanM/DevOps-Project-11.git
cd DevOps-Project-11

# Backend
cd backend
npm install
npm run dev
# Server runs at http://localhost:3001

# Frontend (new terminal)
cd frontend
npm install
npm run dev
# Application runs at http://localhost:3000
```

### Running with Docker

```bash
# Build images
docker build -t devsecops-backend ./backend
docker build -t devsecops-frontend ./frontend

# Run containers
docker run -p 3001:3001 devsecops-backend
docker run -p 3000:3000 -e NEXT_PUBLIC_BACKEND_URL=http://localhost:3001 devsecops-frontend
```

### Testing Security Tools Locally

```bash
# Secret scanning
docker run -v $(pwd):/path zricethezav/gitleaks detect --source /path

# Container scanning
trivy image devsecops-frontend:latest

# IaC scanning
cd terraform
checkov -d .

# OPA policies
conftest test tfplan.json --policy ../policies/
```

---

## Repository Structure

```
devops-project-11/
│
├── frontend/                    # Next.js frontend application
│   ├── src/
│   │   ├── app/                 # App Router pages
│   │   └── components/          # React components
│   ├── Dockerfile               # Multi-stage build (non-root)
│   └── .dockerignore
│
├── backend/                     # Express backend API
│   ├── src/
│   │   └── index.js             # Server with Helmet security
│   ├── Dockerfile               # Multi-stage build (non-root)
│   └── .dockerignore
│
├── terraform/                   # Infrastructure as Code
│   ├── providers.tf             # AWS provider config
│   ├── variables.tf             # Input variables
│   ├── vpc.tf                   # Network infrastructure
│   ├── security-groups.tf       # Least privilege network rules
│   ├── iam.tf                   # Least privilege IAM roles
│   ├── alb.tf                   # Load balancers (public + internal)
│   ├── ecs.tf                   # ECS cluster and services
│   └── outputs.tf               # Output values
│
├── policies/                    # OPA/Rego policies
│   ├── no_public_backend.rego   # Backend isolation enforcement
│   ├── no_open_security_groups.rego
│   └── mandatory_tags.rego      # Tagging requirements
│
├── .github/
│   └── workflows/
│       └── devsecops-pipeline.yml  # 14-job security pipeline
│
├── README.md                    # This file (auto-updated)
└── CI-CD-JOBS-GUIDE.md          # Detailed job documentation
```

---

## Configuration

### GitHub Secrets Required

| Secret | Description |
|--------|-------------|
| `AWS_ROLE_ARN` | IAM role ARN for OIDC authentication |
| `GITLEAKS_LICENSE` | (Optional) Gitleaks enterprise license |

### Setting Up OIDC Authentication

1. Bootstrap infrastructure locally:
   ```bash
   cd terraform
   terraform init
   terraform apply
   ```

2. Copy the `github_actions_role_arn` output

3. Add to GitHub Secrets:
   - Go to Repository Settings → Secrets and variables → Actions
   - Add `AWS_ROLE_ARN` with the role ARN value

### Configure Manual Approval

1. Go to Repository Settings → Environments
2. Create environment named `production`
3. Enable "Required reviewers" and add yourself
4. (Optional) Add deployment branch rules

---

## Infrastructure Teardown

```bash
# Destroy all resources
cd terraform
terraform destroy -auto-approve

# Delete S3 state bucket
aws s3 rm s3://devsecops-project-11-tfstate --recursive
aws s3 rb s3://devsecops-project-11-tfstate

# Clean local files
rm -rf .terraform/ terraform.tfstate*
```

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Ensure all security checks pass locally
4. Submit a pull request

All contributions must pass the full 14-job security pipeline.

---

## License

MIT License - See [LICENSE](./LICENSE) for details.

This project is for educational purposes demonstrating DevSecOps best practices. Fork, learn, and adapt for your own needs!
