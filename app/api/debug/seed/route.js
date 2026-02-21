import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { initializeDefaultConfig } from '@/lib/config/secure-config';

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

        // SECURITY FIX: Use environment variables for seed passwords
        const adminPassword = await bcrypt.hash(
            process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!', 
            10
        );
        const writerPassword = await bcrypt.hash(
            process.env.SEED_WRITER_PASSWORD || 'WriterPass456!', 
            10
        );

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
                update: {
                    password: adminPassword,
                    password: writerPassword,  // Update password on reseed
                },
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

        // Initialize default configuration
        await initializeDefaultConfig();

        return NextResponse.json({ 
            success: true, 
            message: 'Database seeded successfully with default configuration', 
            admin: { id: admin.id, email: admin.email },
            config: 'Default configuration initialized'
        });
    } catch (error) {
        console.error('Seed error:', error);
        // SECURITY FIX: Don't leak error details to client
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
