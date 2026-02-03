import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const submission = await prisma.submission.findUnique({
            where: { id },
            include: {
                writer: {
                    select: {
                        id: true,
                        fullName: true,
                        status: true
                    }
                },
                assignment: {
                    select: {
                        id: true,
                        title: true,
                        description: true
                    }
                },
                analysisResults: true
            }
        });

        if (!submission) {
            return NextResponse.json(
                { success: false, error: 'Submission not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            submission: {
                id: submission.id,
                content: submission.content,
                fileUrl: submission.fileUrl,
                integrityScore: submission.integrityScore,
                aiRiskScore: submission.aiRiskScore,
                status: submission.status,
                createdAt: submission.createdAt,
                updatedAt: submission.updatedAt,
                writer: submission.writer,
                assignment: submission.assignment,
                analysisResults: submission.analysisResults
            }
        });
    } catch (error) {
        console.error('Error fetching submission:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch submission' },
            { status: 500 }
        );
    }
}
