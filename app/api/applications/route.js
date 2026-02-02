import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const allWriters = await prisma.user.findMany({
            where: {
                role: 'WRITER'
            },
            include: { profile: true },
            orderBy: { createdAt: 'desc' }
        });

        // Filter in memory to be safe against potential Prisma relation filter edge cases
        const applications = allWriters.filter(app => app.profile?.status === 'ONBOARDING');

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
