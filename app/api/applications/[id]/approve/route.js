import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/session';

export async function POST(request, { params }) {
    try {
        const { user: admin, errorResponse } = await requireAdmin();
        if (errorResponse) return errorResponse;

        const { id } = await params;

        // Update profile status to ACTIVE
        const applicant = await prisma.user.findUnique({
            where: { id },
            include: { profile: true }
        });

        if (!applicant || !applicant.profile) {
            return NextResponse.json(
                { success: false, error: 'Application not found' },
                { status: 404 }
            );
        }

        await prisma.profile.update({
            where: { id: applicant.profile.id },
            data: { status: 'ACTIVE' }
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                userId: admin.id,
                entityType: 'APPLICATION',
                entityId: id,
                action: 'APPROVE',
                details: JSON.stringify({ previousStatus: applicant.profile.status })
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
