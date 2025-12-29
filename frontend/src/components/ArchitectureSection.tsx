"use client";

export default function ArchitectureSection() {
    const layers = [
        {
            title: "User Layer",
            icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
            items: ["HTTPS Traffic", "CloudFront CDN (Optional)", "WAF Protection"],
            color: "devsec",
        },
        {
            title: "Load Balancing",
            icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
            ),
            items: ["Application Load Balancer", "Target Groups", "Health Checks"],
            color: "purple",
        },
        {
            title: "Compute Layer",
            icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
            ),
            items: ["ECS Fargate Frontend", "ECS Fargate Backend", "Auto Scaling"],
            color: "pink",
        },
        {
            title: "Network Layer",
            icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
            ),
            items: ["VPC with Public/Private Subnets", "NAT Gateway", "Security Groups"],
            color: "amber",
        },
    ];

    const securityFeatures = [
        {
            title: "Network Isolation",
            description: "Backend services run in private subnets, accessible only from the frontend security group. No direct internet access to backend containers.",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            ),
        },
        {
            title: "Least Privilege IAM",
            description: "Task execution roles and task roles follow the principle of least privilege, granting only necessary permissions for container operations.",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
            ),
        },
        {
            title: "Encrypted Communications",
            description: "All traffic is encrypted in transit using TLS. Container images are pulled over encrypted connections from GitHub Container Registry.",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
            ),
        },
        {
            title: "Serverless Security",
            description: "AWS Fargate eliminates the need to manage and patch EC2 instances. AWS handles the underlying infrastructure security.",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            ),
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

            {/* Architecture Diagram */}
            <div className="glass-card mb-12">
                <h3 className="subsection-heading text-center mb-8">Infrastructure Layers</h3>

                <div className="relative">
                    {layers.map((layer, index) => (
                        <div key={layer.title} className="relative">
                            {/* Connector Line */}
                            {index < layers.length - 1 && (
                                <div className="absolute left-1/2 top-full h-8 w-0.5 bg-gradient-to-b from-devsec-500 to-transparent -translate-x-1/2 z-0" />
                            )}

                            <div className={`relative z-10 flex flex-col md:flex-row items-center gap-6 p-6 rounded-xl border transition-all duration-300 hover:shadow-lg mb-8 last:mb-0 ${layer.color === 'devsec' ? 'border-devsec-500/30 hover:border-devsec-500/50 bg-devsec-500/5' :
                                    layer.color === 'purple' ? 'border-purple-500/30 hover:border-purple-500/50 bg-purple-500/5' :
                                        layer.color === 'pink' ? 'border-pink-500/30 hover:border-pink-500/50 bg-pink-500/5' :
                                            'border-amber-500/30 hover:border-amber-500/50 bg-amber-500/5'
                                }`}>
                                {/* Icon */}
                                <div className={`p-4 rounded-xl ${layer.color === 'devsec' ? 'bg-devsec-500/20 text-devsec-400' :
                                        layer.color === 'purple' ? 'bg-purple-500/20 text-purple-400' :
                                            layer.color === 'pink' ? 'bg-pink-500/20 text-pink-400' :
                                                'bg-amber-500/20 text-amber-400'
                                    }`}>
                                    {layer.icon}
                                </div>

                                {/* Content */}
                                <div className="flex-1 text-center md:text-left">
                                    <h4 className="text-lg font-semibold text-white mb-2">{layer.title}</h4>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                        {layer.items.map((item) => (
                                            <span
                                                key={item}
                                                className={`px-3 py-1 rounded-full text-sm ${layer.color === 'devsec' ? 'bg-devsec-500/10 text-devsec-300' :
                                                        layer.color === 'purple' ? 'bg-purple-500/10 text-purple-300' :
                                                            layer.color === 'pink' ? 'bg-pink-500/10 text-pink-300' :
                                                                'bg-amber-500/10 text-amber-300'
                                                    }`}
                                            >
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Layer Number */}
                                <div className={`text-4xl font-bold ${layer.color === 'devsec' ? 'text-devsec-500/30' :
                                        layer.color === 'purple' ? 'text-purple-500/30' :
                                            layer.color === 'pink' ? 'text-pink-500/30' :
                                                'text-amber-500/30'
                                    }`}>
                                    0{index + 1}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Security Features Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                {securityFeatures.map((feature) => (
                    <div key={feature.title} className="glass-card group">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-devsec-500/20 text-devsec-400 group-hover:bg-devsec-500/30 transition-colors">
                                {feature.icon}
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-white mb-2">{feature.title}</h4>
                                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* AWS Services Used */}
            <div className="mt-12 glass-card">
                <h3 className="subsection-heading text-center mb-6">AWS Services Utilized</h3>
                <div className="flex flex-wrap justify-center gap-4">
                    {[
                        "Amazon VPC",
                        "Amazon ECS",
                        "AWS Fargate",
                        "Application Load Balancer",
                        "NAT Gateway",
                        "IAM",
                        "CloudWatch",
                        "AWS Secrets Manager",
                    ].map((service) => (
                        <div
                            key={service}
                            className="px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-slate-300 text-sm hover:border-devsec-500/50 hover:text-devsec-300 transition-all cursor-default"
                        >
                            {service}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
