import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { reason } = body;

        // Update profile status to SUSPENDED (or create a REJECTED status)
        const user = await prisma.user.findUnique({
            where: { id },
            include: { profile: true }
        });

        if (!user || !user.profile) {
            return NextResponse.json(
                { success: false, error: 'Application not found' },
                { status: 404 }
            );
        }

        await prisma.profile.update({
            where: { id: user.profile.id },
            data: { status: 'SUSPENDED' }
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                userId: id,
                entityType: 'APPLICATION',
                entityId: id,
                action: 'REJECT',
                details: JSON.stringify({ reason, previousStatus: user.profile.status })
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error rejecting application:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to reject application' },
            { status: 500 }
        );
    }
}
