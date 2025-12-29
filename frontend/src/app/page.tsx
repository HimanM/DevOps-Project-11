"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import BackendStatus from "@/components/BackendStatus";
import ArchitectureSection from "@/components/ArchitectureSection";
import PipelineSection from "@/components/PipelineSection";
import SecuritySection from "@/components/SecuritySection";
import InfrastructureSection from "@/components/InfrastructureSection";
import PolicySection from "@/components/PolicySection";
import Footer from "@/components/Footer";

export default function Home() {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    return (
        <main className={`min-h-screen transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
            <Header />
            <Hero />

            <div className="container mx-auto px-4 py-12 space-y-24">
                <BackendStatus />
                <ArchitectureSection />
                <PipelineSection />
                <SecuritySection />
                <InfrastructureSection />
                <PolicySection />
            </div>

            <Footer />
        </main>
    );
}
