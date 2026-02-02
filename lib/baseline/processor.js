/**
 * Mock Text Extraction and Baseline Logic for Module 05
 */

export const extractTextFromFile = async (file) => {
    // In a real app, we'd use 'mammoth' or 'pdf-parse'
    // Simulating extraction delay
    await new Promise(r => setTimeout(r, 1000));

    return `This is a sample extracted text from ${file.name}. It contains multiple sentences to simulate a writer's baseline style. The vocabulary used is varied and the sentence structure shows complexity.`;
};

export const createBaselineFromText = (text) => {
    return {
        vocabularyRichness: 0.72,
        avgSentenceLength: 18.5,
        passiveVoiceFrequency: "12%",
        topKeywords: ["analysis", "integration", "modular", "system"],
        timestamp: new Date().toISOString()
    };
};
