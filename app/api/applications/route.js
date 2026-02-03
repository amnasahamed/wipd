import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';


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
        // Include 'ONBOARDING' status OR missing profiles (to catch registration errors)
        const applications = allWriters.filter(app => !app.profile || app.profile?.status === 'ONBOARDING');


        return NextResponse.json({
            success: true,
            applications: applications.map(app => ({
                id: app.id,
                fullName: app.profile?.fullName || 'New Applicant',
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
