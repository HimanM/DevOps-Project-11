"use client";

export default function SecuritySection() {
    const securityControls = [
        {
            category: "Code Security",
            items: [
                {
                    name: "Secret Detection",
                    tool: "Gitleaks",
                    description: "Prevents hardcoded credentials from reaching the repository",
                    enforcement: "Pre-merge",
                    status: "Automated",
                },
                {
                    name: "Static Code Analysis",
                    tool: "ESLint",
                    description: "Identifies code quality issues and potential security bugs",
                    enforcement: "Build stage",
                    status: "Automated",
                },
            ],
        },
        {
            category: "Container Security",
            items: [
                {
                    name: "Image Vulnerability Scan",
                    tool: "Trivy",
                    description: "Scans container images for known CVEs",
                    enforcement: "Post-build",
                    status: "Automated",
                },
                {
                    name: "Non-root Container User",
                    tool: "Dockerfile",
                    description: "Containers run as non-privileged user",
                    enforcement: "Build-time",
                    status: "Enforced",
                },
                {
                    name: "Minimal Base Images",
                    tool: "Alpine Linux",
                    description: "Reduced attack surface with minimal OS packages",
                    enforcement: "Build-time",
                    status: "Enforced",
                },
            ],
        },
        {
            category: "Infrastructure Security",
            items: [
                {
                    name: "IaC Security Scan",
                    tool: "Checkov",
                    description: "Validates Terraform against 400+ security policies",
                    enforcement: "Pre-plan",
                    status: "Automated",
                },
                {
                    name: "Policy-as-Code",
                    tool: "OPA/Conftest",
                    description: "Custom organizational policies for infrastructure",
                    enforcement: "Pre-apply",
                    status: "Automated",
                },
                {
                    name: "Drift Detection",
                    tool: "Terraform",
                    description: "Detects unauthorized infrastructure changes",
                    enforcement: "Post-deploy",
                    status: "Automated",
                },
            ],
        },
        {
            category: "Access Control",
            items: [
                {
                    name: "Manual Approval Gate",
                    tool: "GitHub Environments",
                    description: "Human review required before production deployment",
                    enforcement: "Pre-production",
                    status: "Required",
                },
                {
                    name: "Least Privilege IAM",
                    tool: "Terraform/AWS",
                    description: "Minimal permissions for all roles and policies",
                    enforcement: "Design-time",
                    status: "Enforced",
                },
                {
                    name: "Network Segmentation",
                    tool: "AWS VPC",
                    description: "Backend isolated in private subnets",
                    enforcement: "Infrastructure",
                    status: "Enforced",
                },
            ],
        },
    ];

    const complianceFrameworks = [
        { name: "SOC 2", relevantControls: ["Access Control", "Audit Logging", "Encryption"] },
        { name: "NIST CSF", relevantControls: ["Identify", "Protect", "Detect", "Respond"] },
        { name: "CIS Benchmarks", relevantControls: ["Container Security", "AWS Best Practices"] },
    ];

    return (
        <section id="security" className="scroll-mt-24">
            <div className="text-center mb-12">
                <h2 className="section-heading">Security Controls</h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                    Defense-in-depth security implementation with automated enforcement at every stage
                    of the delivery pipeline.
                </p>
            </div>

            {/* Security Controls Grid */}
            <div className="space-y-8">
                {securityControls.map((category) => (
                    <div key={category.category} className="glass-card">
                        <h3 className="subsection-heading mb-6">{category.category}</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-700/50">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Control</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Tool</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400 hidden md:table-cell">Description</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Enforcement</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {category.items.map((item) => (
                                        <tr key={item.name} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors">
                                            <td className="py-3 px-4">
                                                <span className="font-medium text-white">{item.name}</span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="px-2 py-1 rounded bg-devsec-500/10 text-devsec-400 text-sm font-mono">
                                                    {item.tool}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-slate-400 text-sm hidden md:table-cell">
                                                {item.description}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="text-sm text-slate-300">{item.enforcement}</span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${item.status === "Automated" ? "bg-emerald-500/20 text-emerald-400" :
                                                        item.status === "Required" ? "bg-amber-500/20 text-amber-400" :
                                                            "bg-purple-500/20 text-purple-400"
                                                    }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>

            {/* Security Metrics */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Security Stages", value: "12", suffix: "jobs" },
                    { label: "Policy Checks", value: "400+", suffix: "rules" },
                    { label: "Scan Coverage", value: "100", suffix: "%" },
                    { label: "Manual Gates", value: "1", suffix: "required" },
                ].map((metric) => (
                    <div key={metric.label} className="glass-card text-center">
                        <div className="text-3xl md:text-4xl font-bold gradient-text mb-1">
                            {metric.value}
                        </div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                            {metric.suffix}
                        </div>
                        <div className="text-sm text-slate-400">{metric.label}</div>
                    </div>
                ))}
            </div>

            {/* Compliance Alignment */}
            <div className="mt-12 glass-card">
                <h3 className="subsection-heading mb-6">Compliance Framework Alignment</h3>
                <p className="text-slate-400 mb-6">
                    The security controls implemented in this pipeline align with industry-standard compliance frameworks.
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                    {complianceFrameworks.map((framework) => (
                        <div key={framework.name} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                            <h4 className="font-semibold text-white mb-3">{framework.name}</h4>
                            <div className="flex flex-wrap gap-2">
                                {framework.relevantControls.map((control) => (
                                    <span
                                        key={control}
                                        className="px-2 py-1 rounded bg-devsec-500/10 text-devsec-400 text-xs"
                                    >
                                        {control}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
