import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: Fetch single writer details
export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const writer = await prisma.user.findUnique({
            where: { id },
            include: {
                profile: {
                    include: {
                        submissions: {
                            orderBy: { createdAt: 'desc' },
                            take: 10,
                            include: {
                                assignment: {
                                    select: { title: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!writer) {
            return NextResponse.json({ error: 'Writer not found' }, { status: 404 });
        }

        // Calculate aggregate stats
        const subs = writer.profile?.submissions || [];
        const approved = subs.filter(s => s.status === 'APPROVED').length;
        const total = subs.length;
        const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;

        // Mocking advanced metrics for now
        const integrityScore = 98; // Fallback

        const writerDetails = {
            id: writer.id,
            email: writer.email,
            role: writer.role,
            createdAt: writer.createdAt,
            profile: {
                ...writer.profile,
                stats: {
                    totalSubmissions: total,
                    approvalRate,
                    integrityScore
                }
            },
            recentActivity: subs.map(s => ({
                id: s.id,
                assignmentTitle: s.assignment?.title || 'Untitled Task',
                status: s.status,
                submittedAt: s.createdAt,
                score: s.integrityScore || 'N/A'
            }))
        };

        return NextResponse.json({
            success: true,
            writer: writerDetails
        });

    } catch (error) {
        console.error('Fetch writer details error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PATCH: Update writer status
export async function PATCH(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status } = body;

        if (!status) {
            return NextResponse.json({ error: 'Status is required' }, { status: 400 });
        }

        // We update the Profile status, not the User table directly (unless we had a global status there)
        const updatedProfile = await prisma.profile.update({
            where: { userId: id },
            data: { status }
        });

        return NextResponse.json({
            success: true,
            profile: updatedProfile
        });

    } catch (error) {
        console.error('Update writer error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE: Remove writer account
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        // Transaction to ensure clean cleanup
        // Note: Submissions are kept or deleted based on business logic. 
        // Here we'll demonstrate a cascade delete for User & Profile.
        // If relations are not set to cascade in DB, we must delete manually.

        await prisma.$transaction(async (tx) => {
            // 1. Delete Profile (and usually submissions if they are strictly owned, 
            // but in this system assignments might need to be preserved for audit.
            // For now, let's assuming deleting the USER is the primary goal).

            // To be safe against FK constraints if not Cascade:
            // Delete Profile first (User -> Profile is 1:1)
            await tx.profile.delete({
                where: { userId: id }
            });

            // Delete User
            await tx.user.delete({
                where: { id }
            });
        });

        return NextResponse.json({
            success: true,
            message: 'Writer account deleted successfully'
        });

    } catch (error) {
        console.error('Delete writer error:', error);
        return NextResponse.json({ error: 'Failed to delete writer' }, { status: 500 });
    }
}
