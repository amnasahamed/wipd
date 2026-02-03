import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/session';

export async function POST(request) {
    try {
        const { user: sessionUser, errorResponse } = await requireAdmin();
        if (errorResponse) return errorResponse;

        const body = await request.json();
        const { writerId, title, description, deadline, category, wordCount, citationStyle, priority } = body;

        if (!writerId || !title || !deadline) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if writer exists
        const profile = await prisma.profile.findUnique({
            where: { id: writerId }
        });

        if (!profile) {
            return NextResponse.json({ error: 'Writer profile not found' }, { status: 404 });
        }

        const parsedWordCount = wordCount ? Number.parseInt(wordCount, 10) : null;
        if (wordCount && (!Number.isFinite(parsedWordCount) || parsedWordCount <= 0)) {
            return NextResponse.json({ error: 'Invalid wordCount' }, { status: 400 });
        }

        // Create assignment
        const assignment = await prisma.assignment.create({
            data: {
                writerId,
                title,
                description,
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
                details: JSON.stringify({ writerId, title })
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
