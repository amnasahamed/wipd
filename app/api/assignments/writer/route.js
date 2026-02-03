import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const writerId = searchParams.get('writerId');

        if (!writerId) {
            return NextResponse.json({ error: 'Writer ID is required' }, { status: 400 });
        }

        // The writerId might be a User ID or Profile ID. Check both.
        let profileId = writerId;

        // Try to find user by this ID and get their profile
        const user = await prisma.user.findUnique({
            where: { id: writerId },
            include: { profile: true }
        });

        if (user && user.profile) {
            profileId = user.profile.id;
        }

        const assignments = await prisma.assignment.findMany({
            where: { writerId: profileId },
            include: {
                submissions: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { deadline: 'asc' }
        });

        return NextResponse.json({
            success: true,
            assignments: assignments.map(a => ({
                id: a.id,
                title: a.title,
                description: a.description,
                deadline: a.deadline,
                status: a.status,
                category: a.title.toLowerCase().includes('technical') ? 'technical' : 'academic',
                wordCount: 0, // Not stored in schema yet
                priority: 'normal',
                hasSubmission: a.submissions.length > 0,
                latestSubmission: a.submissions[0] || null
            }))
        });
    } catch (error) {
        console.error('Fetch writer assignments error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
