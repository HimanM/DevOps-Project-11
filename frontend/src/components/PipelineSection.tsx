"use client";

import { useState } from "react";

interface PipelineStage {
    id: string;
    name: string;
    description: string;
    tool: string;
    icon: React.ReactNode;
    color: string;
    details: string[];
    failureExample: string;
}

const pipelineStages: PipelineStage[] = [
    {
        id: "secret-scan",
        name: "Secret Scanning",
        description: "Detect hardcoded secrets and credentials in source code",
        tool: "Gitleaks",
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
        ),
        color: "red",
        details: [
            "Scans entire repository for secrets",
            "Detects API keys, passwords, tokens",
            "Prevents credentials from reaching production",
        ],
        failureExample: "Add AWS_SECRET_KEY=abc123 to any file",
    },
    {
        id: "frontend-build",
        name: "Frontend Lint & Build",
        description: "Static analysis and build verification for Next.js application",
        tool: "ESLint + Next.js",
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
        ),
        color: "blue",
        details: [
            "Runs ESLint for code quality",
            "TypeScript type checking",
            "Next.js production build",
        ],
        failureExample: "Introduce a TypeScript error or ESLint warning",
    },
    {
        id: "backend-build",
        name: "Backend Lint & Build",
        description: "Code quality checks for Node.js Express application",
        tool: "ESLint + Node.js",
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
            </svg>
        ),
        color: "green",
        details: [
            "Runs ESLint for code quality",
            "Security-focused linting rules",
            "Validates package dependencies",
        ],
        failureExample: "Add var instead of const or remove semicolons",
    },
    {
        id: "container-build",
        name: "Container Build & Push",
        description: "Build Docker images and push to GitHub Container Registry",
        tool: "Docker + GHCR",
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
        ),
        color: "cyan",
        details: [
            "Multi-stage Docker builds",
            "Tags with SHA and latest",
            "Pushes to ghcr.io/himanm/devops-project-11-*",
        ],
        failureExample: "Introduce syntax error in Dockerfile",
    },
    {
        id: "container-scan",
        name: "Container Security Scan",
        description: "Scan container images for vulnerabilities",
        tool: "Trivy",
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
        ),
        color: "purple",
        details: [
            "Scans for CVEs in OS packages",
            "Detects vulnerable dependencies",
            "Blocks HIGH/CRITICAL vulnerabilities",
        ],
        failureExample: "Use an old base image with known vulnerabilities",
    },
    {
        id: "terraform-validate",
        name: "Terraform Format & Validate",
        description: "Verify Terraform configuration syntax and formatting",
        tool: "Terraform",
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
        color: "violet",
        details: [
            "Checks formatting with terraform fmt",
            "Validates configuration syntax",
            "Initializes providers for validation",
        ],
        failureExample: "Remove closing brace or misalign indentation",
    },
    {
        id: "iac-scan",
        name: "IaC Security Scan",
        description: "Static analysis for infrastructure security misconfigurations",
        tool: "Checkov",
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
        ),
        color: "orange",
        details: [
            "400+ security policies",
            "AWS best practices checks",
            "Compliance validation",
        ],
        failureExample: "Add encryption = false to an S3 bucket",
    },
    {
        id: "opa-check",
        name: "OPA Policy Enforcement",
        description: "Custom policy validation using Open Policy Agent",
        tool: "Conftest + OPA",
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
        ),
        color: "teal",
        details: [
            "No public backend policy",
            "No open security groups",
            "Mandatory tagging enforcement",
        ],
        failureExample: "Remove required tags or expose backend",
    },
    {
        id: "terraform-plan",
        name: "Terraform Plan",
        description: "Generate and review infrastructure changes",
        tool: "Terraform",
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
        color: "indigo",
        details: [
            "Generates execution plan",
            "Shows resources to be created/modified",
            "Saves plan artifact for apply",
        ],
        failureExample: "Reference non-existent variable or resource",
    },
    {
        id: "manual-approval",
        name: "Manual Approval",
        description: "Human review gate before production deployment",
        tool: "GitHub Environments",
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        color: "yellow",
        details: [
            "Requires designated reviewer approval",
            "Timeout after 72 hours",
            "Audit trail of approvals",
        ],
        failureExample: "Reject the deployment manually",
    },
    {
        id: "terraform-apply",
        name: "Terraform Apply",
        description: "Apply infrastructure changes to production",
        tool: "Terraform",
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
        ),
        color: "emerald",
        details: [
            "Applies saved plan",
            "Creates/updates AWS resources",
            "Stores state in backend",
        ],
        failureExample: "AWS credentials expired or insufficient permissions",
    },
    {
        id: "drift-detection",
        name: "Drift Detection",
        description: "Detect infrastructure configuration drift post-deployment",
        tool: "Terraform + OPA",
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
        ),
        color: "rose",
        details: [
            "Runs terraform plan post-deploy",
            "Detects manual changes",
            "Re-validates OPA policies",
        ],
        failureExample: "Manually change a resource in AWS console",
    },
];

export default function PipelineSection() {
    const [selectedStage, setSelectedStage] = useState<PipelineStage | null>(null);

    const getColorClasses = (color: string) => {
        const colorMap: Record<string, { bg: string; border: string; text: string; bgLight: string }> = {
            red: { bg: "bg-red-500", border: "border-red-500/30", text: "text-red-400", bgLight: "bg-red-500/10" },
            blue: { bg: "bg-blue-500", border: "border-blue-500/30", text: "text-blue-400", bgLight: "bg-blue-500/10" },
            green: { bg: "bg-green-500", border: "border-green-500/30", text: "text-green-400", bgLight: "bg-green-500/10" },
            cyan: { bg: "bg-cyan-500", border: "border-cyan-500/30", text: "text-cyan-400", bgLight: "bg-cyan-500/10" },
            purple: { bg: "bg-purple-500", border: "border-purple-500/30", text: "text-purple-400", bgLight: "bg-purple-500/10" },
            violet: { bg: "bg-violet-500", border: "border-violet-500/30", text: "text-violet-400", bgLight: "bg-violet-500/10" },
            orange: { bg: "bg-orange-500", border: "border-orange-500/30", text: "text-orange-400", bgLight: "bg-orange-500/10" },
            teal: { bg: "bg-teal-500", border: "border-teal-500/30", text: "text-teal-400", bgLight: "bg-teal-500/10" },
            indigo: { bg: "bg-indigo-500", border: "border-indigo-500/30", text: "text-indigo-400", bgLight: "bg-indigo-500/10" },
            yellow: { bg: "bg-yellow-500", border: "border-yellow-500/30", text: "text-yellow-400", bgLight: "bg-yellow-500/10" },
            emerald: { bg: "bg-emerald-500", border: "border-emerald-500/30", text: "text-emerald-400", bgLight: "bg-emerald-500/10" },
            rose: { bg: "bg-rose-500", border: "border-rose-500/30", text: "text-rose-400", bgLight: "bg-rose-500/10" },
        };
        return colorMap[color] || colorMap.blue;
    };

    return (
        <section id="pipeline" className="scroll-mt-24">
            <div className="text-center mb-12">
                <h2 className="section-heading">CI/CD Pipeline</h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                    A comprehensive security-first pipeline with 12 stages, each implemented as an independent
                    GitHub Actions job for maximum visibility and control.
                </p>
            </div>

            {/* Pipeline Flow */}
            <div className="glass-card mb-8">
                <h3 className="subsection-heading mb-6">Pipeline Stages</h3>
                <p className="text-slate-400 mb-8">
                    Click on any stage to view detailed information about its purpose and how to test it.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {pipelineStages.map((stage, index) => {
                        const colors = getColorClasses(stage.color);
                        return (
                            <button
                                key={stage.id}
                                onClick={() => setSelectedStage(selectedStage?.id === stage.id ? null : stage)}
                                className={`relative p-4 rounded-xl border transition-all duration-300 text-left group ${selectedStage?.id === stage.id
                                        ? `${colors.border} ${colors.bgLight} shadow-lg`
                                        : "border-slate-700/50 hover:border-slate-600/50 bg-slate-800/30 hover:bg-slate-800/50"
                                    }`}
                            >
                                {/* Stage Number */}
                                <div className={`absolute -top-2 -left-2 w-6 h-6 rounded-full ${colors.bg} flex items-center justify-center text-xs font-bold text-white shadow-lg`}>
                                    {index + 1}
                                </div>

                                {/* Icon */}
                                <div className={`mb-3 ${colors.text}`}>{stage.icon}</div>

                                {/* Title */}
                                <h4 className="text-sm font-semibold text-white mb-1 line-clamp-1">{stage.name}</h4>

                                {/* Tool */}
                                <p className={`text-xs ${colors.text}`}>{stage.tool}</p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Selected Stage Details */}
            {selectedStage && (
                <div className={`glass-card border ${getColorClasses(selectedStage.color).border} animate-in`}>
                    <div className="flex items-start gap-4 mb-6">
                        <div className={`p-3 rounded-xl ${getColorClasses(selectedStage.color).bgLight} ${getColorClasses(selectedStage.color).text}`}>
                            {selectedStage.icon}
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-white">{selectedStage.name}</h3>
                            <p className="text-slate-400">{selectedStage.description}</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* What it does */}
                        <div className={`p-4 rounded-xl ${getColorClasses(selectedStage.color).bgLight} border ${getColorClasses(selectedStage.color).border}`}>
                            <h4 className={`text-sm font-semibold ${getColorClasses(selectedStage.color).text} mb-3`}>What This Stage Does</h4>
                            <ul className="space-y-2">
                                {selectedStage.details.map((detail, i) => (
                                    <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                                        <svg className={`w-4 h-4 mt-0.5 flex-shrink-0 ${getColorClasses(selectedStage.color).text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {detail}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* How to trigger failure */}
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                            <h4 className="text-sm font-semibold text-red-400 mb-3">How to Trigger Failure</h4>
                            <p className="text-slate-300 text-sm">{selectedStage.failureExample}</p>
                            <p className="text-slate-500 text-xs mt-3">
                                The pipeline will stop at this stage and prevent deployment.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Pipeline Philosophy */}
            <div className="mt-8 glass-card">
                <h3 className="subsection-heading mb-4">Pipeline Philosophy</h3>
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="p-4 rounded-xl bg-slate-800/50">
                        <div className="text-devsec-400 mb-2">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h4 className="font-semibold text-white mb-1">Fail Fast</h4>
                        <p className="text-sm text-slate-400">
                            Security checks run early to catch issues before expensive build stages.
                        </p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-800/50">
                        <div className="text-purple-400 mb-2">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h4 className="font-semibold text-white mb-1">Defense in Depth</h4>
                        <p className="text-sm text-slate-400">
                            Multiple security layers ensure no single point of failure in the pipeline.
                        </p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-800/50">
                        <div className="text-emerald-400 mb-2">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>
                        <h4 className="font-semibold text-white mb-1">Full Visibility</h4>
                        <p className="text-sm text-slate-400">
                            Each security check is a separate job for clear audit trails and debugging.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
