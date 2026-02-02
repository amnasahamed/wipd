import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const entityType = searchParams.get('entityType');

        const auditLogs = await prisma.auditLog.findMany({
            where: entityType ? { entityType } : {},
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: { user: true }
        });

        return NextResponse.json({
            success: true,
            logs: auditLogs.map(log => ({
                id: log.id,
                timestamp: log.createdAt,
                action: log.action,
                entity: `${log.entityType} (${log.entityId})`,
                user: log.user?.email || 'System',
                details: log.details ? JSON.parse(log.details) : null
            }))
        });
    } catch (error) {
        console.error('Fetch audit logs error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
