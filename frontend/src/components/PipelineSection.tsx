"use client";

import { useState } from "react";
import {
    SiNextdotjs,
    SiNodedotjs,
    SiDocker,
    SiTerraform
} from "react-icons/si";
import {
    FaShieldAlt,
    FaCheckCircle,
    FaClipboardCheck,
    FaClock,
    FaRocket,
    FaSyncAlt,
    FaKey,
    FaBalanceScale
} from "react-icons/fa";

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
        icon: <FaKey className="w-6 h-6" />,
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
        icon: <SiNextdotjs className="w-6 h-6" />,
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
        icon: <SiNodedotjs className="w-6 h-6" />,
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
        icon: <SiDocker className="w-6 h-6" />,
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
        icon: <FaShieldAlt className="w-6 h-6" />,
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
        icon: <SiTerraform className="w-6 h-6" />,
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
        icon: <FaCheckCircle className="w-6 h-6" />,
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
        icon: <FaBalanceScale className="w-6 h-6" />,
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
        icon: <FaClipboardCheck className="w-6 h-6" />,
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
        icon: <FaClock className="w-6 h-6" />,
        color: "yellow",
        details: [
            "Requires designated reviewer approval",
            "Configurable timeout",
            "Audit trail of approvals",
        ],
        failureExample: "Reject the deployment manually",
    },
    {
        id: "terraform-apply",
        name: "Terraform Apply",
        description: "Apply infrastructure changes to AWS",
        tool: "Terraform",
        icon: <FaRocket className="w-6 h-6" />,
        color: "emerald",
        details: [
            "Applies saved plan",
            "Creates/updates AWS resources",
            "Stores state in S3 backend",
        ],
        failureExample: "AWS credentials expired or insufficient permissions",
    },
    {
        id: "drift-detection",
        name: "Drift Detection",
        description: "Detect infrastructure configuration drift post-deployment",
        tool: "Terraform + OPA",
        icon: <FaSyncAlt className="w-6 h-6" />,
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
