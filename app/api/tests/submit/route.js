import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireWriter } from '@/lib/auth/session';

export async function POST(request) {
    try {
        const { user: sessionUser, errorResponse } = await requireWriter();
        if (errorResponse) return errorResponse;

        const body = await request.json();
        const { testType } = body;

        const allowedTestTypes = new Set(['grammar', 'policy']);
        if (!testType || !allowedTestTypes.has(testType)) {
            return NextResponse.json({ error: 'Invalid test type' }, { status: 400 });
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
            where: { userId: sessionUser.id },
            data: updateData
        });

        // Log the action
        await prisma.auditLog.create({
            data: {
                userId: sessionUser.id,
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
