/**
 * Style Analyzer for Module 08 (Integrity Analysis)
 * Calculates linguistic fingerprints and compares them.
 */

/**
 * Calculates a style fingerprint from text
 * @param {string} text 
 * @returns {Object} metrics
 */
export const calculateStyleMetrics = (text) => {
    if (!text || text.length < 50) return null;

    const words = text.match(/\b\w+\b/g) || [];
    const sentences = text.match(/[.!?]+/g) || [];
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));

    const wordCount = words.length || 1;
    const sentenceCount = sentences.length || 1;

    // 1. Avg Sentence Length (words per sentence)
    const avgSentenceLength = wordCount / sentenceCount;

    // 2. Vocabulary Richness (Type-Token Ratio)
    // Measures lexical diversity. Lower for simpler texts.
    const vocabRichness = uniqueWords.size / wordCount;

    // 3. Readability (Simplified Flesch-Kincaid approximation)
    // Using avg letters per word as proxy for syllables
    const letters = words.join('').length;
    const avgLettersPerWord = letters / wordCount;
    // Heuristic score (not exact formula but consistent for comparison)
    const readabilityScore = (0.39 * avgSentenceLength) + (11.8 * avgLettersPerWord) - 15.59;

    return {
        avgSentenceLength: parseFloat(avgSentenceLength.toFixed(2)),
        vocabRichness: parseFloat(vocabRichness.toFixed(3)),
        readabilityScore: parseFloat(readabilityScore.toFixed(2)),
        wordCount,
        timestamp: new Date().toISOString()
    };
};

/**
 * Compares a submission against a baseline
 * @param {Object} baseline 
 * @param {Object} current 
 * @returns {number} integrityScore (0-100)
 */
export const compareStyles = (baseline, current) => {
    if (!baseline || !current) return 50; // Neutral if no baseline

    let score = 100;

    // 1. Sentence Length Deviation
    const lengthDiff = Math.abs(baseline.avgSentenceLength - current.avgSentenceLength);
    // Tolerate deviation of 5 words. Penalize 2 points per word beyond that.
    if (lengthDiff > 5) {
        score -= (lengthDiff - 5) * 2;
    }

    // 2. Vocab Richness Deviation
    const vocabDiff = Math.abs(baseline.vocabRichness - current.vocabRichness);
    // Tolerate 0.1 diff. Penalize heavily for significant drops (simplification).
    if (vocabDiff > 0.1) {
        score -= (vocabDiff * 100);
    }

    // 3. Readability Deviation
    const readDiff = Math.abs(baseline.readabilityScore - current.readabilityScore);
    // Tolerate 2 grade levels.
    if (readDiff > 2) {
        score -= (readDiff * 5);
    }

    // Cap score between 0 and 100
    return Math.max(0, Math.min(100, Math.round(score)));
};
