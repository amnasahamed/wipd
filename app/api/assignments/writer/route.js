import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const writerId = searchParams.get('writerId');

        if (!writerId) {
            return NextResponse.json({ error: 'Writer ID is required' }, { status: 400 });
        }

        const assignments = await prisma.assignment.findMany({
            where: { writerId },
            include: { submissions: true },
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
                hasSubmission: a.submissions.length > 0
            }))
        });
    } catch (error) {
        console.error('Fetch writer assignments error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
