import { NextResponse } from 'next/server';

export async function POST(request) {
    const body = await request.json();
    const { testType, responses } = body;

    console.log(`Received ${testType} submission:`, responses);

    // Mock scoring logic
    const score = Math.floor(Math.random() * 21) + 80; // 80-100
    const passed = score >= 85;

    return NextResponse.json({
        success: true,
        score,
        passed,
        submittedAt: new Date().toISOString()
    });
}
