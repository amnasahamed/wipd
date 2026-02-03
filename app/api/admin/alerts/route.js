import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Define "Critical" thresholds
        // 1. High AI Content (> 50%)
        // 2. Low Integrity Score (< 60%)
        // 3. Status is 'PENDING_REVIEW' or 'NEEDS_REWRITE'

        const alerts = [];

        const riskySubmissions = await prisma.submission.findMany({
            where: {
                OR: [
                    { aiRiskScore: { gt: 50 } },
                    { integrityScore: { lt: 60 } }
                ],
                status: { in: ['PENDING_REVIEW', 'NEEDS_REWRITE'] }
            },
            include: {
                writer: {
                    select: {
                        fullName: true,
                        userId: true
                    }
                },
                assignment: {
                    select: {
                        title: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        // Map to UI alert format
        riskySubmissions.forEach(sub => {
            if ((sub.aiRiskScore || 0) > 50) {
                alerts.push({
                    id: `ai-${sub.id}`,
                    type: 'critical',
                    title: 'High AI Content Detected',
                    message: `Submission for "${sub.assignment.title}" by ${sub.writer?.fullName || 'Unknown'} has ${sub.aiRiskScore}% AI score.`,
                    actionLabel: 'Review',
                    link: `/admin/submissions/${sub.id}`,
                    icon: '⚠️'
                });
            } else if ((sub.integrityScore || 100) < 60) {
                alerts.push({
                    id: `int-${sub.id}`,
                    type: 'warning',
                    title: 'Low Integrity Score',
                    message: `Submission for "${sub.assignment.title}" by ${sub.writer?.fullName || 'Unknown'} has low integrity (${sub.integrityScore}%).`,
                    actionLabel: 'Review',
                    link: `/admin/submissions/${sub.id}`,
                    icon: '🛑'
                });
            }
        });

        // Fallback checks (e.g., Writers stuck in onboarding? Not implemented yet for alerts but could be)

        return NextResponse.json({
            success: true,
            alerts: alerts.slice(0, 5) // Limit to top 5
        });

    } catch (error) {
        console.error('Error fetching admin alerts:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch alerts' },
            { status: 500 }
        );
    }
}
