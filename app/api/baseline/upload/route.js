import { NextResponse } from 'next/server';
import { extractTextFromFile } from '@/lib/baseline/processor';
import { calculateStyleMetrics } from '@/lib/intelligence/style-analyzer';
import prisma from '@/lib/prisma';
import { requireWriter } from '@/lib/auth/session';

export async function POST(request) {
    const { user: sessionUser, errorResponse } = await requireWriter();
    if (errorResponse) return errorResponse;

    const formData = await request.formData();
    const file = formData.get('file');
    const writerId = sessionUser.id;
    const writerIdFromBody = formData.get('writerId');

    if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (writerIdFromBody && writerIdFromBody !== writerId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        // 1) Resolve writer profile (writerId is the User.id)
        const profile = await prisma.profile.findUnique({ where: { userId: writerId } });
        if (!profile) return NextResponse.json({ error: "Writer profile not found" }, { status: 404 });

        // 2) Extract text & compute per-sample style metrics
        const text = await extractTextFromFile(file);
        const sampleMetrics = calculateStyleMetrics(text);

        if (!sampleMetrics) {
            return NextResponse.json(
                { error: "Sample text is too short to establish a baseline" },
                { status: 400 }
            );
        }

        // 3) Aggregate into the writer baseline stored on Profile.baselineMetrics
        const round = (value, decimals) => Number.parseFloat(value.toFixed(decimals));
        let updatedBaseline = {
            avgSentenceLength: sampleMetrics.avgSentenceLength,
            vocabRichness: sampleMetrics.vocabRichness,
            readabilityScore: sampleMetrics.readabilityScore,
            sampleCount: 1,
            updatedAt: new Date().toISOString(),
        };

        if (profile.baselineMetrics) {
            try {
                const existing = JSON.parse(profile.baselineMetrics);
                const parsedCount = Number(existing?.sampleCount);
                const count = Number.isFinite(parsedCount) && parsedCount > 0 ? parsedCount : 1;
                const nextCount = count + 1;

                updatedBaseline = {
                    avgSentenceLength: round(
                        ((existing.avgSentenceLength ?? sampleMetrics.avgSentenceLength) * count +
                            sampleMetrics.avgSentenceLength) /
                            nextCount,
                        2
                    ),
                    vocabRichness: round(
                        ((existing.vocabRichness ?? sampleMetrics.vocabRichness) * count + sampleMetrics.vocabRichness) /
                            nextCount,
                        3
                    ),
                    readabilityScore: round(
                        ((existing.readabilityScore ?? sampleMetrics.readabilityScore) * count +
                            sampleMetrics.readabilityScore) /
                            nextCount,
                        2
                    ),
                    sampleCount: nextCount,
                    updatedAt: new Date().toISOString(),
                };
            } catch {
                // If baselineMetrics is corrupted, overwrite it with the current sample.
                updatedBaseline = {
                    avgSentenceLength: sampleMetrics.avgSentenceLength,
                    vocabRichness: sampleMetrics.vocabRichness,
                    readabilityScore: sampleMetrics.readabilityScore,
                    sampleCount: 1,
                    updatedAt: new Date().toISOString(),
                };
            }
        }

        await prisma.$transaction(async (tx) => {
            await tx.profile.update({
                where: { id: profile.id },
                data: { baselineMetrics: JSON.stringify(updatedBaseline) },
            });

            // 4) Persist the sample as an approved submission (auditability)
            const assignment = await tx.assignment.create({
                data: {
                    title: `Onboarding Sample (${file.name})`,
                    description: "Sample document uploaded during onboarding for style baseline.",
                    status: "COMPLETED",
                    writer: { connect: { id: profile.id } },
                    deadline: new Date(),
                },
            });

            await tx.submission.create({
                data: {
                    assignmentId: assignment.id,
                    writerId: profile.id,
                    content: text,
                    fileUrl: "local-storage-placeholder",
                    status: "APPROVED",
                    integrityScore: 100,
                    aiRiskScore: 0,
                },
            });

            await tx.auditLog.create({
                data: {
                    userId: writerId,
                    entityType: "PROFILE",
                    entityId: profile.id,
                    action: "BASELINE_UPDATE",
                    details: JSON.stringify({
                        fileName: file.name,
                        sampleWordCount: sampleMetrics.wordCount,
                        baseline: updatedBaseline,
                    }),
                },
            });
        });

        return NextResponse.json({
            success: true,
            writerId,
            profileId: profile.id,
            baseline: updatedBaseline,
            message: "Baseline updated and sample saved successfully",
        });
    } catch (error) {
        console.error("Baseline upload error:", error);
        return NextResponse.json({ error: "Extraction or save failed" }, { status: 500 });
    }
}
