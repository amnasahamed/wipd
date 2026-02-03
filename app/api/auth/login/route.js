import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
            include: { profile: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Set HttpOnly cookie for session
        // In production, secure: true should be set if on HTTPS
        (await cookies()).set({
            name: 'auth-token',
            value: user.id,
            httpOnly: true,
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            sameSite: 'strict'
            // secure: process.env.NODE_ENV === 'production'
        });

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.profile?.fullName
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
