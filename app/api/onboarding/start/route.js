import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, role = 'WRITER' } = body;

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Check if user exists
        let user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            // Create user and profile
            user = await prisma.user.create({
                data: {
                    email,
                    password: 'password123', // Mock password for now
                    role,
                    profile: {
                        create: {
                            status: 'ONBOARDING'
                        }
                    }
                },
                include: {
                    profile: true
                }
            });

            // Log the action
            await prisma.auditLog.create({
                data: {
                    userId: user.id,
                    entityType: 'USER',
                    entityId: user.id,
                    action: 'CREATE',
                    details: JSON.stringify({ email, role })
                }
            });
        }

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                profileId: user.profile?.id
            }
        });
    } catch (error) {
        console.error('Onboarding start error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
