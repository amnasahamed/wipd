import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
    try {
        const body = await request.json();
        const { userId, fullName, workTypes } = body;

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
                userId,
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
                workTypes: profile.workTypes ? JSON.parse(profile.workTypes) : []
            }
        });
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
