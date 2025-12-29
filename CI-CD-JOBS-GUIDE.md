# CI/CD Jobs Guide

This document provides a comprehensive reference for each job in the DevSecOps pipeline. For each job, you will find its purpose, the tool used, what it validates, what causes failure, and why it exists in a DevSecOps context.

Additionally, this guide includes specific instructions for intentionally triggering failures in each job. This allows security engineers and learners to observe pipeline behavior and understand why specific security controls exist.

---

## Table of Contents

- [Pipeline Overview](#pipeline-overview)
- [Job Reference](#job-reference)
  - [1. Secret Scanning](#1-secret-scanning)
  - [2. Frontend Lint and Build](#2-frontend-lint-and-build)
  - [3. Backend Lint and Build](#3-backend-lint-and-build)
  - [4. Container Build and Push](#4-container-build-and-push)
  - [5. Container Security Scan](#5-container-security-scan)
  - [6. Terraform Format and Validate](#6-terraform-format-and-validate)
  - [7. IaC Security Scan](#7-iac-security-scan)
  - [8. OPA Policy Enforcement](#8-opa-policy-enforcement)
  - [9. Terraform Plan](#9-terraform-plan)
  - [10. Manual Approval](#10-manual-approval)
  - [11. Terraform Apply](#11-terraform-apply)
  - [12. Drift Detection](#12-drift-detection)
  - [13. Update Image Tags](#13-update-image-tags)
- [Failure Trigger Summary](#failure-trigger-summary)

---

## Pipeline Overview

The DevSecOps pipeline implements security controls at every stage of the software delivery lifecycle:

```
Pre-Commit --> Build --> Container --> Infrastructure --> Deployment --> Post-Deploy
    |            |           |              |                 |              |
 Secrets      Linting    Scanning       Checkov          Approval        Drift
             Testing     Trivy           OPA              Apply       Detection
```

Each job runs independently and can fail the pipeline, preventing insecure code from reaching production.

---

## Job Reference

### 1. Secret Scanning

#### Purpose
Detect hardcoded secrets, credentials, API keys, and sensitive data in the source code before it reaches the repository.

#### Tool Used
**Gitleaks** - An open-source SAST tool for detecting and preventing hardcoded secrets.

#### What It Validates
- AWS access keys and secret keys
- GitHub tokens and API keys
- Database connection strings with credentials
- Private keys (RSA, SSH, PGP)
- Generic passwords and secrets patterns
- Cloud provider credentials (GCP, Azure)

#### What Causes Failure
The job fails when Gitleaks detects any pattern matching known secret formats in the codebase.

#### Why This Job Exists
Secrets in source code represent a critical security vulnerability. Once committed, secrets may persist in git history indefinitely. Attackers frequently scan public repositories for exposed credentials. This job provides the first line of defense against credential exposure.

#### Triggering Secret Scan Failure

To trigger a failure, add a file with a hardcoded secret:

```bash
# Create a file with an AWS key pattern
echo 'AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY' > backend/config.js
```

Or add to any existing file:

```javascript
// In any JavaScript file
const config = {
  apiKey: 'AKIAIOSFODNN7EXAMPLE',
  secretKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
};
```

**Expected Behavior**: The pipeline stops at the secret-scan job with an error message identifying the file and line containing the secret.

---

### 2. Frontend Lint and Build

#### Purpose
Ensure code quality standards and verify the application builds successfully.

#### Tool Used
- **ESLint** - JavaScript/TypeScript linting
- **Next.js Build** - Production build verification

#### What It Validates
- Code style consistency
- TypeScript type correctness
- Import/export syntax
- React best practices
- Accessibility rules
- Production build success

#### What Causes Failure
- ESLint errors (not warnings)
- TypeScript compilation errors
- Build-time errors in Next.js

#### Why This Job Exists
Code quality directly impacts security. Poor code is harder to review and more likely to contain vulnerabilities. The build step ensures the application is deployable.

#### Triggering Frontend Lint Failure

Add a TypeScript error:

```typescript
// In frontend/src/app/page.tsx
const x: number = "string"; // Type error
```

Or add an ESLint violation:

```typescript
// In any frontend TypeScript file
var unsafeVar = "should use const"; // ESLint: no-var
eval("dangerous code"); // ESLint: no-eval
```

**Expected Behavior**: The pipeline fails at frontend-lint-build with linting or type errors displayed.

---

### 3. Backend Lint and Build

#### Purpose
Validate backend code quality and identify vulnerable dependencies.

#### Tool Used
- **ESLint** - JavaScript linting with security rules
- **npm audit** - Dependency vulnerability scanning

#### What It Validates
- Code style and consistency
- Security-focused linting rules
- Dangerous function usage (eval, Function constructor)
- Dependency vulnerabilities

#### What Causes Failure
- ESLint errors
- High or critical vulnerabilities in dependencies (when strict mode enabled)

#### Why This Job Exists
Backend code often handles sensitive data and business logic. Security-focused linting catches common vulnerability patterns before deployment.

#### Triggering Backend Lint Failure

Add a code style violation:

```javascript
// In backend/src/index.js
var x = 1 // Missing semicolon + var instead of const
```

Or add security violations:

```javascript
// In backend/src/index.js
eval(userInput); // no-eval rule
new Function(userCode); // no-new-func rule
```

**Expected Behavior**: The pipeline fails at backend-lint-build with specific rule violations listed.

---

### 4. Container Build and Push

#### Purpose
Build Docker images for frontend and backend, tag with version information, and push to the container registry.

#### Tool Used
- **Docker Buildx** - Multi-platform container builds
- **GitHub Container Registry** - Image storage

#### What It Validates
- Dockerfile syntax correctness
- Build stage execution
- Layer caching efficiency
- Registry authentication

#### What Causes Failure
- Dockerfile syntax errors
- Failed build commands (npm install, etc.)
- Registry authentication failures
- Base image pull failures

#### Why This Job Exists
Containers provide consistent deployment environments. Building in CI ensures reproducibility and enables subsequent security scanning.

#### Triggering Container Build Failure

Add a Dockerfile syntax error:

```dockerfile
# In frontend/Dockerfile or backend/Dockerfile
RUN invalid command here
COPY nonexistent-file.txt /app/
```

Or reference a non-existent base image:

```dockerfile
FROM node:999-nonexistent
```

**Expected Behavior**: The pipeline fails at container-build-push with Docker build errors.

---

### 5. Container Security Scan

#### Purpose
Identify vulnerabilities in container images before deployment.

#### Tool Used
**Trivy** - Comprehensive vulnerability scanner for containers, filesystems, and git repositories.

#### What It Validates
- OS package vulnerabilities (Alpine, Debian, etc.)
- Application dependency vulnerabilities
- Known CVEs in base images
- Misconfiguration detection

#### What Causes Failure
The job fails when HIGH or CRITICAL severity vulnerabilities are detected with available fixes.

#### Why This Job Exists
Container images often include vulnerable dependencies inherited from base images or packages. Scanning prevents known vulnerabilities from reaching production.

#### Triggering Container Scan Failure

Use an older, vulnerable base image:

```dockerfile
# In backend/Dockerfile
FROM node:14-alpine  # Old version with known CVEs
```

Or add a vulnerable dependency:

```json
// In backend/package.json
{
  "dependencies": {
    "lodash": "4.17.19"  // Known prototype pollution vulnerability
  }
}
```

**Expected Behavior**: The pipeline fails at container-security-scan with a table of vulnerabilities listed.

---

### 6. Terraform Format and Validate

#### Purpose
Ensure Terraform code follows formatting standards and is syntactically correct.

#### Tool Used
- **terraform fmt** - Format verification
- **terraform validate** - Syntax validation

#### What It Validates
- HCL syntax correctness
- Resource attribute validity
- Variable and output declarations
- Provider configuration

#### What Causes Failure
- Improperly formatted files
- Syntax errors in HCL
- Invalid attribute references
- Missing required arguments

#### Why This Job Exists
Consistent formatting improves code review efficiency. Validation catches errors before planning, providing faster feedback.

#### Triggering Terraform Validation Failure

Add a syntax error:

```hcl
# In terraform/vpc.tf
resource "aws_vpc" "broken" {
  cidr_block = var.vpc_cidr
  invalid_argument = "this doesn't exist"
}
```

Or break formatting:

```hcl
# Poor formatting (misaligned)
resource "aws_vpc" "test" {
cidr_block="10.0.0.0/16"
enable_dns_hostnames=true
}
```

**Expected Behavior**: The pipeline fails at terraform-format-validate with formatting or validation errors.

---

### 7. IaC Security Scan

#### Purpose
Detect security misconfigurations in infrastructure code.

#### Tool Used
**Checkov** - Static analysis tool for infrastructure as code with 400+ built-in policies.

#### What It Validates
- Encryption settings (S3, EBS, RDS)
- Public access configurations
- Logging and monitoring
- Network security rules
- IAM policy strength
- Compliance frameworks (CIS, SOC2)

#### What Causes Failure
Checkov fails when security policy violations are detected (unless soft_fail is enabled).

#### Why This Job Exists
Infrastructure misconfigurations are a leading cause of cloud breaches. Automated scanning catches common mistakes before deployment.

#### Triggering Checkov Failure

Add an insecure S3 bucket:

```hcl
# In terraform/storage.tf (create new file)
resource "aws_s3_bucket" "insecure" {
  bucket = "my-insecure-bucket"
}

# Missing encryption, versioning, logging, public access block
```

Or disable encryption:

```hcl
resource "aws_s3_bucket_server_side_encryption_configuration" "disabled" {
  bucket = aws_s3_bucket.example.id
  # Missing encryption rule
}
```

**Expected Behavior**: The pipeline fails at iac-security-scan with Checkov policy violations listed.

---

### 8. OPA Policy Enforcement

#### Purpose
Enforce custom organizational policies against Terraform plan output.

#### Tool Used
- **Open Policy Agent (OPA)** - Policy engine
- **Conftest** - Test runner for OPA policies

#### What It Validates
- Backend not publicly accessible
- No security groups open to 0.0.0.0/0 on sensitive ports
- Required resource tags present
- Custom organizational requirements

#### What Causes Failure
Any `deny` rule returning a message causes the job to fail.

#### Why This Job Exists
Organizations have specific security requirements beyond generic best practices. OPA enables codification of custom policies, ensuring consistent enforcement.

#### Triggering OPA Policy Failure

##### Trigger No Public Backend Policy

```hcl
# In terraform/security-groups.tf
# Add this rule to the backend security group
resource "aws_vpc_security_group_ingress_rule" "backend_public" {
  security_group_id = aws_security_group.backend.id
  from_port         = 3001
  to_port           = 3001
  ip_protocol       = "tcp"
  cidr_ipv4         = "0.0.0.0/0"  # VIOLATION: Public access to backend
}
```

##### Trigger No Open Security Groups Policy

```hcl
# In terraform/security-groups.tf
resource "aws_vpc_security_group_ingress_rule" "ssh_open" {
  security_group_id = aws_security_group.frontend.id
  from_port         = 22
  to_port           = 22
  ip_protocol       = "tcp"
  cidr_ipv4         = "0.0.0.0/0"  # VIOLATION: SSH from internet
}
```

##### Trigger Mandatory Tags Policy

```hcl
# In terraform/vpc.tf
# Remove tags from a resource
resource "aws_vpc" "untagged" {
  cidr_block = "10.1.0.0/16"
  # No tags - violates mandatory tagging policy
}
```

**Expected Behavior**: The pipeline fails at opa-policy-check with the specific policy violation message.

---

### 9. Terraform Plan

#### Purpose
Generate and store the infrastructure execution plan.

#### Tool Used
**Terraform** - Infrastructure as Code tool

#### What It Validates
- Resource creation/modification feasibility
- AWS API accessibility
- Resource quotas and limits
- Dependency resolution

#### What Causes Failure
- AWS authentication failures
- Resource configuration errors
- Provider API errors
- Quota exceeded

#### Why This Job Exists
The plan shows exactly what will change before applying. Storing the plan ensures the exact reviewed changes are applied.

#### Triggering Terraform Plan Failure

Reference a non-existent resource:

```hcl
# In terraform/ecs.tf
resource "aws_ecs_service" "broken" {
  cluster         = aws_ecs_cluster.nonexistent.id  # Doesn't exist
  task_definition = aws_ecs_task_definition.frontend.arn
  desired_count   = 1
}
```

Or reference an invalid variable:

```hcl
resource "aws_vpc" "test" {
  cidr_block = var.undefined_variable  # Not defined
}
```

**Expected Behavior**: The pipeline fails at terraform-plan with resource reference or variable errors.

---

### 10. Manual Approval

#### Purpose
Require human review and explicit approval before production deployment.

#### Tool Used
**GitHub Environments** - Native GitHub environment protection rules

#### What It Validates
- Designated reviewer approval
- Optional wait timer compliance
- Branch protection rules

#### What Causes Failure
- Review rejection
- Timeout without approval
- Unauthorized deployment attempt

#### Why This Job Exists
Automated security controls cannot catch everything. Human review provides oversight for production changes, creating an audit trail and accountability.

#### Triggering Manual Approval Failure

1. Navigate to the running workflow in GitHub Actions
2. Click on the "Manual Approval" job
3. Click "Reject" instead of "Approve"

Alternatively, let the approval request timeout (default 72 hours).

**Expected Behavior**: The pipeline stops at manual-approval and does not proceed to terraform-apply.

---

### 11. Terraform Apply

#### Purpose
Apply the approved infrastructure changes to AWS.

#### Tool Used
**Terraform** - Applies the saved plan from the terraform-plan job.

#### What It Validates
- Plan integrity (saved plan matches current state)
- AWS API success for each operation
- Resource creation completion

#### What Causes Failure
- AWS API errors
- Resource creation failures
- Permission denied
- State lock conflicts

#### Why This Job Exists
This job executes the actual infrastructure changes. Running after approval ensures only reviewed changes are deployed.

#### Triggering Terraform Apply Failure

Apply failures typically occur due to:

1. **AWS Permissions**: Remove required permissions from the GitHub Actions role
2. **Resource Limits**: Exceed VPC or EIP limits in the AWS account
3. **State Drift**: Manually delete a resource Terraform expects to exist

**Expected Behavior**: The pipeline fails at terraform-apply with AWS API errors.

---

### 12. Drift Detection

#### Purpose
Verify infrastructure matches the Terraform configuration after deployment.

#### Tool Used
- **Terraform Plan** - Detects differences between state and actual infrastructure
- **Conftest** - Re-validates OPA policies

#### What It Validates
- No manual changes to infrastructure
- Resources match expected configuration
- Security policies still satisfied

#### What Causes Failure
- Detected infrastructure drift
- OPA policy violations in current state

#### Why This Job Exists
Changes made outside Terraform (console, CLI, other tools) can introduce security vulnerabilities. Drift detection catches these unauthorized modifications.

#### Triggering Drift Detection Failure

After a successful deployment:

1. Open AWS Console
2. Navigate to the ECS service or Security Group
3. Make a manual change (add a rule, modify configuration)
4. Run the pipeline again or trigger drift detection manually

Example manual changes:
- Add an ingress rule to a security group
- Modify ECS task environment variables
- Change ALB listener rules

**Expected Behavior**: The pipeline shows drift detected and may fail if the drift violates OPA policies.

---

### 13. Update Image Tags

#### Purpose
Automatically update Terraform variables with new container image tags.

#### Tool Used
- **Git** - Commit and push changes
- **GitHub Actions Bot** - Automated commit identity

#### What It Validates
- String replacement success
- Git push permissions

#### What Causes Failure
- Git push failures
- Protected branch rules blocking bot commits
- Invalid file modifications

#### Why This Job Exists
Automating image tag updates ensures infrastructure stays synchronized with the latest container builds without manual intervention.

#### Triggering Image Tag Update Failure

1. Lock the main branch from bot commits
2. Add branch protection requiring PR reviews with no bypass for bots
3. Break the sed command by changing variable file format

**Expected Behavior**: The pipeline fails at update-image-tags with git push errors.

---

## Failure Trigger Summary

| Job | How to Trigger Failure |
|-----|----------------------|
| Secret Scanning | Add `AWS_SECRET_ACCESS_KEY=...` to any file |
| Frontend Lint | Add TypeScript error or ESLint violation |
| Backend Lint | Use `var` instead of `const`, missing semicolons |
| Container Build | Dockerfile syntax error, invalid base image |
| Container Scan | Use old base image or vulnerable dependency |
| Terraform Validate | Invalid HCL syntax, poor formatting |
| IaC Security Scan | Add unencrypted S3 bucket |
| OPA Policy Check | Expose backend publicly, missing tags |
| Terraform Plan | Reference undefined resource |
| Manual Approval | Reject the approval request |
| Terraform Apply | Insufficient AWS permissions |
| Drift Detection | Make manual changes in AWS Console |
| Update Image Tags | Block bot commits on branch |

---

## Learning Exercises

### Exercise 1: Secret Prevention
1. Create a branch
2. Add a file with a fake AWS key
3. Attempt to push and observe the failure
4. Remove the secret and verify the scan passes

### Exercise 2: Policy Understanding
1. Review the OPA policies in `policies/`
2. Modify Terraform to violate each policy
3. Run the pipeline and observe error messages
4. Correct the violations

### Exercise 3: Container Security
1. Change the base image to an older version
2. Observe Trivy findings
3. Research the CVEs reported
4. Update to a secure version

### Exercise 4: Approval Flow
1. Push a change and watch the pipeline progress
2. Review the Terraform plan output
3. Practice approving and rejecting changes
4. Understand the audit trail created

---

This guide serves as both a reference and a learning tool. By understanding each security control and practicing failure scenarios, teams can better appreciate the layered security approach implemented in this DevSecOps pipeline.
