import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        status: 'healthy',
        version: '0.1.0-foundation',
        timestamp: new Date().toISOString(),
        phase: 'Phase 1: Foundation Complete',
    });
}
