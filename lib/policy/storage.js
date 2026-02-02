/**
 * Mock Policy Storage for Module 03 (Policy & Compliance)
 */

export const policies = [
    {
        version: "1.0",
        lastUpdated: "2026-01-01T00:00:00Z",
        content: "All content must be original and free of AI-generated artifacts without disclosure...",
        rules: [
            "No direct copy-pasting from sources.",
            "Citations must follow APA or MLA standards as requested.",
            "Internal similarity should not exceed 10%."
        ]
    },
    {
        version: "1.1",
        lastUpdated: "2026-02-01T00:00:00Z",
        content: "Updated AI disclosure policy: Any use of LLMs for outlining or research must be logged.",
        rules: [
            "No direct copy-pasting from sources.",
            "Citations must follow APA or MLA standards as requested.",
            "Internal similarity should not exceed 10%.",
            "LLM logs must be provided upon request."
        ]
    }
];

export const getCurrentPolicy = () => policies[policies.length - 1];

export const getPolicyByVersion = (version) => policies.find(p => p.version === version);
