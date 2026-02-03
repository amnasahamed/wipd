import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const { errorResponse } = await requireAdmin();
        if (errorResponse) return errorResponse;

        const { searchParams } = new URL(request.url);
        const includeSamples = searchParams.get('includeSamples') === 'true';

        const assignments = await prisma.assignment.findMany({
            where: includeSamples ? {} : { NOT: { title: { startsWith: 'Onboarding Sample' } } },
            include: {
                writer: true,
                submissions: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({
            success: true,
            assignments: assignments.map(a => ({
                id: a.id,
                title: a.title,
                writerName: a.writer?.fullName || 'Unknown Writer',
                deadline: a.deadline,
                status: a.status,
                category: a.category,
                wordCount: a.wordCount,
                citationStyle: a.citationStyle,
                priority: a.priority,
                lastSubmission: a.submissions[0] || null
            }))
        });
    } catch (error) {
        console.error('Fetch all assignments error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { user: sessionUser, errorResponse } = await requireAdmin();
        if (errorResponse) return errorResponse;

        const body = await request.json();
        const { writerId, title, brief, deadline, category, wordCount, citationStyle, priority } = body;

        if (!writerId || !title || !deadline) {
            return NextResponse.json({ error: 'Missing required fields: writerId, title, deadline' }, { status: 400 });
        }

        // The writerId from form is the User ID, we need to find their Profile
        const user = await prisma.user.findUnique({
            where: { id: writerId },
            include: { profile: true }
        });

        if (!user || !user.profile) {
            return NextResponse.json({ error: 'Writer not found' }, { status: 404 });
        }

        const parsedWordCount = wordCount ? Number.parseInt(wordCount, 10) : null;
        if (wordCount && (!Number.isFinite(parsedWordCount) || parsedWordCount <= 0)) {
            return NextResponse.json({ error: 'Invalid wordCount' }, { status: 400 });
        }

        // Create assignment linked to the writer's Profile
        const assignment = await prisma.assignment.create({
            data: {
                writerId: user.profile.id,
                title,
                description: brief || '',
                category: category || null,
                wordCount: parsedWordCount,
                citationStyle: citationStyle || null,
                priority: priority || 'normal',
                deadline: new Date(deadline),
                status: 'PENDING'
            }
        });

        // Log the action
        await prisma.auditLog.create({
            data: {
                userId: sessionUser.id,
                entityType: 'ASSIGNMENT',
                entityId: assignment.id,
                action: 'CREATE',
                details: JSON.stringify({
                    writerId: user.profile.id,
                    title,
                    category,
                    wordCount: parsedWordCount,
                    priority
                })
            }
        });

        return NextResponse.json({
            success: true,
            assignment: {
                id: assignment.id,
                title: assignment.title,
                status: assignment.status
            }
        });
    } catch (error) {
        console.error('Create assignment error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
