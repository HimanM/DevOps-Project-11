# -----------------------------
# Mandatory Tagging Policy
# Enforces required resource tags
# -----------------------------

package main

# Required tags that must be present on all taggable resources
required_tags := ["Project", "Environment", "ManagedBy"]

# Resource types that must have tags
taggable_resources := [
    "aws_vpc",
    "aws_subnet",
    "aws_internet_gateway",
    "aws_nat_gateway",
    "aws_eip",
    "aws_route_table",
    "aws_security_group",
    "aws_ecs_cluster",
    "aws_ecs_service",
    "aws_ecs_task_definition",
    "aws_lb",
    "aws_lb_target_group",
    "aws_lb_listener",
    "aws_cloudwatch_log_group",
    "aws_iam_role",
    "aws_s3_bucket",
    "aws_flow_log"
]

# Check if resource type is taggable
is_taggable(resource_type) {
    resource_type == taggable_resources[_]
}

# Deny resources missing required tags
deny[msg] {
    resource := input.resource_changes[_]
    resource.change.actions[_] == "create"
    
    is_taggable(resource.type)
    
    # Get tags or empty object
    tags := object.get(resource.change.after, "tags", {})
    tags_all := object.get(resource.change.after, "tags_all", {})
    
    # Merge tags and tags_all
    all_tags := object.union(tags, tags_all)
    
    # Check for missing required tag
    required_tag := required_tags[_]
    not all_tags[required_tag]
    
    msg := sprintf(
        "DENIED: Resource '%s' of type '%s' is missing required tag: '%s'. All resources must have Project, Environment, and ManagedBy tags.",
        [resource.address, resource.type, required_tag]
    )
}

# Deny empty tag values
deny[msg] {
    resource := input.resource_changes[_]
    resource.change.actions[_] == "create"
    
    is_taggable(resource.type)
    
    tags := object.get(resource.change.after, "tags", {})
    tags_all := object.get(resource.change.after, "tags_all", {})
    all_tags := object.union(tags, tags_all)
    
    required_tag := required_tags[_]
    all_tags[required_tag] == ""
    
    msg := sprintf(
        "DENIED: Resource '%s' has empty value for required tag '%s'. Tag values cannot be empty.",
        [resource.address, required_tag]
    )
}

# Warn about resources without Name tag
warn[msg] {
    resource := input.resource_changes[_]
    resource.change.actions[_] == "create"
    
    is_taggable(resource.type)
    
    tags := object.get(resource.change.after, "tags", {})
    not tags["Name"]
    
    msg := sprintf(
        "WARNING: Resource '%s' of type '%s' does not have a Name tag. Consider adding one for easier identification.",
        [resource.address, resource.type]
    )
}

# Validate Environment tag values
valid_environments := ["development", "staging", "production"]

deny[msg] {
    resource := input.resource_changes[_]
    resource.change.actions[_] == "create"
    
    is_taggable(resource.type)
    
    tags := object.get(resource.change.after, "tags", {})
    tags_all := object.get(resource.change.after, "tags_all", {})
    all_tags := object.union(tags, tags_all)
    
    env_value := all_tags["Environment"]
    env_value != ""
    not valid_environment(env_value)
    
    msg := sprintf(
        "DENIED: Resource '%s' has invalid Environment tag value '%s'. Must be one of: %v",
        [resource.address, env_value, valid_environments]
    )
}

valid_environment(env) {
    env == valid_environments[_]
}
