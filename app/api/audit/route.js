import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/session';

export async function GET(request) {
    try {
        const { errorResponse } = await requireAdmin();
        if (errorResponse) return errorResponse;

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
                entityType: log.entityType,
                entityId: log.entityId,
                entity: `${log.entityType} ${log.entityId.substring(0, 8)}...`,
                actor: {
                    name: log.user?.email?.split('@')[0] || 'System'
                },
                user: log.user?.email || 'System',
                ip: '127.0.0.1',
                details: (() => {
                    try {
                        return log.details ? JSON.parse(log.details) : null;
                    } catch {
                        return null;
                    }
                })()
            }))
        });
    } catch (error) {
        console.error('Fetch audit logs error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
