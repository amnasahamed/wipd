import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { extractTextFromFile } from '@/lib/baseline/processor';
import { calculateStyleMetrics, compareStyles } from '@/lib/intelligence/style-analyzer';
import { analyzeSubmissionLLM } from '@/lib/intelligence/llm-adapter';
import { requireWriter } from '@/lib/auth/session';

export async function POST(request) {
    try {
        const { user: sessionUser, errorResponse } = await requireWriter();
        if (errorResponse) return errorResponse;

        const formData = await request.formData();
        const file = formData.get('file');
        const assignmentId = formData.get('assignmentId');
        const writerIdFromBody = formData.get('writerId');
        const writerUserId = sessionUser.id;

        if (!file || !assignmentId || !writerUserId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (writerIdFromBody && writerIdFromBody !== writerUserId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // 1. Text Extraction
        let text = "";
        try {
            text = await extractTextFromFile(file);
        } catch (e) {
            console.error("Extraction failed:", e);
            return NextResponse.json({ error: e.message || "File extraction failed" }, { status: 400 });
        }

        if (!text || text.trim().length === 0) {
            return NextResponse.json({ error: "Extracted text is empty" }, { status: 400 });
        }

        // 2. Fetch Writer Profile & Baseline
        // writerUserId is the User.id from frontend session. We need Profile ID.
        const profile = await prisma.profile.findUnique({
            where: { userId: writerUserId }
        });

        if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

        // Ensure assignment exists and belongs to the writer
        const assignment = await prisma.assignment.findUnique({
            where: { id: assignmentId },
            select: { id: true, writerId: true, status: true }
        });

        if (!assignment) return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
        if (assignment.writerId !== profile.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        if (assignment.status === 'COMPLETED') {
            return NextResponse.json({ error: "Assignment is already completed" }, { status: 400 });
        }

        // Prevent resubmission unless admin requested a rewrite
        const latestExisting = await prisma.submission.findFirst({
            where: { assignmentId },
            orderBy: { createdAt: 'desc' },
            select: { id: true, status: true, createdAt: true }
        });

        if (latestExisting && latestExisting.status !== 'NEEDS_REWRITE') {
            return NextResponse.json(
                { error: `Cannot submit again while latest submission is ${latestExisting.status}` },
                { status: 400 }
            );
        }

        // 3. Style Analysis (Fingerprinting)
        const currentMetrics = calculateStyleMetrics(text);
        let integrityScore = 100;
        let signals = [];

        if (profile.baselineMetrics && currentMetrics) {
            const baseline = JSON.parse(profile.baselineMetrics);
            integrityScore = compareStyles(baseline, currentMetrics);

            if (integrityScore < 70) {
                signals.push({ type: 'warning', message: `Style Mismatch detected (Score: ${integrityScore}%)` });
            } else {
                signals.push({ type: 'positive', message: `Style matches baseline (Score: ${integrityScore}%)` });
            }
        } else {
            signals.push({ type: 'neutral', message: 'No baseline established for comparison' });
        }

        // 4. Create submission record
        const submission = await prisma.submission.create({
            data: {
                assignmentId,
                writerId: profile.id, // Link to Profile ID
                content: text,
                status: "PENDING_REVIEW",
                integrityScore: integrityScore,
                aiRiskScore: 0, // Placeholder, will be updated by LLM async
                createdAt: new Date()
            }
        });

        // 5. Trigger LLM Analysis (Async in real world, awaited here for demo simplicity)
        // We do this AFTER submission creation so we have an ID
        const llmResult = await analyzeSubmissionLLM(submission.id);

        // Update with LLM results
        await prisma.submission.update({
            where: { id: submission.id },
            data: {
                aiRiskScore: llmResult.aiRisk.score,
            }
        });

        // Create detailed analysis record
        await prisma.analysisResult.create({
            data: {
                submissionId: submission.id,
                signals: JSON.stringify([...signals, ...llmResult.aiRisk.markers]),
                reasoning: llmResult.reasoning.analysis
            }
        });

        // Update assignment status
        await prisma.assignment.update({
            where: { id: assignmentId },
            // Keep assignment open until admin approval
            data: { status: 'IN_PROGRESS' }
        });

        return NextResponse.json({
            success: true,
            submissionId: submission.id,
            status: "analyzed",
            integrityScore,
            message: "File uploaded and integrity analysis completed"
        });
    } catch (error) {
        console.error('Submission upload error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
