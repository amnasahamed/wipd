import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
    try {
        const body = await request.json();
        const { userId, testType, responses } = body;

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Scoring logic for now (could be replaced with real validation)
        const score = Math.floor(Math.random() * 21) + 80; // 80-100
        const passed = score >= 85;

        // Update profile based on test type
        const updateData = {};
        if (testType === 'grammar') {
            updateData.grammarScore = score;
        } else if (testType === 'policy') {
            updateData.policyScore = score;
        }

        await prisma.profile.update({
            where: { userId },
            data: updateData
        });

        // Log the action
        await prisma.auditLog.create({
            data: {
                userId,
                entityType: 'TEST',
                entityId: testType,
                action: 'SUBMIT',
                details: JSON.stringify({ score, passed })
            }
        });

        return NextResponse.json({
            success: true,
            score,
            passed,
            submittedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Test submission error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
