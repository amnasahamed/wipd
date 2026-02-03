import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const assignments = await prisma.assignment.findMany({
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

        // Create assignment linked to the writer's Profile
        const assignment = await prisma.assignment.create({
            data: {
                writerId: user.profile.id,
                title,
                description: brief || '',
                deadline: new Date(deadline),
                status: 'PENDING'
            }
        });

        // Log the action
        await prisma.auditLog.create({
            data: {
                userId: null, // Should be admin's user ID from session
                entityType: 'ASSIGNMENT',
                entityId: assignment.id,
                action: 'CREATE',
                details: JSON.stringify({
                    writerId: user.profile.id,
                    title,
                    category,
                    wordCount,
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
