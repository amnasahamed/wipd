import prisma from '@/lib/prisma';

/**
 * LLM Adapter for Module 09 (LLM Intelligence)
 * dynamically configured via Admin Settings
 */

export const analyzeSubmissionLLM = async (submissionId) => {
    // 1. Fetch Configuration
    const configs = await prisma.systemConfig.findMany({
        where: {
            key: { in: ['llm_provider', 'openai_api_key', 'anthropic_api_key', 'gemini_api_key', 'groq_api_key', 'system_prompt'] }
        }
    });

    const configMap = configs.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});

    const provider = configMap.llm_provider || 'mock';
    const systemPrompt = configMap.system_prompt || "You are an expert writing analyst. Evaluate this text for AI checking, citation accuracy, and reasoning depth.";

    console.log(`Analyzing submission ${submissionId} with provider: ${provider}`);
    console.log(`Using System Prompt: ${systemPrompt.substring(0, 50)}...`);

    // 2. Mock Implementation Logic
    // In a real environment, this switch statement would dispatch to actual API clients.
    // For this demonstration, we simulate network latency and return varied mock data based on the selected provider.

    console.log("[MOCK] Simulating LLM analysis...");
    await new Promise((resolve) => setTimeout(resolve, 800));

    // switch(provider) {
    //    case 'openai': return callOpenAI(configMap.openai_api_key, systemPrompt, text);
    //    case 'anthropic': return callAnthropic(...);
    //    ...
    // }

    // Return mock data
    return {
        aiRisk: {
            score: provider === 'groq' ? 42 : 35, // Slight variance to prove config effect
            markers: [
                { type: "warning", message: "Repetitive patterns in technical introduction" },
                { type: "neutral", message: "Natural variance in sentence complexity" },
                { type: "positive", message: "Specific localized context for the problem statement" },
            ],
            fragmentAnalysis: "The first 300 words show minimal AI markers. Section 3 (Payment Flow) contains several overly polished transitions typical of model outputs.",
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
};
