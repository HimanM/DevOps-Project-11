"use client";

import {
    FaUserShield,
    FaNetworkWired,
    FaServer,
    FaGlobe,
    FaLock,
    FaUserSecret,
    FaShieldAlt,
    FaCloud
} from "react-icons/fa";

export default function ArchitectureSection() {
    const layers = [
        {
            title: "User Layer",
            icon: <FaUserShield className="w-6 h-6" />,
            items: ["HTTPS Traffic", "CloudFront CDN (Optional)", "WAF Protection"],
            color: "cyan",
            gradient: "from-cyan-500/20 to-cyan-500/5",
            border: "border-cyan-500/30",
            text: "text-cyan-400",
            bgIcon: "bg-cyan-500/20",
        },
        {
            title: "Load Balancing",
            icon: <FaNetworkWired className="w-6 h-6" />,
            items: ["Application Load Balancer", "Target Groups", "Health Checks"],
            color: "purple",
            gradient: "from-purple-500/20 to-purple-500/5",
            border: "border-purple-500/30",
            text: "text-purple-400",
            bgIcon: "bg-purple-500/20",
        },
        {
            title: "Compute Layer",
            icon: <FaServer className="w-6 h-6" />,
            items: ["ECS Fargate Frontend", "ECS Fargate Backend", "Auto Scaling"],
            color: "pink",
            gradient: "from-pink-500/20 to-pink-500/5",
            border: "border-pink-500/30",
            text: "text-pink-400",
            bgIcon: "bg-pink-500/20",
        },
        {
            title: "Network Layer",
            icon: <FaGlobe className="w-6 h-6" />,
            items: ["VPC with Public/Private Subnets", "NAT Gateway", "Security Groups"],
            color: "amber",
            gradient: "from-amber-500/20 to-amber-500/5",
            border: "border-amber-500/30",
            text: "text-amber-400",
            bgIcon: "bg-amber-500/20",
        },
    ];

    const securityFeatures = [
        {
            title: "Network Isolation",
            description: "Backend services run in private subnets, accessible only from the frontend security group.",
            icon: <FaLock className="w-5 h-5" />,
        },
        {
            title: "Least Privilege IAM",
            description: "Task roles follow strict least privilege principles, granting only necessary AWS permissions.",
            icon: <FaUserSecret className="w-5 h-5" />,
        },
        {
            title: "Encrypted Communications",
            description: "All traffic encrypted in transit via TLS. Images scanned and pulled securely from GHCR.",
            icon: <FaShieldAlt className="w-5 h-5" />,
        },
        {
            title: "Serverless Security",
            description: "AWS Fargate manages underlying infrastructure security, reducing the attack surface.",
            icon: <FaCloud className="w-5 h-5" />,
        },
    ];

    return (
        <section id="architecture" className="scroll-mt-24">
            <div className="text-center mb-12">
                <h2 className="section-heading">Architecture Overview</h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                    A multi-tier architecture designed for security, scalability, and operational excellence
                    following AWS Well-Architected Framework principles.
                </p>
            </div>

            {/* Infrastructure Layers */}
            <div className="max-w-5xl mx-auto mb-16 relative">
                {/* Connecting Line Background */}
                <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-gradient-to-b from-cyan-500/50 via-purple-500/50 to-amber-500/50 hidden md:block" />

                <div className="space-y-6">
                    {layers.map((layer, index) => (
                        <div
                            key={layer.title}
                            className={`relative group rounded-2xl border ${layer.border} bg-slate-900/50 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:bg-slate-800/50`}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-r ${layer.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                            <div className="relative p-6 flex flex-col md:flex-row items-center gap-6">
                                {/* Icon */}
                                <div className={`relative z-10 flex-shrink-0 w-16 h-16 rounded-2xl ${layer.bgIcon} ${layer.text} flex items-center justify-center shadow-lg`}>
                                    {layer.icon}
                                </div>

                                {/* Content */}
                                <div className="flex-grow text-center md:text-left">
                                    <h3 className="text-xl font-bold text-white mb-3">{layer.title}</h3>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                        {layer.items.map((item) => (
                                            <span
                                                key={item}
                                                className={`px-3 py-1 text-xs font-medium rounded-full border border-slate-700/50 bg-slate-800/50 text-slate-300 group-hover:border-${layer.color}-500/30 transition-colors`}
                                            >
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Number */}
                                <div className="flex-shrink-0">
                                    <span className={`text-4xl font-bold ${layer.text} opacity-20 font-mono`}>
                                        0{index + 1}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Security Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {securityFeatures.map((feature) => (
                    <div key={feature.title} className="glass-card p-6 hover:bg-slate-800/50 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-devsec-500/10 text-devsec-400 flex items-center justify-center mb-4">
                            {feature.icon}
                        </div>
                        <h4 className="text-lg font-semibold text-white mb-2">{feature.title}</h4>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            {feature.description}
                        </p>
                    </div>
                ))}
            </div>

            {/* AWS Services Used */}
            <div className="mt-12 text-center">
                <p className="text-sm text-slate-500 mb-4 uppercase tracking-wider font-semibold">Powered By AWS Services</p>
                <div className="flex flex-wrap justify-center gap-3">
                    {[
                        "Amazon VPC",
                        "Amazon ECS",
                        "AWS Fargate",
                        "Application Load Balancer",
                        "NAT Gateway",
                        "IAM",
                        "CloudWatch",
                        "S3",
                    ].map((service) => (
                        <div
                            key={service}
                            className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 text-sm hover:text-white hover:border-slate-700 transition-colors cursor-default"
                        >
                            {service}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
