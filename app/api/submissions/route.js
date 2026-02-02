import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = searchParams.get('limit');

        const submissions = await prisma.submission.findMany({
            include: {
                assignment: true,
                writer: true
            },
            orderBy: { createdAt: 'desc' },
            take: limit ? parseInt(limit) : undefined
        });

        return NextResponse.json({
            success: true,
            submissions: submissions.map(s => ({
                id: s.id,
                title: s.assignment.title,
                writer: s.writer.fullName || 'Unknown',
                submittedAt: s.createdAt,
                integrityScore: s.integrityScore || 0,
                aiScore: s.aiRiskScore || 0,
                plagiarismScore: 0, // Placeholder as not in core schema yet
                status: s.status.toLowerCase() == 'pending_review' ? 'pending' : s.status.toLowerCase()
            }))
        });
    } catch (error) {
        console.error('Fetch submissions error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
