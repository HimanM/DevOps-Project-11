"use client";

export default function Footer() {
    return (
        <footer className="border-t border-slate-700/50 mt-24">
            <div className="container mx-auto px-4 py-12">
                <div className="grid md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-devsec-500 to-purple-600 flex items-center justify-center">
                                <svg
                                    className="w-6 h-6 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <span className="text-lg font-bold gradient-text">DevSecOps</span>
                                <span className="text-sm text-slate-400 block -mt-1">Pipeline Platform</span>
                            </div>
                        </div>
                        <p className="text-slate-400 text-sm max-w-md mb-6">
                            A production-grade demonstration of modern DevSecOps practices featuring
                            enterprise security standards, automated compliance, and infrastructure as code.
                        </p>
                        <div className="flex gap-4">
                            <a
                                href="https://github.com/himanm/DevOps-Project-11"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors text-slate-400 hover:text-white"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path
                                        fillRule="evenodd"
                                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Documentation</h4>
                        <ul className="space-y-2">
                            {[
                                { label: "Architecture", href: "#architecture" },
                                { label: "Pipeline", href: "#pipeline" },
                                { label: "Security Controls", href: "#security" },
                                { label: "Infrastructure", href: "#infrastructure" },
                                { label: "Policies", href: "#policies" },
                            ].map((link) => (
                                <li key={link.href}>
                                    <a
                                        href={link.href}
                                        className="text-slate-400 hover:text-white text-sm transition-colors"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Technologies */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Technologies</h4>
                        <ul className="space-y-2">
                            {[
                                "AWS ECS Fargate",
                                "Terraform",
                                "GitHub Actions",
                                "OPA / Conftest",
                                "Trivy",
                                "Checkov",
                                "Gitleaks",
                            ].map((tech) => (
                                <li key={tech} className="text-slate-400 text-sm">
                                    {tech}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-slate-700/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-500 text-sm">
                        DevSecOps Pipeline Platform - A Learning and Demonstration Project
                    </p>
                    <p className="text-slate-500 text-sm">
                        Built with Next.js, Tailwind CSS, and modern DevSecOps practices
                    </p>
                </div>
            </div>
        </footer>
    );
}
