/**
 * Mock LLM Adapter for Module 09 (LLM Intelligence)
 * Simulates analysis from an LLM (Claude/GPT) for:
 * 1. AI Assistance Risk
 * 2. Citation Sanity
 * 3. Reasoning Depth
 */

export const analyzeSubmissionLLM = async (submissionId) => {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock data normalized for the UI
    return {
        aiRisk: {
            score: 35,
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
            analysis: "High depth. The writer makes non-obvious connections between API security and regional banking regulations. This level of logical synthesis is rare in base LLM outputs.",
        },
    };
};
