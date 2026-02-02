import { NextResponse } from 'next/server';
import { getCurrentPolicy } from '@/lib/policy/storage';

export async function GET() {
    const policy = getCurrentPolicy();
    return NextResponse.json(policy);
}
