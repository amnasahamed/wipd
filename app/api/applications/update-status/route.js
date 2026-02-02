import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
    try {
        const body = await request.json();
        const { userId, status } = body;

        if (!userId || !status) {
            return NextResponse.json({ error: 'User ID and status are required' }, { status: 400 });
        }

        const validStatuses = ['ACTIVE', 'REJECTED', 'SUSPENDED', 'ONBOARDING'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const profile = await prisma.profile.update({
            where: { userId },
            data: { status }
        });

        // Log the action
        await prisma.auditLog.create({
            data: {
                userId: null, // Admin ID
                entityType: 'PROFILE',
                entityId: profile.id,
                action: 'STATUS_CHANGE',
                details: JSON.stringify({ status })
            }
        });

        return NextResponse.json({
            success: true,
            profile: {
                id: profile.id,
                status: profile.status
            }
        });
    } catch (error) {
        console.error('Update status error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
