import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "DevSecOps Pipeline Platform",
    description: "Enterprise-grade DevSecOps demonstration showcasing CI/CD security, Infrastructure as Code, container security, and Policy-as-Code implementation.",
    keywords: ["DevSecOps", "CI/CD", "Security", "Terraform", "AWS", "Containers", "OPA"],
    authors: [{ name: "DevSecOps Team" }],
    robots: "index, follow",
    openGraph: {
        title: "DevSecOps Pipeline Platform",
        description: "Production-grade DevSecOps demonstration with enterprise security standards",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="scroll-smooth">
            <body className="mesh-bg grid-pattern antialiased">
                {children}
            </body>
        </html>
    );
}
