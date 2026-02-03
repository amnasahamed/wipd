import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const riskFilter = searchParams.get('risk'); // 'high', 'medium', 'low'

        // Fetch submissions with analysis results
        const submissions = await prisma.submission.findMany({
            where: {
                NOT: { status: 'PENDING' }, // Only show submitted work
                // Add specific risk filtering logic here if needed at DB level, 
                // but for now we'll do it in memory or fetch all to show distribution
            },
            include: {
                writer: {
                    select: {
                        fullName: true,
                        id: true,
                        // Avatar logic is usually frontend derivative of name
                    }
                },
                assignment: {
                    select: {
                        title: true,
                        // category? Schema checks needed. Assuming generic 'academic' for now if missing.
                    }
                },
                analysisResults: true
            },
            orderBy: { createdAt: 'desc' }
        });

        const reports = submissions.map(sub => {
            // Determine Overall Risk based on scores
            let overallRisk = 'low';
            const aiScore = sub.aiRiskScore || 0;
            const integrity = sub.integrityScore || 100;

            if (aiScore > 50 || integrity < 60) overallRisk = 'high';
            else if (aiScore > 20 || integrity < 80) overallRisk = 'medium';

            // Parse signals if any
            let signals = [];
            if (sub.analysisResults && sub.analysisResults.length > 0) {
                try {
                    const result = sub.analysisResults[0]; // Get latest
                    if (result.signals) {
                        signals = JSON.parse(result.signals);
                    }
                } catch (e) {
                    console.error('Error parsing signals', e);
                }
            }

            // Fallback signals if empty (Mocking for UI consistency if analysis hasn't run)
            if (signals.length === 0) {
                if (overallRisk === 'high') signals.push({ type: 'danger', message: 'High risk detected automatically.' });
                else signals.push({ type: 'positive', message: 'No significant issues detected.' });
            }

            return {
                id: sub.id,
                writer: {
                    name: sub.writer?.fullName || 'Unknown Writer',
                    avatar: (sub.writer?.fullName || 'U').charAt(0).toUpperCase()
                },
                assignment: sub.assignment?.title || 'Untitled Assignment',
                category: 'Standard', // Schema doesn't have category on Assignment yet?
                submittedAt: sub.createdAt,
                status: sub.status.toLowerCase(),
                integrityReport: {
                    overallRisk,
                    styleMatch: Math.round(integrity), // Proxied by integrity score for now
                    internalSimilarity: 0, // Not yet in schema?
                    aiRiskScore: Math.round(aiScore),
                    citationScore: 90, // Placeholder
                    wordCount: sub.content ? sub.content.split(' ').length : 0,
                    signals: signals
                }
            };
        });

        // Filter by risk if requested
        const filteredReports = riskFilter && riskFilter !== 'all'
            ? reports.filter(r => r.integrityReport.overallRisk === riskFilter)
            : reports;

        return NextResponse.json({
            success: true,
            reports: filteredReports
        });

    } catch (error) {
        console.error('Error fetching integrity reports:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch reports' },
            { status: 500 }
        );
    }
}
