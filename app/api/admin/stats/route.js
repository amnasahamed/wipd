import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const assignments = await prisma.assignment.findMany({
            include: {
                submissions: {
                    include: {
                        analysisResults: true // Changed from analysis to analysisResults based on earlier finding
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });

        const writers = await prisma.user.findMany({
            where: { role: 'WRITER' },
            include: { profile: true }
        });

        // 1. Avg Integrity Score
        // Get the latest submission for each assignment
        const recentSubmissions = assignments
            .map(a => a.submissions[0])
            .filter(s => s !== undefined);

        const submissionsWithAnalysis = recentSubmissions.filter(s => s.integrityScore !== null);
        const totalIntegrity = submissionsWithAnalysis.reduce((acc, curr) => acc + (curr.integrityScore || 0), 0);
        const avgIntegrity = submissionsWithAnalysis.length > 0 ? (totalIntegrity / submissionsWithAnalysis.length).toFixed(1) : 0;

        // 2. AI Assistance Rate
        const aiFlagged = submissionsWithAnalysis.filter(s => (s.aiRiskScore || 0) > 20).length;
        const aiRate = submissionsWithAnalysis.length > 0 ? ((aiFlagged / submissionsWithAnalysis.length) * 100).toFixed(1) : 0;

        // 3. Task Completion Rate
        const completed = assignments.filter(a => a.status === 'COMPLETED').length;
        const completionRate = assignments.length > 0 ? ((completed / assignments.length) * 100).toFixed(1) : 0;

        // 4. Writer Distribution
        const levels = {
            EXPERT: writers.filter(w => (w.profile?.grammarScore || 0) >= 90).length,
            SENIOR: writers.filter(w => (w.profile?.grammarScore || 0) >= 75 && (w.profile?.grammarScore || 0) < 90).length,
            JUNIOR: writers.filter(w => (w.profile?.grammarScore || 0) < 75).length,
        };

        const totalWriters = writers.length || 1;
        const distribution = {
            expert: Math.round((levels.EXPERT / totalWriters) * 100),
            senior: Math.round((levels.SENIOR / totalWriters) * 100),
            junior: Math.round((levels.JUNIOR / totalWriters) * 100),
        };

        return NextResponse.json({
            success: true,
            stats: {
                avgIntegrity,
                aiRate,
                completionRate,
                distribution,
                totalAssignments: assignments.length,
                totalWriters: writers.length
            }
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch stats' },
            { status: 500 }
        );
    }
}
