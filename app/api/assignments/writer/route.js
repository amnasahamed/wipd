import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const { user: sessionUser, errorResponse } = await requireRole(['ADMIN', 'WRITER']);
        if (errorResponse) return errorResponse;

        const { searchParams } = new URL(request.url);
        const writerIdFromQuery = searchParams.get('writerId');
        const includeSamples = searchParams.get('includeSamples') === 'true';

        const writerId = sessionUser.role === 'WRITER' ? sessionUser.id : writerIdFromQuery;

        if (!writerId) {
            return NextResponse.json({ error: 'Writer ID is required' }, { status: 400 });
        }

        // The writerId might be a User ID or Profile ID. Check both.
        let profileId = writerId;

        // Try to find user by this ID and get their profile
        const user = await prisma.user.findUnique({
            where: { id: writerId },
            include: { profile: true }
        });

        if (user && user.profile) {
            profileId = user.profile.id;
        }

        const assignments = await prisma.assignment.findMany({
            where: {
                writerId: profileId,
                ...(includeSamples ? {} : { NOT: { title: { startsWith: 'Onboarding Sample' } } })
            },
            include: {
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
            },
            orderBy: { deadline: 'asc' }
        });

        const latestSubmissionIds = assignments
            .map(a => a.submissions[0]?.id)
            .filter(Boolean);

        const decisionLogs = latestSubmissionIds.length > 0 ? await prisma.auditLog.findMany({
            where: {
                entityType: 'SUBMISSION',
                action: 'STATUS_CHANGE',
                entityId: { in: latestSubmissionIds }
            },
            orderBy: { createdAt: 'desc' }
        }) : [];

        const decisionBySubmissionId = new Map();
        for (const log of decisionLogs) {
            if (decisionBySubmissionId.has(log.entityId)) continue;
            let details = null;
            try {
                details = log.details ? JSON.parse(log.details) : null;
            } catch {
                details = null;
            }
            decisionBySubmissionId.set(log.entityId, {
                at: log.createdAt,
                from: details?.from,
                to: details?.to,
                notes: details?.notes
            });
        }

        return NextResponse.json({
            success: true,
            assignments: assignments.map(a => ({
                id: a.id,
                title: a.title,
                description: a.description,
                deadline: a.deadline,
                status: a.status,
                category: a.category || (a.title.toLowerCase().includes('technical') ? 'technical' : 'academic'),
                wordCount: a.wordCount || 0,
                citationStyle: a.citationStyle || null,
                priority: a.priority || 'normal',
                hasSubmission: a.submissions.length > 0,
                latestSubmission: a.submissions[0] || null,
                latestSubmissionDecision: a.submissions[0] ? (decisionBySubmissionId.get(a.submissions[0].id) || null) : null
            }))
        });
    } catch (error) {
        console.error('Fetch writer assignments error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
