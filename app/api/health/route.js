import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getConfigSummary, testEncryption } from '@/lib/config/secure-config';
import { getLLMConfigStatus } from '@/lib/intelligence/llm-adapter';

export const dynamic = 'force-dynamic';

/**
 * GET /api/health
 * Health check endpoint for monitoring
 */
export async function GET() {
    const checks = {
        database: false,
        encryption: false,
        configuration: false
    };
    
    const errors = [];

    // Check database connection
    try {
        await prisma.$queryRaw`SELECT 1`;
        checks.database = true;
    } catch (error) {
        errors.push(`Database: ${error.message}`);
    }

    // Check encryption
    try {
        checks.encryption = testEncryption();
        if (!checks.encryption) {
            errors.push('Encryption: Test failed');
        }
    } catch (error) {
        errors.push(`Encryption: ${error.message}`);
    }

    // Check configuration
    try {
        const configSummary = await getConfigSummary();
        checks.configuration = configSummary.total > 0;
    } catch (error) {
        errors.push(`Configuration: ${error.message}`);
    }

    const allHealthy = Object.values(checks).every(v => v === true);

    return NextResponse.json({
        status: allHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '0.1.0',
        environment: process.env.NODE_ENV || 'development',
        checks,
        errors: errors.length > 0 ? errors : undefined
    }, {
        status: allHealthy ? 200 : 503
    });
}

/**
 * GET /api/health/detailed
 * Detailed health check with LLM status (admin only)
 */
export async function POST(request) {
    try {
        // Basic health check
        const basicHealth = await GET();
        const basicData = await basicHealth.json();

        // Get LLM configuration status
        let llmStatus = null;
        try {
            llmStatus = await getLLMConfigStatus();
        } catch (error) {
            basicData.errors = basicData.errors || [];
            basicData.errors.push(`LLM Status: ${error.message}`);
        }

        // Get recent API usage stats
        let apiUsage = null;
        try {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            const recentCalls = await prisma.apiUsageLog.findMany({
                where: { createdAt: { gte: oneHourAgo } }
            });
            
            apiUsage = {
                lastHour: {
                    total: recentCalls.length,
                    successful: recentCalls.filter(c => c.success).length,
                    failed: recentCalls.filter(c => !c.success).length,
                    byProvider: recentCalls.reduce((acc, call) => {
                        acc[call.provider] = (acc[call.provider] || 0) + 1;
                        return acc;
                    }, {})
                }
            };
        } catch (error) {
            basicData.errors = basicData.errors || [];
            basicData.errors.push(`API Usage: ${error.message}`);
        }

        return NextResponse.json({
            ...basicData,
            llm: llmStatus,
            apiUsage
        });
    } catch (error) {
        return NextResponse.json(
            { status: 'error', message: error.message },
            { status: 500 }
        );
    }
}
