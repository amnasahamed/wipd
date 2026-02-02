import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
    try {
        const assignments = await prisma.assignment.findMany({
            include: {
                writer: true,
                submissions: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({
            success: true,
            assignments: assignments.map(a => ({
                id: a.id,
                title: a.title,
                writerName: a.writer.fullName || 'Unknown',
                deadline: a.deadline,
                status: a.status,
                lastSubmission: a.submissions[0] || null
            }))
        });
    } catch (error) {
        console.error('Fetch all assignments error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
