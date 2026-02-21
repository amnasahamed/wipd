import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

// GET: Fetch single writer details
export async function GET(request, { params }) {
    try {
        const { errorResponse } = await requireAdmin();
        if (errorResponse) return errorResponse;

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
        const { errorResponse } = await requireAdmin();
        if (errorResponse) return errorResponse;

        const { id } = await params;
        const body = await request.json();
        const { status } = body;

        if (!status) {
            return NextResponse.json({ error: 'Status is required' }, { status: 400 });
        }

        // VALIDATION FIX: Only allow valid status values
        const validStatuses = ['ONBOARDING', 'ACTIVE', 'SUSPENDED'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
                { status: 400 }
            );
        }

        // We update the Profile status, not the User table directly
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
        const { errorResponse } = await requireAdmin();
        if (errorResponse) return errorResponse;

        const { id } = await params;

        // DATA INTEGRITY FIX: Proper cascade delete order respecting FK constraints
        await prisma.$transaction(async (tx) => {
            // 1. Get profile ID first
            const profile = await tx.profile.findUnique({
                where: { userId: id },
                select: { id: true }
            });

            if (!profile) {
                throw new Error('Profile not found');
            }

            // 2. Delete AnalysisResults for all submissions by this writer
            await tx.analysisResult.deleteMany({
                where: { 
                    submission: { writerId: profile.id }
                }
            });

            // 3. Delete Submissions by this writer
            await tx.submission.deleteMany({
                where: { writerId: profile.id }
            });

            // 4. Delete Assignments by this writer
            await tx.assignment.deleteMany({
                where: { writerId: profile.id }
            });

            // 5. Delete Profile
            await tx.profile.delete({
                where: { userId: id }
            });

            // 6. Delete User's audit logs (optional - could preserve for compliance)
            await tx.auditLog.deleteMany({
                where: { userId: id }
            });

            // 7. Finally delete User
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
