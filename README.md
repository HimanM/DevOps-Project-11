# DevSecOps Pipeline Platform

A production-grade DevSecOps demonstration platform implementing enterprise-level security standards across the entire software delivery lifecycle. This project showcases CI/CD security, Infrastructure as Code security, container security, and Policy-as-Code implementation.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
  - [Infrastructure Diagram](#infrastructure-diagram)
  - [Security Architecture](#security-architecture)
- [Technology Stack](#technology-stack)
- [CI/CD Pipeline Overview](#cicd-pipeline-overview)
- [Security Controls](#security-controls)
- [Deployment Flow](#deployment-flow)
- [Manual Approval Process](#manual-approval-process)
- [Drift Detection](#drift-detection)
- [How to Run Locally](#how-to-run-locally)
- [Repository Structure](#repository-structure)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

---

## Project Overview

This project demonstrates a complete DevSecOps implementation featuring:

- **Security-First CI/CD Pipeline**: 13 dedicated jobs covering secret scanning, vulnerability assessment, policy enforcement, and controlled deployments
- **Infrastructure as Code**: AWS infrastructure defined entirely in Terraform with security scanning and policy validation
- **Container Security**: Multi-stage Docker builds with non-root users, minimal base images, and vulnerability scanning
- **Policy-as-Code**: Custom OPA/Rego policies enforcing organizational security standards
- **Manual Approval Gates**: Human review required before production deployments
- **Drift Detection**: Post-deployment infrastructure compliance monitoring

The application layer is intentionally minimal to focus on the DevSecOps practices. The frontend serves as living documentation of the pipeline, while the backend demonstrates secure service-to-service communication.

---

## Architecture

### Infrastructure Diagram

```
                                    INTERNET
                                        |
                                        v
                            +-------------------+
                            |   Route 53 (DNS)  |
                            +-------------------+
                                        |
                                        v
                            +-------------------+
                            |   Public ALB      |
                            |   (HTTPS/HTTP)    |
                            +-------------------+
                                        |
                        +---------------+---------------+
                        |               VPC             |
                        |   +-------+       +-------+   |
                        |   |Public |       |Public |   |
                        |   |Subnet |       |Subnet |   |
                        |   | AZ-a  |       | AZ-b  |   |
                        |   +-------+       +-------+   |
                        |       |               |       |
                        |       +-------+-------+       |
                        |               |               |
                        |   +-----------------------+   |
                        |   |    Frontend ECS       |   |
                        |   |    (Fargate)          |   |
                        |   +-----------------------+   |
                        |               |               |
                        |               v               |
                        |   +-----------------------+   |
                        |   |   Internal ALB        |   |
                        |   +-----------------------+   |
                        |               |               |
                        |   +-----------------------+   |
                        |   |    Backend ECS        |   |
                        |   |    (Fargate)          |   |
                        |   |    PRIVATE ONLY       |   |
                        |   +-----------------------+   |
                        |   +-------+       +-------+   |
                        |   |Private|       |Private|   |
                        |   |Subnet |       |Subnet |   |
                        |   | AZ-a  |       | AZ-b  |   |
                        |   +-------+       +-------+   |
                        +-------------------------------+
```

### Security Architecture

| Layer | Security Control | Implementation |
|-------|-----------------|----------------|
| Network | Segmentation | Public/Private subnets, NAT Gateway |
| Network | Access Control | Security groups with least privilege |
| Compute | Isolation | Fargate (no EC2 management required) |
| Compute | Non-root | Containers run as non-privileged users |
| Application | Headers | Helmet.js security headers |
| Application | CORS | Restricted origin policy |
| Data | Encryption | TLS in transit, S3 encryption at rest |
| IAM | Least Privilege | Minimal permissions for each role |

---

## Technology Stack

### Application

| Component | Technology | Purpose |
|-----------|------------|---------|
| Frontend | Next.js 15, React 19, Tailwind CSS | Pipeline documentation and visualization |
| Backend | Node.js 20, Express | Health endpoints and connectivity demo |
| Runtime | AWS ECS Fargate | Serverless container execution |

### Infrastructure

| Component | Technology | Purpose |
|-----------|------------|---------|
| IaC | Terraform 1.5+ | Infrastructure definition |
| Cloud | AWS (us-west-2) | Cloud provider |
| Networking | VPC, ALB, NAT | Network infrastructure |
| Container Registry | GitHub Container Registry | Image storage |

### Security Tooling

| Tool | Purpose |
|------|---------|
| Gitleaks | Secret detection in source code |
| Trivy | Container vulnerability scanning |
| Checkov | IaC security scanning |
| OPA/Conftest | Custom policy enforcement |
| ESLint | Code quality and security linting |

---

## CI/CD Pipeline Overview

The pipeline consists of 13 distinct jobs organized into logical stages:

```
[Secret Scan] --> [Frontend Build] --> [Container Build] --> [Container Scan]
                  [Backend Build]  -->
             
[Terraform Validate] --> [Checkov Scan] --> [OPA Check] --> [Terraform Plan]
                                                                    |
                                                                    v
                                                          [Manual Approval]
                                                                    |
                                                                    v
                                                          [Terraform Apply]
                                                                    |
                                                                    v
                                                          [Drift Detection]

[Container Build] --> [Update Image Tags]
```

### Pipeline Jobs Summary

1. **Secret Scanning** - Gitleaks scans for hardcoded credentials
2. **Frontend Lint and Build** - ESLint and Next.js build verification
3. **Backend Lint and Build** - ESLint and dependency audit
4. **Container Build and Push** - Multi-arch Docker builds to GHCR
5. **Container Security Scan** - Trivy vulnerability detection
6. **Terraform Format and Validate** - Configuration syntax verification
7. **IaC Security Scan** - Checkov policy evaluation
8. **OPA Policy Enforcement** - Custom Rego policy validation
9. **Terraform Plan** - Infrastructure change preview
10. **Manual Approval** - Human review gate
11. **Terraform Apply** - Infrastructure deployment
12. **Drift Detection** - Post-deploy compliance check
13. **Update Image Tags** - Automated version management

For detailed information about each job and how to trigger failures for testing, see [CI-CD-JOBS-GUIDE.md](./CI-CD-JOBS-GUIDE.md).

---

## Security Controls

### Pre-Commit

- Secret detection prevents credentials from entering the repository
- All branches protected with required reviews

### Build Phase

- Static code analysis with ESLint
- Dependency vulnerability scanning with npm audit
- Container image scanning with Trivy

### Infrastructure Phase

- Terraform validation ensures configuration syntax
- Checkov evaluates 400+ security policies
- Custom OPA policies enforce organizational standards

### Deployment Phase

- Manual approval required for production
- GitHub Environments with required reviewers
- Audit trail of all approvals

### Post-Deployment

- Drift detection identifies unauthorized changes
- OPA policies re-evaluated against current state
- CloudWatch monitoring and alerting

---

## Deployment Flow

1. **Code Push**: Developer pushes code to main branch
2. **Security Scan**: Gitleaks checks for secrets
3. **Build and Test**: Applications built and linted
4. **Container Build**: Docker images created and pushed
5. **Container Scan**: Trivy scans for vulnerabilities
6. **IaC Validation**: Terraform and Checkov verify infrastructure
7. **Policy Check**: OPA evaluates custom policies
8. **Plan Generation**: Terraform plan created and stored
9. **Approval Wait**: Pipeline pauses for human review
10. **Deployment**: Approved changes applied to AWS
11. **Verification**: Drift detection confirms compliance

---

## Manual Approval Process

The pipeline includes a mandatory human review gate before production deployment:

1. Navigate to the Actions tab in GitHub
2. Locate the running workflow
3. Click on the "Manual Approval" job
4. Review the Terraform plan in the previous job
5. Click "Approve" or "Reject"
6. Deployment proceeds only after approval

### Configuring Approvers

1. Go to Repository Settings
2. Navigate to Environments
3. Select or create "production" environment
4. Add required reviewers
5. Optionally configure deployment branches and wait timer

---

## Drift Detection

Post-deployment drift detection ensures infrastructure remains compliant:

- Runs immediately after successful deployment
- Compares actual AWS state against Terraform configuration
- Re-evaluates OPA policies against current state
- Alerts if unauthorized changes detected
- Creates audit trail of infrastructure state

### Drift Causes

- Manual changes in AWS Console
- Changes by other automation tools
- AWS service updates or deprecations
- Resource modifications outside Terraform

---

## How to Run Locally

### Prerequisites

- Node.js 20+
- Docker and Docker Compose
- Terraform 1.5+ (for infrastructure testing)
- AWS CLI configured (for deployment)

### Running the Applications

```bash
# Clone the repository
git clone https://github.com/himanm/DevOps-Project-11.git
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

### Testing Terraform Locally

```bash
cd terraform

# Initialize
terraform init -backend=false

# Validate
terraform validate

# Format check
terraform fmt -check

# Plan (requires AWS credentials)
terraform plan -var="frontend_image=test" -var="backend_image=test"
```

### Testing OPA Policies

```bash
# Install conftest
# https://www.conftest.dev/install/

# Generate plan JSON
cd terraform
terraform init -backend=false
terraform plan -out=tfplan
terraform show -json tfplan > tfplan.json

# Run policies
conftest test tfplan.json --policy ../policies/
```

---

## Repository Structure

```
devops-project-11/
|
|-- frontend/                    # Next.js frontend application
|   |-- src/
|   |   |-- app/                 # App Router pages
|   |   |-- components/          # React components
|   |-- Dockerfile               # Multi-stage build
|   |-- package.json
|
|-- backend/                     # Express backend API
|   |-- src/
|   |   |-- index.js             # Server entry point
|   |-- Dockerfile               # Multi-stage build
|   |-- package.json
|
|-- terraform/                   # Infrastructure as Code
|   |-- providers.tf             # Provider configuration
|   |-- variables.tf             # Input variables
|   |-- vpc.tf                   # VPC and networking
|   |-- security-groups.tf       # Security groups
|   |-- iam.tf                   # IAM roles and policies
|   |-- alb.tf                   # Load balancers
|   |-- ecs.tf                   # ECS cluster and services
|   |-- outputs.tf               # Output values
|
|-- policies/                    # OPA/Rego policies
|   |-- no_public_backend.rego   # Backend isolation policy
|   |-- no_open_security_groups.rego
|   |-- mandatory_tags.rego      # Tagging requirements
|
|-- .github/
|   |-- workflows/
|       |-- devsecops-pipeline.yml
|
|-- README.md                    # This file
|-- CI-CD-JOBS-GUIDE.md          # Pipeline job documentation
```

---

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `AWS_REGION` | AWS deployment region | us-west-2 |
| `NEXT_PUBLIC_BACKEND_URL` | Backend API URL | http://localhost:3001 |
| `NODE_ENV` | Environment mode | development |
| `PORT` | Backend port | 3001 |

### GitHub Secrets Configuration

To enable the pipeline to interact with AWS, you must configure GitHub Secrets.

**1. Create the IAM Role for GitHub Actions**

Since the Terraform code manages the IAM role itself, you first need to bootstrap the environment or run Terraform locally once to create the role.

```bash
cd terraform
terraform init
terraform apply
```

Note the output value `github_actions_role_arn`:

```
github_actions_role_arn = "arn:aws:iam::123456789012:role/devsecops-project-11-github-actions-role"
```

**2. Add Secrets to GitHub**

1. Go to your GitHub repository
2. Navigate to **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Add the following secrets:

| Secret | Description | Value |
|--------|-------------|-------|
| `AWS_ROLE_ARN` | IAM role for OIDC authentication | The output value from step 1 (e.g. `arn:aws:iam::...`) |
| `GITLEAKS_LICENSE` | (Optional) Gitleaks license | Your Gitleaks license key |

### Terraform Variables

See `terraform/terraform.tfvars.example` for all available configuration options.

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes following existing patterns
4. Ensure all security checks pass
5. Submit a pull request

All contributions must pass the full CI/CD pipeline including security scans.

---

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.

This project is intended for educational purposes and DevSecOps demonstration. Feel free to fork, modify, and learn from the implementation.
