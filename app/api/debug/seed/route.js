import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST() {
    try {
        // Clear existing data (CAUTION: Dev only)
        // await prisma.auditLog.deleteMany();
        // await prisma.submission.deleteMany();
        // await prisma.assignment.deleteMany();
        // await prisma.profile.deleteMany();
        // await prisma.user.deleteMany();

        // Seed Admin
        const admin = await prisma.user.upsert({
            where: { email: 'admin@system.com' },
            update: {},
            create: {
                email: 'admin@system.com',
                password: 'admin',
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
                    password: 'password123',
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

        return NextResponse.json({ success: true, message: 'Database seeded successfully' });
    } catch (error) {
        console.error('Seed error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
