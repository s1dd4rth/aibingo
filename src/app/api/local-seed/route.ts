import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    if (secret !== 'workshop-admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const user = await prisma.participant.upsert({
            where: { email: 'student@example.com' },
            update: {},
            create: {
                email: 'student@example.com',
                passcode: 'workshop2026',
                name: 'Test Student',
                unlockedComponentIds: "",
            },
        });

        return NextResponse.json({ success: true, user });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to seed', details: String(error) }, { status: 500 });
    }
}
