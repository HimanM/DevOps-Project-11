"use client";

import { useState, useEffect, useCallback } from "react";

interface BackendResponse {
    message: string;
    timestamp: string;
    service: string;
    version: string;
    environment: string;
    securityHeaders: string;
    containerInfo: {
        hostname: string;
        platform: string;
        nodeVersion: string;
    };
}

interface HealthResponse {
    status: string;
    timestamp: string;
    service: string;
    version: string;
    uptime: number;
    environment: string;
    checks: {
        memory: string;
        uptime: string;
    };
}

type ConnectionStatus = "idle" | "connecting" | "connected" | "error";

export default function BackendStatus() {
    const [status, setStatus] = useState<ConnectionStatus>("idle");
    const [backendData, setBackendData] = useState<BackendResponse | null>(null);
    const [healthData, setHealthData] = useState<HealthResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [lastChecked, setLastChecked] = useState<Date | null>(null);

    // For production: use the internal ALB via server-side API route
    // For development: use localhost directly
    const getBackendUrl = () => {
        if (typeof window === 'undefined') return 'http://localhost:3001';

        // Check if we're in production (AWS ECS)
        if (window.location.hostname.includes('elb.amazonaws.com') ||
            window.location.hostname.includes('amazonaws.com') ||
            process.env.NODE_ENV === 'production') {
            // In production, use relative path to call our Next.js API proxy
            return '/api/backend';
        }

        // Development - call backend directly
        return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    };

    const backendUrl = getBackendUrl();

    const checkBackend = useCallback(async () => {
        setStatus("connecting");
        setError(null);

        try {
            const isProduction = typeof window !== 'undefined' &&
                (window.location.hostname.includes('amazonaws.com') ||
                    window.location.hostname.includes('elb.amazonaws.com'));

            // Determine the correct URL format
            const healthUrl = isProduction
                ? '/api/backend?endpoint=health'
                : `${backendUrl}/health`;

            const helloUrl = isProduction
                ? '/api/backend?endpoint=hello'
                : `${backendUrl}/hello`;

            // Check health endpoint first
            const healthRes = await fetch(healthUrl, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                signal: AbortSignal.timeout(5000),
            });

            if (!healthRes.ok) {
                throw new Error(`Health check failed: ${healthRes.status}`);
            }

            const health: HealthResponse = await healthRes.json();
            setHealthData(health);

            // Then check hello endpoint
            const helloRes = await fetch(helloUrl, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                signal: AbortSignal.timeout(5000),
            });

            if (!helloRes.ok) {
                throw new Error(`Hello endpoint failed: ${helloRes.status}`);
            }

            const data: BackendResponse = await helloRes.json();
            setBackendData(data);
            setStatus("connected");
            setLastChecked(new Date());
        } catch (err) {
            setStatus("error");
            setError(err instanceof Error ? err.message : "Unknown error occurred");
            setLastChecked(new Date());
        }
    }, [backendUrl]);

    useEffect(() => {
        // Auto-check on mount
        checkBackend();
    }, [checkBackend]);

    const getStatusColor = () => {
        switch (status) {
            case "connected":
                return "from-emerald-500 to-green-600";
            case "connecting":
                return "from-amber-500 to-yellow-600";
            case "error":
                return "from-red-500 to-rose-600";
            default:
                return "from-slate-500 to-slate-600";
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case "connected":
                return (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                );
            case "connecting":
                return (
                    <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                );
            case "error":
                return (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

    return (
        <section id="backend-status" className="scroll-mt-24">
            <div className="glass-card max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h2 className="section-heading mb-2">Backend Connectivity</h2>
                        <p className="text-slate-400">
                            Live demonstration of secure frontend-backend communication
                        </p>
                    </div>
                    <button
                        onClick={checkBackend}
                        disabled={status === "connecting"}
                        className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {status === "connecting" ? (
                            <>
                                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Connecting...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Test Connection
                            </>
                        )}
                    </button>
                </div>

                {/* Status Indicator */}
                <div className={`rounded-xl p-6 bg-gradient-to-r ${getStatusColor()} bg-opacity-20 border border-current/20 mb-6`}>
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full bg-gradient-to-r ${getStatusColor()} text-white shadow-lg`}>
                            {getStatusIcon()}
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-white capitalize">
                                {status === "idle" ? "Not Checked" : status}
                            </h3>
                            <p className="text-sm text-slate-300">
                                {status === "connected" && "Successfully communicating with backend service"}
                                {status === "connecting" && "Establishing secure connection..."}
                                {status === "error" && error}
                                {status === "idle" && "Click the button to test connectivity"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Response Data */}
                {status === "connected" && backendData && (
                    <div className="space-y-6">
                        {/* Backend Message */}
                        <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                            <div className="flex items-start gap-4">
                                <div className="p-2 rounded-lg bg-emerald-500/20">
                                    <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs text-emerald-400 uppercase tracking-wider mb-1">Message from Backend</p>
                                    <p className="text-2xl font-bold text-white">{backendData.message}</p>
                                </div>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid md:grid-cols-2 gap-4">
                            {/* Service Info */}
                            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                                <h4 className="text-sm font-medium text-slate-400 mb-3">Service Information</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Service</span>
                                        <span className="text-slate-200 font-mono">{backendData.service}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Version</span>
                                        <span className="text-slate-200 font-mono">{backendData.version}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Environment</span>
                                        <span className={`font-mono ${backendData.environment === 'production' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                            {backendData.environment}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Security Headers</span>
                                        <span className="text-emerald-400 font-mono">{backendData.securityHeaders}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Container Info */}
                            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                                <h4 className="text-sm font-medium text-slate-400 mb-3">Container Information</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Hostname</span>
                                        <span className="text-slate-200 font-mono text-sm truncate max-w-[150px]">
                                            {backendData.containerInfo.hostname}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Platform</span>
                                        <span className="text-slate-200 font-mono">{backendData.containerInfo.platform}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Node Version</span>
                                        <span className="text-slate-200 font-mono">{backendData.containerInfo.nodeVersion}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Health Check */}
                        {healthData && (
                            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                                <h4 className="text-sm font-medium text-slate-400 mb-3">Health Check Status</h4>
                                <div className="flex flex-wrap gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${healthData.status === 'healthy' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                        <span className="text-slate-300">Status: <span className="text-white font-medium capitalize">{healthData.status}</span></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${healthData.checks.memory === 'ok' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                        <span className="text-slate-300">Memory: <span className="text-white font-medium">{healthData.checks.memory}</span></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${healthData.checks.uptime === 'ok' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                        <span className="text-slate-300">Uptime: <span className="text-white font-medium">{Math.floor(healthData.uptime)}s</span></span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Timestamp */}
                        {lastChecked && (
                            <p className="text-sm text-slate-500 text-center">
                                Last checked: {lastChecked.toLocaleTimeString()}
                            </p>
                        )}
                    </div>
                )}

                {/* Error State Details */}
                {status === "error" && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                        <h4 className="text-sm font-medium text-red-400 mb-2">Connection Failed</h4>
                        <p className="text-slate-300 text-sm mb-4">
                            The frontend could not establish a connection to the backend service. This is expected if:
                        </p>
                        <ul className="text-sm text-slate-400 space-y-1 list-disc list-inside">
                            <li>The backend container is not running</li>
                            <li>The infrastructure has not been deployed</li>
                            <li>You are viewing this locally without the backend started</li>
                        </ul>
                        <p className="text-slate-300 text-sm mt-4">
                            Backend URL: <code className="text-devsec-400 bg-slate-800 px-2 py-1 rounded">{backendUrl}</code>
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}
