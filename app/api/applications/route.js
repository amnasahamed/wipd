import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const applications = await prisma.user.findMany({
            where: {
                role: 'WRITER',
                profile: {
                    status: 'ONBOARDING'
                }
            },
            include: { profile: true },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({
            success: true,
            applications: applications.map(app => ({
                id: app.id,
                name: app.profile?.fullName || 'New Applicant',
                email: app.email,
                appliedAt: app.createdAt,
                status: app.profile?.status || 'pending',
                grammarScore: app.profile?.grammarScore,
                policyScore: app.profile?.policyScore
            }))
        });
    } catch (error) {
        console.error('Fetch applications error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
