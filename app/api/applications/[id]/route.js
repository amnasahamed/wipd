import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
    try {
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
                workTypes: user.profile?.workTypes,
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
