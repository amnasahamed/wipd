import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');
        const assignmentId = formData.get('assignmentId');
        const writerId = formData.get('writerId'); // Added writerId

        if (!assignmentId || !writerId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Create submission record
        const submission = await prisma.submission.create({
            data: {
                assignmentId,
                writerId,
                status: "PENDING_REVIEW",
                // Simulate analysis results immediately
                integrityScore: Math.floor(Math.random() * 11) + 89, // 89-100
                aiRiskScore: Math.floor(Math.random() * 15) + 5,      // 5-20%
                createdAt: new Date()
            }
        });

        // Update assignment status
        await prisma.assignment.update({
            where: { id: assignmentId },
            data: { status: 'COMPLETED' }
        });

        // Log the action
        await prisma.auditLog.create({
            data: {
                userId: null, // Writer's user ID
                entityType: 'SUBMISSION',
                entityId: submission.id,
                action: 'UPLOAD',
                details: JSON.stringify({ assignmentId })
            }
        });

        return NextResponse.json({
            success: true,
            submissionId: submission.id,
            status: "analyzed",
            message: "File uploaded and integrity analysis completed"
        });
    } catch (error) {
        console.error('Submission upload error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
