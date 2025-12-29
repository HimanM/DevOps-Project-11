import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-inter",
});

export const viewport: Viewport = {
    themeColor: "#0a4d68",
    width: "device-width",
    initialScale: 1,
};

export const metadata: Metadata = {
    title: "DevSecOps Pipeline Platform | DevOps-Project-11",
    description: "Enterprise-grade DevSecOps demonstration showcasing CI/CD security, Infrastructure as Code, container security, and Policy-as-Code implementation with AWS, Terraform, and GitHub Actions.",
    keywords: ["DevSecOps", "CI/CD", "Security", "Terraform", "AWS", "Containers", "OPA", "GitHub Actions", "Infrastructure as Code", "Policy-as-Code", "DevOps-Project-11"],
    authors: [{ name: "Himan Manduja" }],
    creator: "Himan Manduja",
    robots: "index, follow",
    icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon.ico",
        apple: "/favicon.ico",
    },
    openGraph: {
        title: "DevSecOps Pipeline Platform | DevOps-Project-11",
        description: "Production-grade DevSecOps demonstration with enterprise security standards featuring CI/CD security, IaC, and Policy-as-Code",
        type: "website",
        siteName: "DevOps-Project-11",
    },
    twitter: {
        card: "summary_large_image",
        title: "DevSecOps Pipeline Platform | DevOps-Project-11",
        description: "Enterprise-grade DevSecOps demonstration with CI/CD security and Policy-as-Code",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`scroll-smooth ${inter.variable}`}>
            <body className="mesh-bg grid-pattern antialiased font-sans">
                {children}
            </body>
        </html>
    );
}

