import { NextResponse } from 'next/server';
import { extractTextFromFile, createBaselineFromText } from '@/lib/baseline/processor';
import prisma from '@/lib/prisma';

export async function POST(request) {
    const formData = await request.formData();
    const file = formData.get('file');
    const writerId = formData.get('writerId');

    if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!writerId) {
        return NextResponse.json({ error: "Writer ID is required" }, { status: 400 });
    }

    try {
        const text = await extractTextFromFile(file);

        // 1. Create Baseline Logic (Same as before)
        const baseline = createBaselineFromText(text);

        // 2. Persist as a Submission for Admin Review
        // We need an assignment to link to. For onboarding samples, we can:
        // A) Create a "System" assignment for onboarding
        // B) Create a placeholder assignment on the fly
        // C) Allow null assignmentId if schema allowed (it doesn't seems to based on schema)

        // Let's create specific "Onboarding Sample" assignment if it doesn't exist for this user?
        // Or simpler: Just create a "Sample Submission" assignment for this user.

        const assignment = await prisma.assignment.create({
            data: {
                title: `Onboarding Sample (${file.name})`,
                description: "Sample document uploaded during onboarding for style baseline.",
                status: 'COMPLETED',
                writer: { connect: { userId: writerId } }, // Writer relation is on Profile.userId isn't direct?
                // Wait, Schema says: writerId String, writer Profile @relation...
                // So writerId matches Profile.id, NOT User.id?
                // Let's check Schema: Profile.userId @unique. 
                // The frontend likely passes User.id. We need Profile.id.
                deadline: new Date()
            }
        });

        // We need the Profile ID from the User ID
        const userProfile = await prisma.profile.findUnique({
            where: { userId: writerId }
        });

        if (!userProfile) {
            return NextResponse.json({ error: "Writer profile not found" }, { status: 404 });
        }

        // Fix assignment relation (it needs Profile ID, not User ID)
        // Actually I already created it above with `connect: { userId: writerId }`? 
        // No, `writer: Profile`. Profile has `userId` unique field. 
        // formatting: `writer: { connect: { userId: writerId } }` works if connecting via unique field.

        // Now create Submission
        await prisma.submission.create({
            data: {
                assignmentId: assignment.id,
                writerId: userProfile.id,
                content: text,
                fileUrl: "local-storage-placeholder", // In real app, upload to S3/Blob
                status: 'APPROVED', // Auto-approve samples
                integrityScore: 100, // Trusted baseline
            }
        });

        return NextResponse.json({
            success: true,
            writerId,
            baseline,
            message: "Baseline created and sample saved successfully"
        });
    } catch (error) {
        console.error("Baseline upload error:", error);
        return NextResponse.json({ error: "Extraction or save failed" }, { status: 500 });
    }
}
