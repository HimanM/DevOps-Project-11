# -----------------------------
# No Public Backend Policy
# Ensures backend services remain private
# -----------------------------

package main

# Deny any security group rule that exposes backend to 0.0.0.0/0
deny[msg] {
    resource := input.resource_changes[_]
    resource.type == "aws_vpc_security_group_ingress_rule"
    resource.change.actions[_] != "delete"
    
    # Check if this is related to backend
    contains(lower(resource.address), "backend")
    
    # Check for public CIDR
    resource.change.after.cidr_ipv4 == "0.0.0.0/0"
    
    msg := sprintf(
        "DENIED: Backend security group rule '%s' cannot have public ingress (0.0.0.0/0). Backend must only be accessible from frontend.",
        [resource.address]
    )
}

# Deny backend security group with inline public ingress
deny[msg] {
    resource := input.resource_changes[_]
    resource.type == "aws_security_group"
    resource.change.actions[_] != "delete"
    
    # Check if this is backend security group
    contains(lower(resource.address), "backend")
    
    # Check inline ingress rules
    ingress := resource.change.after.ingress[_]
    ingress.cidr_blocks[_] == "0.0.0.0/0"
    
    msg := sprintf(
        "DENIED: Backend security group '%s' has inline ingress rule allowing 0.0.0.0/0. Backend must remain private.",
        [resource.address]
    )
}

# Deny backend ECS service with public IP assignment
deny[msg] {
    resource := input.resource_changes[_]
    resource.type == "aws_ecs_service"
    resource.change.actions[_] != "delete"
    
    # Check if this is backend service
    contains(lower(resource.address), "backend")
    
    # Check network configuration
    resource.change.after.network_configuration[_].assign_public_ip == true
    
    msg := sprintf(
        "DENIED: Backend ECS service '%s' cannot have assign_public_ip = true. Backend must remain in private subnets.",
        [resource.address]
    )
}

# Deny internal ALB being set to internet-facing
deny[msg] {
    resource := input.resource_changes[_]
    resource.type == "aws_lb"
    resource.change.actions[_] != "delete"
    
    # Check if this is internal/backend ALB
    contains(lower(resource.address), "internal")
    
    # Check if it's set to internet-facing
    resource.change.after.internal == false
    
    msg := sprintf(
        "DENIED: Internal load balancer '%s' cannot be internet-facing (internal must be true).",
        [resource.address]
    )
}
