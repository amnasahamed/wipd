import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth/session';

export async function GET(request, { params }) {
    try {
        const { user: sessionUser, errorResponse } = await requireRole(['ADMIN', 'WRITER']);
        if (errorResponse) return errorResponse;

        const { id } = await params;

        const assignment = await prisma.assignment.findFirst({
            where: sessionUser.role === 'WRITER'
                ? { id, writer: { userId: sessionUser.id } }
                : { id },
            include: {
                writer: {
                    select: {
                        id: true,
                        fullName: true
                    }
                },
                submissions: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    select: {
                        id: true,
                        status: true,
                        createdAt: true,
                        integrityScore: true,
                        aiRiskScore: true
                    }
                }
            }
        });

        if (!assignment) {
            return NextResponse.json(
                { success: false, error: 'Assignment not found' },
                { status: 404 }
            );
        }

        const latestSubmission = assignment.submissions[0] || null;

        const latestDecisionLog = latestSubmission ? await prisma.auditLog.findFirst({
            where: {
                entityType: 'SUBMISSION',
                action: 'STATUS_CHANGE',
                entityId: latestSubmission.id
            },
            orderBy: { createdAt: 'desc' }
        }) : null;

        let latestSubmissionDecision = null;
        if (latestDecisionLog) {
            try {
                const details = latestDecisionLog.details ? JSON.parse(latestDecisionLog.details) : null;
                latestSubmissionDecision = {
                    at: latestDecisionLog.createdAt,
                    from: details?.from,
                    to: details?.to,
                    notes: details?.notes
                };
            } catch {
                latestSubmissionDecision = { at: latestDecisionLog.createdAt };
            }
        }

        return NextResponse.json({
            success: true,
            assignment: {
                id: assignment.id,
                title: assignment.title,
                description: assignment.description,
                deadline: assignment.deadline,
                status: assignment.status,
                category: assignment.category || (assignment.title.toLowerCase().includes('technical') ? 'technical' : 'academic'),
                wordCount: assignment.wordCount || 0,
                citationStyle: assignment.citationStyle || null,
                priority: assignment.priority || 'normal',
                notes: assignment.description || '',
                writer: assignment.writer,
                latestSubmission,
                latestSubmissionDecision
            }
        });
    } catch (error) {
        console.error('Error fetching assignment:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch assignment' },
            { status: 500 }
        );
    }
}
