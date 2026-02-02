import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const assignment = await prisma.assignment.findUnique({
            where: { id },
            include: {
                writer: true,
                submission: {
                    include: {
                        analysis: true
                    }
                }
            }
        });

        if (!assignment) {
            return NextResponse.json(
                { success: false, error: 'Assignment not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            assignment
        });
    } catch (error) {
        console.error('Error fetching assignment:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch assignment' },
            { status: 500 }
        );
    }
}
