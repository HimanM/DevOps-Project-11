import { NextRequest, NextResponse } from 'next/server';

// This API route proxies requests to the backend service
// The BACKEND_URL env var is set by ECS task definition at runtime
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint') || 'health';

    try {
        const response = await fetch(`${BACKEND_URL}/${endpoint}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            {
                error: 'Backend connection failed',
                message: error instanceof Error ? error.message : 'Unknown error',
                backendUrl: BACKEND_URL
            },
            { status: 503 }
        );
    }
}
