"use client";

import { useState } from "react";

const policies = [
    {
        name: "no_public_backend.rego",
        description: "Ensures the backend ECS service cannot be exposed to the public internet",
        category: "Network Security",
        code: `package main

import rego.v1

# Deny public access to backend services
deny contains msg if {
    resource := input.resource_changes[_]
    resource.type == "aws_security_group_rule"
    resource.change.after.type == "ingress"
    resource.change.after.cidr_blocks[_] == "0.0.0.0/0"
    contains(resource.change.after.security_group_id, "backend")
    msg := sprintf(
        "Backend security group '%s' cannot have public ingress rules (0.0.0.0/0)",
        [resource.address]
    )
}

# Deny backend service registration with public load balancer
deny contains msg if {
    resource := input.resource_changes[_]
    resource.type == "aws_lb_target_group"
    contains(resource.name, "backend")
    resource.change.after.target_type == "ip"
    
    # Check if associated with public ALB
    lb := input.resource_changes[_]
    lb.type == "aws_lb"
    lb.change.after.internal == false
    
    msg := "Backend service cannot be registered with a public load balancer"
}`,
    },
    {
        name: "no_open_security_groups.rego",
        description: "Prevents security groups from having overly permissive ingress rules",
        category: "Network Security",
        code: `package main

import rego.v1

# Deny SSH access from anywhere
deny contains msg if {
    resource := input.resource_changes[_]
    resource.type == "aws_security_group_rule"
    resource.change.after.type == "ingress"
    resource.change.after.from_port <= 22
    resource.change.after.to_port >= 22
    resource.change.after.cidr_blocks[_] == "0.0.0.0/0"
    msg := sprintf(
        "Security group rule '%s' allows SSH (port 22) from 0.0.0.0/0",
        [resource.address]
    )
}

# Deny RDP access from anywhere
deny contains msg if {
    resource := input.resource_changes[_]
    resource.type == "aws_security_group_rule"
    resource.change.after.type == "ingress"
    resource.change.after.from_port <= 3389
    resource.change.after.to_port >= 3389
    resource.change.after.cidr_blocks[_] == "0.0.0.0/0"
    msg := sprintf(
        "Security group rule '%s' allows RDP (port 3389) from 0.0.0.0/0",
        [resource.address]
    )
}

# Deny all ports open to internet (except 80, 443)
deny contains msg if {
    resource := input.resource_changes[_]
    resource.type == "aws_security_group"
    ingress := resource.change.after.ingress[_]
    ingress.cidr_blocks[_] == "0.0.0.0/0"
    
    # Allow only HTTP and HTTPS to be public
    not ingress.from_port == 80
    not ingress.from_port == 443
    
    msg := sprintf(
        "Security group '%s' has port %d open to the internet",
        [resource.address, ingress.from_port]
    )
}`,
    },
    {
        name: "mandatory_tags.rego",
        description: "Enforces required resource tags for cost allocation and management",
        category: "Governance",
        code: `package main

import rego.v1

# Required tags that must be present on all taggable resources
required_tags := ["Project", "Environment", "ManagedBy"]

# Taggable resource types
taggable_resources := [
    "aws_vpc",
    "aws_subnet",
    "aws_security_group",
    "aws_ecs_cluster",
    "aws_ecs_service",
    "aws_ecs_task_definition",
    "aws_lb",
    "aws_lb_target_group",
    "aws_cloudwatch_log_group",
    "aws_iam_role"
]

# Deny resources missing required tags
deny contains msg if {
    resource := input.resource_changes[_]
    resource.type == taggable_resources[_]
    resource.change.actions[_] == "create"
    
    tags := object.get(resource.change.after, "tags", {})
    required_tag := required_tags[_]
    not tags[required_tag]
    
    msg := sprintf(
        "Resource '%s' of type '%s' is missing required tag: %s",
        [resource.address, resource.type, required_tag]
    )
}

# Deny empty tag values
deny contains msg if {
    resource := input.resource_changes[_]
    resource.type == taggable_resources[_]
    resource.change.actions[_] == "create"
    
    tags := object.get(resource.change.after, "tags", {})
    required_tag := required_tags[_]
    tags[required_tag] == ""
    
    msg := sprintf(
        "Resource '%s' has empty value for required tag: %s",
        [resource.address, required_tag]
    )
}`,
    },
];

export default function PolicySection() {
    const [selectedPolicy, setSelectedPolicy] = useState(policies[0]);

    return (
        <section id="policies" className="scroll-mt-24">
            <div className="text-center mb-12">
                <h2 className="section-heading">Policy-as-Code</h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                    Open Policy Agent (OPA) with Conftest enforces custom organizational policies
                    against Terraform plan output before any infrastructure changes are applied.
                </p>
            </div>

            <div className="glass-card mb-8">
                {/* Policy Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {policies.map((policy) => (
                        <button
                            key={policy.name}
                            onClick={() => setSelectedPolicy(policy)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedPolicy.name === policy.name
                                    ? "bg-teal-500 text-white shadow-lg"
                                    : "bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50"
                                }`}
                        >
                            {policy.name}
                        </button>
                    ))}
                </div>

                {/* Policy Details */}
                <div className="mb-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h4 className="font-semibold text-white">{selectedPolicy.name}</h4>
                            <p className="text-sm text-slate-400">{selectedPolicy.description}</p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-400 text-sm font-medium w-fit">
                            {selectedPolicy.category}
                        </span>
                    </div>
                </div>

                {/* Policy Code */}
                <div className="relative">
                    <div className="absolute top-3 right-3 flex gap-2">
                        <span className="px-2 py-1 rounded bg-slate-700/50 text-slate-400 text-xs">
                            Rego
                        </span>
                    </div>
                    <pre className="code-block overflow-x-auto max-h-[400px]">
                        <code className="text-slate-300 text-sm">{selectedPolicy.code}</code>
                    </pre>
                </div>
            </div>

            {/* How OPA Works */}
            <div className="glass-card">
                <h3 className="subsection-heading mb-6">How Policy Enforcement Works</h3>

                <div className="grid md:grid-cols-4 gap-4">
                    {[
                        {
                            step: "1",
                            title: "Plan Generation",
                            description: "Terraform generates a JSON plan of proposed changes",
                            icon: (
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            ),
                        },
                        {
                            step: "2",
                            title: "Policy Evaluation",
                            description: "Conftest evaluates the plan against Rego policies",
                            icon: (
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                            ),
                        },
                        {
                            step: "3",
                            title: "Decision",
                            description: "Policies return deny messages for violations",
                            icon: (
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            ),
                        },
                        {
                            step: "4",
                            title: "Enforcement",
                            description: "Pipeline fails if any deny rules match",
                            icon: (
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            ),
                        },
                    ].map((item) => (
                        <div key={item.step} className="relative p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                            <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-sm font-bold text-white shadow-lg">
                                {item.step}
                            </div>
                            <div className="text-teal-400 mb-3 mt-2">{item.icon}</div>
                            <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                            <p className="text-sm text-slate-400">{item.description}</p>
                        </div>
                    ))}
                </div>

                {/* Command Example */}
                <div className="mt-6 p-4 rounded-lg bg-slate-900/80 border border-slate-700/50">
                    <p className="text-sm text-slate-400 mb-2">Pipeline command:</p>
                    <code className="text-teal-400 font-mono text-sm">
                        conftest test tfplan.json --policy policies/ --all-namespaces
                    </code>
                </div>
            </div>
        </section>
    );
}
