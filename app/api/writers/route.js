import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const writers = await prisma.user.findMany({
            where: { role: 'WRITER' },
            include: {
                profile: {
                    include: {
                        submissions: true
                    }
                }
            }
        });

        const writersWithStats = writers.map(w => {
            const subs = w.profile?.submissions || [];
            const approved = subs.filter(s => s.status === 'APPROVED').length;
            const rejected = subs.filter(s => s.status === 'REJECTED').length;
            const revisions = subs.filter(s => s.status === 'NEEDS_REWRITE').length;

            // Mocking some metrics if not in DB yet
            const avgStyleMatch = w.profile?.grammarScore || 0;
            const avgAiRisk = 100 - (w.profile?.policyScore || 100);

            return {
                id: w.id,
                fullName: w.profile?.fullName || 'Unknown Writer',
                email: w.email,
                status: w.profile?.status || 'ONBOARDING', // Keep original case for badge display
                joinedAt: w.createdAt,
                stats: {
                    totalSubmissions: subs.length,
                    approved,
                    revisions,
                    rejected,
                    avgStyleMatch,
                    avgAiRisk,
                    avgCitations: 90 // Placeholder
                },
                recentTrend: "stable" // Placeholder logic
            };
        });

        return NextResponse.json({
            success: true,
            writers: writersWithStats
        });
    } catch (error) {
        console.error('Fetch writers error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
