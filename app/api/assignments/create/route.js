import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
    try {
        const body = await request.json();
        const { writerId, title, description, deadline } = body;

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

        // Create assignment
        const assignment = await prisma.assignment.create({
            data: {
                writerId,
                title,
                description,
                deadline: new Date(deadline),
                status: 'PENDING'
            }
        });

        // Log the action
        await prisma.auditLog.create({
            data: {
                userId: null, // Should be admin's user ID
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
