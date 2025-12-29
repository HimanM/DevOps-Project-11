# -----------------------------
# No Open Security Groups Policy
# Prevents overly permissive network access
# -----------------------------

package main

# Sensitive ports that should never be open to the internet
sensitive_ports := [22, 3389, 3306, 5432, 27017, 6379, 11211]

# Deny SSH (port 22) open to internet
deny[msg] {
    resource := input.resource_changes[_]
    resource.type == "aws_vpc_security_group_ingress_rule"
    resource.change.actions[_] != "delete"
    
    resource.change.after.from_port <= 22
    resource.change.after.to_port >= 22
    resource.change.after.cidr_ipv4 == "0.0.0.0/0"
    
    msg := sprintf(
        "DENIED: Security group rule '%s' allows SSH (port 22) from 0.0.0.0/0. SSH access must be restricted.",
        [resource.address]
    )
}

# Deny RDP (port 3389) open to internet
deny[msg] {
    resource := input.resource_changes[_]
    resource.type == "aws_vpc_security_group_ingress_rule"
    resource.change.actions[_] != "delete"
    
    resource.change.after.from_port <= 3389
    resource.change.after.to_port >= 3389
    resource.change.after.cidr_ipv4 == "0.0.0.0/0"
    
    msg := sprintf(
        "DENIED: Security group rule '%s' allows RDP (port 3389) from 0.0.0.0/0. RDP access must be restricted.",
        [resource.address]
    )
}

# Deny database ports open to internet
deny[msg] {
    resource := input.resource_changes[_]
    resource.type == "aws_vpc_security_group_ingress_rule"
    resource.change.actions[_] != "delete"
    
    port := sensitive_ports[_]
    resource.change.after.from_port <= port
    resource.change.after.to_port >= port
    resource.change.after.cidr_ipv4 == "0.0.0.0/0"
    
    # Exclude already handled SSH and RDP
    port != 22
    port != 3389
    
    msg := sprintf(
        "DENIED: Security group rule '%s' allows port %d from 0.0.0.0/0. Database and cache ports must not be publicly accessible.",
        [resource.address, port]
    )
}

# Deny all-ports open to internet (from_port=0, to_port=65535 or protocol=-1)
deny[msg] {
    resource := input.resource_changes[_]
    resource.type == "aws_vpc_security_group_ingress_rule"
    resource.change.actions[_] != "delete"
    
    resource.change.after.ip_protocol == "-1"
    resource.change.after.cidr_ipv4 == "0.0.0.0/0"
    
    msg := sprintf(
        "DENIED: Security group rule '%s' allows all protocols/ports from 0.0.0.0/0. This is overly permissive.",
        [resource.address]
    )
}

# Deny inline security group rules with all ports open
deny[msg] {
    resource := input.resource_changes[_]
    resource.type == "aws_security_group"
    resource.change.actions[_] != "delete"
    
    ingress := resource.change.after.ingress[_]
    ingress.protocol == "-1"
    ingress.cidr_blocks[_] == "0.0.0.0/0"
    
    msg := sprintf(
        "DENIED: Security group '%s' has inline rule allowing all protocols from 0.0.0.0/0.",
        [resource.address]
    )
}

# Warn about wide port ranges open to internet
warn[msg] {
    resource := input.resource_changes[_]
    resource.type == "aws_vpc_security_group_ingress_rule"
    resource.change.actions[_] != "delete"
    
    resource.change.after.cidr_ipv4 == "0.0.0.0/0"
    
    from_port := resource.change.after.from_port
    to_port := resource.change.after.to_port
    
    # Wide range is more than 10 ports
    (to_port - from_port) > 10
    
    msg := sprintf(
        "WARNING: Security group rule '%s' opens wide port range (%d-%d) to internet. Consider narrowing the range.",
        [resource.address, from_port, to_port]
    )
}
