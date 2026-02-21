import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // SECURITY FIX: Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
        }

        if (!password) {
            return NextResponse.json({ error: 'Password is required' }, { status: 400 });
        }

        if (password.length < 8) {
            return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
        }

        // SECURITY FIX: Password strength validation
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
            return NextResponse.json({
                error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
            }, { status: 400 });
        }

        // Check if user exists
        const existing = await prisma.user.findUnique({
            where: { email }
        });

        if (existing) {
            return NextResponse.json({ error: 'Email is already registered. Please log in.' }, { status: 409 });
        }

        // Hash the user-provided password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Always create writers via onboarding (never allow role escalation from the client).
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: 'WRITER',
                profile: {
                    create: {
                        fullName: body.name || '',
                        status: 'ONBOARDING',
                        education: body.education,
                        experience: body.experience,
                        bio: body.bio || '',
                        workTypes: body.workTypes ? JSON.stringify(body.workTypes) : '[]',
                        phone: body.phone,
                        timezone: body.timezone
                    }
                }
            },
            include: { profile: true }
        });

        // Log the action
        await prisma.auditLog.create({
            data: {
                userId: user.id,
                entityType: 'USER',
                entityId: user.id,
                action: 'CREATE',
                details: JSON.stringify({ email, role: user.role, profile: 'created' })
            }
        });

        // Start a session immediately so subsequent onboarding steps are authenticated.
        (await cookies()).set({
            name: 'auth-token',
            value: JSON.stringify({ id: user.id, role: user.role }),
            httpOnly: true,
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
        });

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
