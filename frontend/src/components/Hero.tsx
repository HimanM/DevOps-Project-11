"use client";

import { RiShieldKeyholeLine } from "react-icons/ri";
import { FaDocker } from "react-icons/fa";
import { HiClipboardDocumentCheck } from "react-icons/hi2";
import { BsBricks } from "react-icons/bs";
import { MdApproval } from "react-icons/md";
import { TbCirclesRelation } from "react-icons/tb";

export default function Hero() {
    const features = [
        { icon: RiShieldKeyholeLine, label: "Secret Scanning", color: "text-amber-400" },
        { icon: FaDocker, label: "Container Security", color: "text-blue-400" },
        { icon: HiClipboardDocumentCheck, label: "Policy-as-Code", color: "text-violet-400" },
        { icon: BsBricks, label: "IaC Security", color: "text-orange-400" },
        { icon: MdApproval, label: "Manual Approval", color: "text-emerald-400" },
        { icon: TbCirclesRelation, label: "Drift Detection", color: "text-cyan-400" },
    ];

    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20 pb-16">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-devsec-500/20 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow animation-delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-devsec-600/10 rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-5xl mx-auto text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full glass border border-devsec-500/30 animate-in">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                        <span className="text-sm font-medium text-slate-300">
                            Enterprise-Grade Security Pipeline
                        </span>
                    </div>

                    {/* Project Tag */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 ml-3 rounded-md bg-devsec-600/30 border border-devsec-500/50 animate-in">
                        <span className="text-xs font-mono font-semibold text-devsec-400">
                            DevOps-Project-11
                        </span>
                    </div>

                    {/* Main Heading */}
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 animate-in stagger-1">
                        <span className="gradient-text">DevSecOps</span>
                        <br />
                        <span className="text-slate-100">Pipeline Platform</span>
                    </h1>

                    {/* Description */}
                    <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed animate-in stagger-2">
                        A production-grade demonstration of modern DevSecOps practices featuring
                        CI/CD security, Infrastructure as Code, container security, and Policy-as-Code
                        implementation with enterprise security standards.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in stagger-3">
                        <a href="#pipeline" className="btn-primary flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Explore Pipeline
                        </a>
                        <a href="#architecture" className="btn-secondary flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            View Architecture
                        </a>
                    </div>

                    {/* Feature Pills */}
                    <div className="flex flex-wrap items-center justify-center gap-3 mt-16 animate-in stagger-4">
                        {features.map((feature) => {
                            const IconComponent = feature.icon;
                            return (
                                <div
                                    key={feature.label}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-slate-300 hover:border-devsec-500/50 transition-all cursor-default"
                                >
                                    <IconComponent className={`w-4 h-4 ${feature.color}`} />
                                    <span>{feature.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Scroll Indicator - Now outside container and positioned at bottom of section */}
            <div className="mt-12 animate-bounce">
                <svg
                    className="w-6 h-6 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                </svg>
            </div>
        </section>
    );
}
