import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin, requireRole } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
    try {
        const { user: sessionUser, errorResponse } = await requireRole(['ADMIN', 'WRITER']);
        if (errorResponse) return errorResponse;

        const { id } = await params;

        const submission = await prisma.submission.findFirst({
            where: sessionUser.role === 'WRITER'
                ? { id, writer: { userId: sessionUser.id } }
                : { id },
            include: {
                writer: {
                    select: {
                        id: true,
                        fullName: true,
                        status: true
                    }
                },
                assignment: {
                    select: {
                        id: true,
                        title: true,
                        description: true
                    }
                },
                analysisResults: true
            }
        });

        if (!submission) {
            return NextResponse.json(
                { success: false, error: 'Submission not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            submission: {
                id: submission.id,
                content: submission.content,
                fileUrl: submission.fileUrl,
                integrityScore: submission.integrityScore,
                aiRiskScore: submission.aiRiskScore,
                status: submission.status,
                createdAt: submission.createdAt,
                updatedAt: submission.updatedAt,
                writer: submission.writer,
                assignment: submission.assignment,
                analysisResults: submission.analysisResults
            }
        });
    } catch (error) {
        console.error('Error fetching submission:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch submission' },
            { status: 500 }
        );
    }
}

export async function PATCH(request, { params }) {
    try {
        const { user: sessionUser, errorResponse } = await requireAdmin();
        if (errorResponse) return errorResponse;

        const { id } = await params;
        const body = await request.json();
        const { status, notes } = body || {};

        const allowedStatuses = ['PENDING_REVIEW', 'APPROVED', 'REJECTED', 'NEEDS_REWRITE'];
        if (!status || !allowedStatuses.includes(status)) {
            return NextResponse.json(
                { success: false, error: 'Invalid status' },
                { status: 400 }
            );
        }

        const normalizedNotes = typeof notes === 'string' ? notes.trim() : '';
        if (normalizedNotes.length > 2000) {
            return NextResponse.json(
                { success: false, error: 'Notes are too long (max 2000 characters)' },
                { status: 400 }
            );
        }

        const statusesRequiringNotes = new Set(['REJECTED', 'NEEDS_REWRITE']);
        if (statusesRequiringNotes.has(status) && normalizedNotes.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Notes are required for this status' },
                { status: 400 }
            );
        }

        const updated = await prisma.$transaction(async (tx) => {
            const existing = await tx.submission.findUnique({
                where: { id },
                select: { id: true, status: true, assignmentId: true }
            });
            if (!existing) return null;

            const submission = await tx.submission.update({
                where: { id },
                data: { status }
            });

            const assignmentStatus =
                status === 'APPROVED'
                    ? 'COMPLETED'
                    : 'IN_PROGRESS';

            await tx.assignment.update({
                where: { id: existing.assignmentId },
                data: { status: assignmentStatus }
            });

            await tx.auditLog.create({
                data: {
                    userId: sessionUser.id,
                    entityType: 'SUBMISSION',
                    entityId: submission.id,
                    action: 'STATUS_CHANGE',
                    details: JSON.stringify({
                        from: existing.status,
                        to: status,
                        notes: normalizedNotes.length > 0 ? normalizedNotes : undefined
                    })
                }
            });

            return submission;
        });

        if (!updated) {
            return NextResponse.json(
                { success: false, error: 'Submission not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            submission: {
                id: updated.id,
                status: updated.status,
                updatedAt: updated.updatedAt
            }
        });

    } catch (error) {
        console.error('Error updating submission:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update submission' },
            { status: 500 }
        );
    }
}
