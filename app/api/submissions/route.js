import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/session';

export async function GET(request) {
    try {
        const { errorResponse } = await requireAdmin();
        if (errorResponse) return errorResponse;

        const { searchParams } = new URL(request.url);
        const detailed = searchParams.get('detailed') === 'true';
        const limit = searchParams.get('limit');
        const includeSamples = searchParams.get('includeSamples') === 'true';

        const submissions = await prisma.submission.findMany({
            where: includeSamples ? {} : { NOT: { assignment: { title: { startsWith: 'Onboarding Sample' } } } },
            include: {
                assignment: true,
                writer: true,
                analysisResults: detailed // Include if requested
            },
            orderBy: { createdAt: 'desc' },
            take: limit ? parseInt(limit) : undefined
        });

        return NextResponse.json({
            success: true,
            submissions: submissions.map(s => {
                const result = s.analysisResults?.[0]; // Get latest result
                let signals = [];
                try {
                    signals = result?.signals ? JSON.parse(result.signals) : [];
                } catch (e) {
                    console.error('Error parsing signals for submission', s.id, e);
                    signals = [];
                }

                return {
                    id: s.id,
                    title: s.assignment?.title || 'Untitled Assignment',
                    writer: s.writer?.fullName || 'Unknown Writer',
                    writerAvatar: (s.writer?.fullName || "U").charAt(0),
                    category: s.assignment?.category || null,
                    submittedAt: s.createdAt,
                    integrityScore: s.integrityScore || 0,
                    aiScore: s.aiRiskScore || 0,
                    plagiarismScore: 0,
                    status: s.status.toLowerCase(),
                    // Detailed report structure for integrity page
                    integrityReport: detailed ? {
                        overallRisk: s.integrityScore < 70 ? 'high' : s.integrityScore < 90 ? 'medium' : 'low',
                        styleMatch: s.integrityScore || 0,
                        internalSimilarity: 10, // Placeholder
                        aiRiskScore: s.aiRiskScore || 0,
                        citationScore: 95, // Placeholder
                        wordCount: s.content?.split(' ').length || 0,
                        signals: signals.length > 0 ? signals : [
                            { type: "neutral", message: "Analysis pending or incomplete" }
                        ]
                    } : null
                };
            })
        });
    } catch (error) {
        console.error('Fetch submissions error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
