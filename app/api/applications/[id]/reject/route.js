import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/session';

export async function POST(request, { params }) {
    try {
        // CRITICAL FIX: Add admin authentication
        const { user: sessionUser, errorResponse } = await requireAdmin();
        if (errorResponse) return errorResponse;

        const { id } = await params;
        const body = await request.json();
        const { reason } = body;

        // Get user and profile first
        const user = await prisma.user.findUnique({
            where: { id },
            include: { profile: true }
        });

        if (!applicant || !applicant.profile) {
            return NextResponse.json(
                { success: false, error: 'Application not found' },
                { status: 404 }
            );
        }

        const previousStatus = user.profile.status;

        // Use transaction to ensure both operations succeed or fail together
        await prisma.$transaction(async (tx) => {
            // Update profile status to SUSPENDED
            await tx.profile.update({
                where: { id: user.profile.id },
                data: { status: 'SUSPENDED' }
            });

            // Create audit log with admin ID
            await tx.auditLog.create({
                data: {
                    userId: sessionUser.id,
                    entityType: 'APPLICATION',
                    entityId: id,
                    action: 'REJECT',
                    details: JSON.stringify({
                        reason,
                        previousStatus,
                        rejectedBy: sessionUser.id
                    })
                }
            });
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
