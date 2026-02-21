import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { 
    getAllConfig, 
    setMultipleConfig, 
    testEncryption, 
    getConfigSummary,
    initializeDefaultConfig 
} from '@/lib/config/secure-config';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/config
 * Get all configuration values (secrets are masked)
 */
export async function GET() {
    try {
        const { user, errorResponse } = await requireAdmin();
        if (errorResponse) return errorResponse;

        // Get configuration with secrets masked for security
        const config = await getAllConfig({ decryptSecrets: false, maskSecrets: true });
        
        // Get config summary for additional context
        const summary = await getConfigSummary();

        return NextResponse.json({
            success: true,
            config,
            summary,
            encryption: {
                enabled: true,
                working: testEncryption()
            }
        });
    } catch (error) {
        console.error('Config fetch error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch configuration' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/admin/config
 * Update configuration values
 */
export async function POST(request) {
    try {
        const { user, errorResponse } = await requireAdmin();
        if (errorResponse) return errorResponse;

        const body = await request.json();
        const { settings } = body;

        if (!settings || typeof settings !== 'object') {
            return NextResponse.json(
                { success: false, error: 'No settings provided' },
                { status: 400 }
            );
        }

        // Validate settings
        const validKeys = [
            // LLM Provider settings
            'llm_provider', 'openai_api_key', 'openai_model',
            'anthropic_api_key', 'anthropic_model',
            'gemini_api_key', 'gemini_model',
            'groq_api_key', 'groq_model', 'system_prompt',
            // Risk thresholds
            'risk_threshold_high', 'risk_threshold_medium',
            'integrity_threshold_low', 'integrity_threshold_medium',
            // Feature flags
            'enable_llm_analysis', 'enable_style_analysis', 'enable_citation_check',
            // Rate limiting
            'max_requests_per_minute', 'max_file_size_mb'
        ];

        const invalidKeys = Object.keys(settings).filter(key => !validKeys.includes(key));
        if (invalidKeys.length > 0) {
            return NextResponse.json(
                { success: false, error: `Invalid configuration keys: ${invalidKeys.join(', ')}` },
                { status: 400 }
            );
        }

        // Save configuration
        const result = await setMultipleConfig(settings, { updatedBy: user.id });

        if (!result.success && result.errors.length > 0) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'Some settings failed to save',
                    details: result.errors 
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Settings saved successfully',
            saved: result.results.length,
            errors: result.errors
        });

    } catch (error) {
        console.error('Config save error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to save settings: ' + error.message },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/admin/config/initialize
 * Initialize default configuration
 */
export async function PUT() {
    try {
        const { errorResponse } = await requireAdmin();
        if (errorResponse) return errorResponse;

        await initializeDefaultConfig();

        return NextResponse.json({
            success: true,
            message: 'Default configuration initialized'
        });
    } catch (error) {
        console.error('Config initialization error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to initialize configuration' },
            { status: 500 }
        );
    }
}
