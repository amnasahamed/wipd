import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    try {
        // Safety guard: never allow seeding in production environments.
        if (process.env.NODE_ENV === 'production') {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        // Optional protection: set SEED_TOKEN to require a token for access.
        const expectedToken = process.env.SEED_TOKEN;
        if (expectedToken) {
            const { searchParams } = new URL(request.url);
            const providedToken = searchParams.get('token') || request.headers.get('x-seed-token');
            if (providedToken !== expectedToken) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        // Hash passwords
        const adminPassword = await bcrypt.hash('Amnas@1997', 10);
        const writerPassword = await bcrypt.hash('password123', 10);

        // Seed Admin
        const admin = await prisma.user.upsert({
            where: { email: 'muhsinaov0@gmail.com' },
            update: {
                password: adminPassword,
                role: 'ADMIN'
            },
            create: {
                email: 'muhsinaov0@gmail.com',
                password: adminPassword,
                role: 'ADMIN'
            }
        });

        // Seed Writers
        const writersData = [
            { email: 'sarah.j@example.com', name: 'Sarah Johnson', status: 'ACTIVE', g: 92, p: 88 },
            { email: 'mike.r@example.com', name: 'Mike Ross', status: 'ACTIVE', g: 85, p: 90 },
            { email: 'alex.h@example.com', name: 'Alex Hunter', status: 'ONBOARDING', g: 95, p: null },
        ];

        for (const data of writersData) {
            await prisma.user.upsert({
                where: { email: data.email },
                update: {},
                create: {
                    email: data.email,
                    password: writerPassword,
                    role: 'WRITER',
                    profile: {
                        create: {
                            fullName: data.name,
                            status: data.status,
                            grammarScore: data.g,
                            policyScore: data.p
                        }
                    }
                }
            });
        }

        return NextResponse.json({ success: true, message: 'Database seeded successfully', admin: { id: admin.id, email: admin.email } });
    } catch (error) {
        console.error('Seed error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
