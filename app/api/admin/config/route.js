import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { errorResponse } = await requireAdmin();
        if (errorResponse) return errorResponse;

        const configs = await prisma.systemConfig.findMany();

        // Convert array to object for easier frontend consumption
        const configMap = {};
        configs.forEach(c => {
            // If secret, don't return the value for security (or mask it)
            // But for the settings page editors, we might need to show if it's set or allow overwrite
            // Let's return masked value if secret
            configMap[c.key] = c.isSecret ? '********' : c.value;
        });

        return NextResponse.json({
            success: true,
            config: configMap
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { errorResponse } = await requireAdmin();
        if (errorResponse) return errorResponse;

        const body = await request.json();
        const { settings } = body; // Expects object { key: value, ... }

        if (!settings) return NextResponse.json({ error: 'No settings provided' }, { status: 400 });

        const operations = Object.entries(settings).map(async ([key, value]) => {
            // Determine if secret based on key name convention
            const isSecret = key.includes('api_key') || key.includes('secret');

            // Skip update if value is the mask
            if (value === '********') return;

            return prisma.systemConfig.upsert({
                where: { key },
                update: { value, isSecret },
                create: { key, value, isSecret }
            });
        });

        await Promise.all(operations);

        return NextResponse.json({ success: true, message: 'Settings saved' });
    } catch (error) {
        console.error('Config save error:', error);
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }
}
