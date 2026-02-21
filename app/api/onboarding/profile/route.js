import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth/session';

export async function POST(request) {
    try {
        const { user: sessionUser, errorResponse } = await requireRole(['ADMIN', 'WRITER']);
        if (errorResponse) return errorResponse;

        const body = await request.json();
        const { userId: userIdFromBody, fullName, workTypes } = body;

        const userId = sessionUser.role === 'WRITER' ? sessionUser.id : userIdFromBody;
        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Update profile
        const profile = await prisma.profile.update({
            where: { userId },
            data: {
                fullName,
                workTypes: workTypes ? JSON.stringify(workTypes) : undefined,
                updatedAt: new Date()
            }
        });

        // Log the action
        await prisma.auditLog.create({
            data: {
                userId: sessionUser.id,
                entityType: 'PROFILE',
                entityId: profile.id,
                action: 'UPDATE',
                details: JSON.stringify({ fullName, workTypes })
            }
        });

        return NextResponse.json({
            success: true,
            profile: {
                id: profile.id,
                fullName: profile.fullName,
                workTypes: (() => {
                    try {
                        return profile.workTypes ? JSON.parse(profile.workTypes) : [];
                    } catch {
                        return [];
                    }
                })()
            }
        });
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
