/**
 * LLM Adapter for Module 09 (LLM Intelligence)
 * Dynamically configured via Admin Settings with real API integrations
 */

import { getConfig, getAllConfig } from '@/lib/config/secure-config';
import prisma from '@/lib/prisma';

/**
 * Log API usage for monitoring and rate limiting
 */
async function logApiUsage(provider, endpoint, requestSize, responseSize, statusCode, success, errorMessage, duration, submissionId) {
    try {
        await prisma.apiUsageLog.create({
            data: {
                provider,
                endpoint,
                requestSize,
                responseSize,
                statusCode,
                success,
                errorMessage,
                duration,
                submissionId
            }
        });
    } catch (error) {
        console.error('Failed to log API usage:', error);
    }
}

/**
 * Call OpenAI API
 */
async function callOpenAI(apiKey, model, systemPrompt, text) {
    const startTime = Date.now();
    const endpoint = 'https://api.openai.com/v1/chat/completions';

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model || 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Analyze the following text and provide a detailed assessment:\n\n${text}\n\nRespond in JSON format with aiRisk, citations, and reasoning fields.` }
                ],
                temperature: 0.3,
                max_tokens: 2000,
                response_format: { type: 'json_object' }
            })
        });

        const duration = Date.now() - startTime;
        const responseData = await response.json();

        if (!response.ok) {
            await logApiUsage('openai', endpoint, text.length, 0, response.status, false, responseData.error?.message, duration);
            throw new Error(`OpenAI API error: ${responseData.error?.message || response.statusText}`);
        }

        const content = responseData.choices[0]?.message?.content;
        await logApiUsage('openai', endpoint, text.length, content?.length || 0, response.status, true, null, duration);

        try {
            return JSON.parse(content);
        } catch (parseError) {
            console.error('[LLM Adapter] Failed to parse OpenAI response:', parseError);
            throw new Error('Invalid JSON response from OpenAI');
        }
    } catch (error) {
        const duration = Date.now() - startTime;
        await logApiUsage('openai', endpoint, text.length, 0, 0, false, error.message, duration);
        throw error;
    }
}

/**
 * Call Anthropic (Claude) API
 */
async function callAnthropic(apiKey, model, systemPrompt, text) {
    const startTime = Date.now();
    const endpoint = 'https://api.anthropic.com/v1/messages';

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: model || 'claude-3-5-sonnet-20241022',
                max_tokens: 2000,
                system: systemPrompt,
                messages: [
                    { role: 'user', content: `Analyze the following text and provide a detailed assessment:\n\n${text}\n\nRespond in JSON format with aiRisk, citations, and reasoning fields.` }
                ]
            })
        });

        const duration = Date.now() - startTime;
        const responseData = await response.json();

        if (!response.ok) {
            await logApiUsage('anthropic', endpoint, text.length, 0, response.status, false, responseData.error?.message, duration);
            throw new Error(`Anthropic API error: ${responseData.error?.message || response.statusText}`);
        }

        const content = responseData.content[0]?.text;
        await logApiUsage('anthropic', endpoint, text.length, content?.length || 0, response.status, true, null, duration);

        // Extract JSON from content (Claude might wrap it in markdown)
        const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/({[\s\S]*})/);
        const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content;
        try {
            return JSON.parse(jsonStr);
        } catch (parseError) {
            console.error('[LLM Adapter] Failed to parse Anthropic response:', parseError);
            throw new Error('Invalid JSON response from Anthropic');
        }
    } catch (error) {
        const duration = Date.now() - startTime;
        await logApiUsage('anthropic', endpoint, text.length, 0, 0, false, error.message, duration);
        throw error;
    }
}

/**
 * Call Google Gemini API
 */
async function callGemini(apiKey, model, systemPrompt, text) {
    const startTime = Date.now();
    const modelName = model || 'gemini-1.5-flash';
    // SECURITY FIX: API key in header instead of URL to prevent logging in access logs
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey
            },
            body: JSON.stringify({
                systemInstruction: {
                    parts: [{ text: systemPrompt }]
                },
                contents: [{
                    parts: [{
                        text: `Analyze the following text and provide a detailed assessment:\n\n${text}\n\nRespond in JSON format with aiRisk, citations, and reasoning fields.`
                    }]
                }],
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 2000,
                    responseMimeType: 'application/json'
                }
            })
        });

        const duration = Date.now() - startTime;
        const responseData = await response.json();

        if (!response.ok) {
            await logApiUsage('gemini', endpoint, text.length, 0, response.status, false, responseData.error?.message, duration);
            throw new Error(`Gemini API error: ${responseData.error?.message || response.statusText}`);
        }

        const content = responseData.candidates[0]?.content?.parts[0]?.text;
        await logApiUsage('gemini', endpoint, text.length, content?.length || 0, response.status, true, null, duration);

        try {
            return JSON.parse(content);
        } catch (parseError) {
            console.error('[LLM Adapter] Failed to parse Gemini response:', parseError);
            throw new Error('Invalid JSON response from Gemini');
        }
    } catch (error) {
        const duration = Date.now() - startTime;
        await logApiUsage('gemini', endpoint, text.length, 0, 0, false, error.message, duration);
        throw error;
    }
}

/**
 * Call Groq API
 */
async function callGroq(apiKey, model, systemPrompt, text) {
    const startTime = Date.now();
    const endpoint = 'https://api.groq.com/openai/v1/chat/completions';

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model || 'llama-3.1-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Analyze the following text and provide a detailed assessment:\n\n${text}\n\nRespond in JSON format with aiRisk, citations, and reasoning fields.` }
                ],
                temperature: 0.3,
                max_tokens: 2000,
                response_format: { type: 'json_object' }
            })
        });

        const duration = Date.now() - startTime;
        const responseData = await response.json();

        if (!response.ok) {
            await logApiUsage('groq', endpoint, text.length, 0, response.status, false, responseData.error?.message, duration);
            throw new Error(`Groq API error: ${responseData.error?.message || response.statusText}`);
        }

        const content = responseData.choices[0]?.message?.content;
        await logApiUsage('groq', endpoint, text.length, content?.length || 0, response.status, true, null, duration);

        try {
            return JSON.parse(content);
        } catch (parseError) {
            console.error('[LLM Adapter] Failed to parse Groq response:', parseError);
            throw new Error('Invalid JSON response from Groq');
        }
    } catch (error) {
        const duration = Date.now() - startTime;
        await logApiUsage('groq', endpoint, text.length, 0, 0, false, error.message, duration);
        throw error;
    }
}

/**
 * Generate mock analysis for testing/demo purposes
 */
function generateMockAnalysis(text, provider) {
    const wordCount = text ? text.split(/\s+/).length : 0;
    const baseScore = provider === 'groq' ? 42 : provider === 'anthropic' ? 32 : 35;

    // Generate slightly varied results based on text content
    const hash = text.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0);
    const variance = Math.abs(hash % 20) - 10;
    return {
        aiRisk: {
            score: Math.max(0, Math.min(100, baseScore + variance)),
            markers: [
                { type: "warning", message: "Repetitive patterns in technical introduction" },
                { type: "neutral", message: "Natural variance in sentence complexity" },
                { type: "positive", message: "Specific localized context for the problem statement" },
            ],
            fragmentAnalysis: `The first ${Math.min(300, wordCount)} words show minimal AI markers. Section 3 contains several transitions typical of model outputs.`,
        },
        citations: {
            score: 88,
            verifiedCount: 11,
            totalCount: 12,
            checkResults: [
                { id: 1, source: "Smith et al. (2024)", status: "verified", snippet: "Found in 'Journal of Applied Cryptography'..." },
                { id: 2, source: "Payment Systems Review p. 45", status: "verified", snippet: "Content matches the provided abstract exactly." },
                { id: 3, source: "Internal API Docs v4", status: "unverified", snippet: "Could not locate this version in the internal database." },
            ],
        },
        reasoning: {
            score: 92,
            analysis: `[Provider: ${provider}] High depth. The writer makes non-obvious connections between API security and regional banking regulations.`,
        },
    };
}

/**
 * Validate LLM response format
 */
function validateAndNormalizeResponse(response, provider) {
    const defaultResponse = {
        aiRisk: { score: 50, markers: [], fragmentAnalysis: "" },
        citations: { score: 50, verifiedCount: 0, totalCount: 0, checkResults: [] },
        reasoning: { score: 50, analysis: "" }
    };

    if (!response || typeof response !== 'object') {
        return defaultResponse;
    }

    // Normalize aiRisk
    if (response.aiRisk) {
        defaultResponse.aiRisk.score = Math.max(0, Math.min(100, response.aiRisk.score || 50));
        defaultResponse.aiRisk.markers = Array.isArray(response.aiRisk.markers) ? response.aiRisk.markers : [];
        defaultResponse.aiRisk.fragmentAnalysis = response.aiRisk.fragmentAnalysis || "";
    }

    // Normalize citations
    if (response.citations) {
        defaultResponse.citations.score = Math.max(0, Math.min(100, response.citations.score || 50));
        defaultResponse.citations.verifiedCount = response.citations.verifiedCount || 0;
        defaultResponse.citations.totalCount = response.citations.totalCount || 0;
        defaultResponse.citations.checkResults = Array.isArray(response.citations.checkResults) ? response.citations.checkResults : [];
    }

    // Normalize reasoning
    if (response.reasoning) {
        defaultResponse.reasoning.score = Math.max(0, Math.min(100, response.reasoning.score || 50));
        defaultResponse.reasoning.analysis = response.reasoning.analysis || "";
    }

    return defaultResponse;
}

/**
 * Main function to analyze a submission using configured LLM
 * @param {string} submissionId - The submission ID
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Analysis results
 */
export const analyzeSubmissionLLM = async (submissionId, options = {}) => {
    const startTime = Date.now();

    try {
        // Fetch Configuration
        const config = await getAllConfig({ decryptSecrets: true });
        const provider = config.llm_provider || 'mock';
        const systemPrompt = config.system_prompt || "You are an expert writing analyst. Evaluate this text for AI checking, citation accuracy, and reasoning depth.";

        console.log(`[LLM Adapter] Analyzing submission ${submissionId} with provider: ${provider}`);

        // Fetch submission content
        const submission = await prisma.submission.findUnique({
            where: { id: submissionId },
            select: { content: true }
        });

        if (!submission) {
            throw new Error(`Submission ${submissionId} not found`);
        }

        const text = submission.content || '';

        // Truncate very long texts to avoid API limits
        const maxLength = 15000; // ~4000 tokens approximation
        const truncatedText = text.length > maxLength ? text.substring(0, maxLength) + '... [truncated]' : text;

        let result;

        switch (provider) {
            case 'openai':
                if (!config.openai_api_key) {
                    console.warn('[LLM Adapter] OpenAI provider selected but no API key configured. Falling back to mock.');
                    result = generateMockAnalysis(text, 'openai');
                } else {
                    result = await callOpenAI(config.openai_api_key, config.openai_model, systemPrompt, truncatedText);
                }
                break;

            case 'anthropic':
                if (!config.anthropic_api_key) {
                    console.warn('[LLM Adapter] Anthropic provider selected but no API key configured. Falling back to mock.');
                    result = generateMockAnalysis(text, 'anthropic');
                } else {
                    result = await callAnthropic(config.anthropic_api_key, config.anthropic_model, systemPrompt, truncatedText);
                }
                break;

            case 'gemini':
                if (!config.gemini_api_key) {
                    console.warn('[LLM Adapter] Gemini provider selected but no API key configured. Falling back to mock.');
                    result = generateMockAnalysis(text, 'gemini');
                } else {
                    result = await callGemini(config.gemini_api_key, config.gemini_model, systemPrompt, truncatedText);
                }
                break;

            case 'groq':
                if (!config.groq_api_key) {
                    console.warn('[LLM Adapter] Groq provider selected but no API key configured. Falling back to mock.');
                    result = generateMockAnalysis(text, 'groq');
                } else {
                    result = await callGroq(config.groq_api_key, config.groq_model, systemPrompt, truncatedText);
                }
                break;

            case 'mock':
            default:
                // Simulate network latency
                await new Promise(resolve => setTimeout(resolve, 800));
                result = generateMockAnalysis(text, 'mock');
                break;
        }

        // Validate and normalize response
        const normalizedResult = validateAndNormalizeResponse(result, provider);

        console.log(`[LLM Adapter] Analysis completed in ${Date.now() - startTime}ms`);

        return normalizedResult;

    } catch (error) {
        console.error('[LLM Adapter] Analysis failed:', error);

        // Return default/fallback result on error
        return {
            aiRisk: {
                score: 50,
                markers: [{ type: 'warning', message: 'Analysis failed - using fallback scoring' }],
                fragmentAnalysis: 'Error occurred during analysis. Please try again or contact support.'
            },
            citations: {
                score: 50,
                verifiedCount: 0,
                totalCount: 0,
                checkResults: []
            },
            reasoning: {
                score: 50,
                analysis: `Error: ${error.message}`
            }
        };
    }
};

/**
 * Test a provider's API key without making a full analysis
 * @param {string} provider - Provider name (openai, anthropic, gemini, groq)
 * @param {string} apiKey - API key to test
 * @returns {Promise<Object>} - Test result
 */
export const testProviderConnection = async (provider, apiKey) => {
    if (!apiKey) {
        return { success: false, error: 'No API key provided' };
    }

    const testPrompt = "Respond with a simple JSON object: {\"status\": \"ok\"}";
    const testText = "This is a test message.";

    try {
        let result;

        switch (provider) {
            case 'openai':
                result = await callOpenAI(apiKey, 'gpt-4o-mini', testPrompt, testText);
                break;
            case 'anthropic':
                result = await callAnthropic(apiKey, 'claude-3-5-sonnet-20241022', testPrompt, testText);
                break;
            case 'gemini':
                result = await callGemini(apiKey, 'gemini-1.5-flash', testPrompt, testText);
                break;
            case 'groq':
                result = await callGroq(apiKey, 'llama-3.1-70b-versatile', testPrompt, testText);
                break;
            default:
                return { success: false, error: `Unknown provider: ${provider}` };
        }

        return { success: true, message: `Successfully connected to ${provider}` };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

/**
 * Get current LLM configuration status
 * @returns {Promise<Object>} - Configuration status
 */
export const getLLMConfigStatus = async () => {
    const config = await getAllConfig({ decryptSecrets: true, maskSecrets: true });

    return {
        provider: config.llm_provider || 'mock',
        isConfigured: {
            openai: !!config.openai_api_key,
            anthropic: !!config.anthropic_api_key,
            gemini: !!config.gemini_api_key,
            groq: !!config.groq_api_key
        },
        models: {
            openai: config.openai_model,
            anthropic: config.anthropic_model,
            gemini: config.gemini_model,
            groq: config.groq_model
        },
        hasSystemPrompt: !!config.system_prompt
    };
};

export default {
    analyzeSubmissionLLM,
    testProviderConnection,
    getLLMConfigStatus
};
