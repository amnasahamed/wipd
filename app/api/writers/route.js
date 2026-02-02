import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const writers = await prisma.user.findMany({
            where: { role: 'WRITER' },
            include: { profile: true }
        });

        return NextResponse.json({
            success: true,
            writers: writers.map(w => ({
                id: w.id,
                email: w.email,
                profileId: w.profile?.id,
                fullName: w.profile?.fullName,
                status: w.profile?.status,
                grammarScore: w.profile?.grammarScore,
                policyScore: w.profile?.policyScore
            }))
        });
    } catch (error) {
        console.error('Fetch writers error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
