import { NextResponse } from 'next/server';
import { extractTextFromFile, createBaselineFromText } from '@/lib/baseline/processor';

export async function POST(request) {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    try {
        const text = await extractTextFromFile(file);
        const baseline = createBaselineFromText(text);

        return NextResponse.json({
            success: true,
            writerId: formData.get('writerId') || 'anon',
            baseline,
            message: "Baseline created successfully"
        });
    } catch (error) {
        return NextResponse.json({ error: "Extraction failed" }, { status: 500 });
    }
}
