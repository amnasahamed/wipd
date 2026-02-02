import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
    try {
        // Since we don't have session management yet, we'll look for a cookie or header,
        // or just return the first user if none specified (for development/testing).
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        // Strict session check via cookie
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const userId = cookieStore.get('auth-token')?.value;

        let user;
        if (userId) {
            user = await prisma.user.findUnique({
                where: { id: userId },
                include: { profile: true }
            });
        }

        // If no user found by cookie, strictly unauthorized
        if (!userId || !user) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }


        if (!user) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        return NextResponse.json({
            authenticated: true,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                profile: user.profile ? {
                    id: user.profile.id,
                    fullName: user.profile.fullName,
                    status: user.profile.status,
                    grammarScore: user.profile.grammarScore,
                    policyScore: user.profile.policyScore,
                    workTypes: user.profile.workTypes ? JSON.parse(user.profile.workTypes) : []
                } : null
            }
        });
    } catch (error) {
        console.error('Auth check error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
