import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request, { params }) {
    try {
        const { id } = await params;

        // Update profile status to ACTIVE
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
            data: { status: 'ACTIVE' }
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                userId: id,
                entityType: 'APPLICATION',
                entityId: id,
                action: 'APPROVE',
                details: JSON.stringify({ previousStatus: user.profile.status })
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error approving application:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to approve application' },
            { status: 500 }
        );
    }
}
