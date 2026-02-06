import mammoth from "mammoth";

/**
 * Text Extraction Logic
 */

export const extractTextFromFile = async (file) => {
    try {
        const buffer = Buffer.from(await file.arrayBuffer());

        // Check file type
        const filename = file.name.toLowerCase();

        if (filename.endsWith('.docx')) {
            const result = await mammoth.extractRawText({ buffer });
            return result.value;
        } else if (filename.endsWith('.txt')) {
            return buffer.toString('utf-8');
        }

        throw new Error("Unsupported file type. Only .docx and .txt are supported.");

    } catch (error) {
        console.error("Text extraction failed:", error);
        // Re-throw with the specific error message if it's our "Unsupported file type" error
        throw new Error(error.message || "Failed to extract text from document");
    }
};
