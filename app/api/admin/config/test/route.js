import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { testProviderConnection } from '@/lib/intelligence/llm-adapter';
import { getAllConfig } from '@/lib/config/secure-config';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/config/test
 * Test LLM provider connection
 */
export async function POST(request) {
    try {
        const { errorResponse } = await requireAdmin();
        if (errorResponse) return errorResponse;

        const body = await request.json();
        const { provider, apiKey: providedApiKey } = body;

        // Validate provider
        const validProviders = ['openai', 'anthropic', 'gemini', 'groq'];
        if (!provider || !validProviders.includes(provider)) {
            return NextResponse.json(
                { success: false, error: `Invalid provider. Must be one of: ${validProviders.join(', ')}` },
                { status: 400 }
            );
        }

        // Use provided API key or fetch from config
        let apiKey = providedApiKey;
        if (!apiKey) {
            const config = await getAllConfig({ decryptSecrets: true });
            const keyMap = {
                openai: 'openai_api_key',
                anthropic: 'anthropic_api_key',
                gemini: 'gemini_api_key',
                groq: 'groq_api_key'
            };
            apiKey = config[keyMap[provider]];
        }

        if (!apiKey) {
            return NextResponse.json(
                { success: false, error: `No API key found for ${provider}` },
                { status: 400 }
            );
        }

        // Test the connection
        const result = await testProviderConnection(provider, apiKey);

        return NextResponse.json({
            success: result.success,
            message: result.success ? result.message : undefined,
            error: result.error || undefined
        });

    } catch (error) {
        console.error('Provider test error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to test provider: ' + error.message },
            { status: 500 }
        );
    }
}

/**
 * GET /api/admin/config/test
 * Get LLM configuration status
 */
export async function GET() {
    try {
        const { errorResponse } = await requireAdmin();
        if (errorResponse) return errorResponse;

        const config = await getAllConfig({ decryptSecrets: true, maskSecrets: true });
        
        const status = {
            provider: config.llm_provider || 'mock',
            providers: {
                openai: {
                    configured: !!config.openai_api_key,
                    model: config.openai_model
                },
                anthropic: {
                    configured: !!config.anthropic_api_key,
                    model: config.anthropic_model
                },
                gemini: {
                    configured: !!config.gemini_api_key,
                    model: config.gemini_model
                },
                groq: {
                    configured: !!config.groq_api_key,
                    model: config.groq_model
                }
            },
            features: {
                llmAnalysis: config.enable_llm_analysis === 'true',
                styleAnalysis: config.enable_style_analysis === 'true',
                citationCheck: config.enable_citation_check === 'true'
            },
            thresholds: {
                highRisk: parseInt(config.risk_threshold_high) || 50,
                mediumRisk: parseInt(config.risk_threshold_medium) || 20,
                lowIntegrity: parseInt(config.integrity_threshold_low) || 60,
                mediumIntegrity: parseInt(config.integrity_threshold_medium) || 80
            }
        };

        return NextResponse.json({
            success: true,
            status
        });

    } catch (error) {
        console.error('Config status error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to get configuration status' },
            { status: 500 }
        );
    }
}
