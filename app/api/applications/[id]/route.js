import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
    try {
        const { errorResponse } = await requireAdmin();
        if (errorResponse) return errorResponse;

        const { id } = await params;

        // Find user and profile by user ID
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                profile: true
            }
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Application not found' },
                { status: 404 }
            );
        }

        // Parse workTypes safely
        let workTypes = [];
        if (user.profile?.workTypes) {
            try {
                workTypes = JSON.parse(user.profile.workTypes);
            } catch {
                workTypes = [];
            }
        }

        return NextResponse.json({
            success: true,
            application: {
                id: user.id,
                email: user.email,
                fullName: user.profile?.fullName || 'Unknown',
                phone: user.profile?.phone,
                education: user.profile?.education,
                experience: user.profile?.experience,
                bio: user.profile?.bio,
                timezone: user.profile?.timezone,
                workTypes,
                grammarScore: user.profile?.grammarScore,
                policyScore: user.profile?.policyScore,
                status: user.profile?.status || 'ONBOARDING',
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        console.error('Error fetching application:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch application' },
            { status: 500 }
        );
    }
}
