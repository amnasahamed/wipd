import mammoth from "mammoth";

/**
 * Text Extraction and Baseline Logic for Module 05
 */

export const extractTextFromFile = async (file) => {
    try {
        const buffer = Buffer.from(await file.arrayBuffer());

        // Check file type
        const filename = file.name.toLowerCase();

        if (filename.endsWith('.docx')) {
            const result = await mammoth.extractRawText({ buffer });
            return result.value;
        }

        // Fallback for .txt or others (simple decode)
        // For PDF, we'd need 'pdf-parse', but let's stick to docx primarily as requested
        return buffer.toString('utf-8');

    } catch (error) {
        console.error("Text extraction failed:", error);
        throw new Error("Failed to extract text from document");
    }
};

export const createBaselineFromText = (text) => {
    // Simple mock logic for baseline metrics based on real text length
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).length;

    return {
        vocabularyRichness: 0.72, // Placeholder
        avgSentenceLength: Math.round(words / (sentences || 1)),
        passiveVoiceFrequency: "12%",
        topKeywords: ["analysis", "integration", "modular", "system"], // Placeholder
        timestamp: new Date().toISOString()
    };
};
