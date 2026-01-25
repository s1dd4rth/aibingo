import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
        return NextResponse.redirect(new URL('/?error=Missing Token', request.url));
    }

    try {
        // Simple Base64 decoding (Stateless for demo)
        // In prod, verify a JWT or separate DB token!
        const email = Buffer.from(token, 'base64').toString('utf-8');

        if (!email.includes('@')) {
            return NextResponse.redirect(new URL('/?error=Invalid Token', request.url));
        }

        // Find or Create User
        let user = await prisma.participant.findUnique({
            where: { email },
        });

        if (!user) {
            user = await prisma.participant.create({
                data: {
                    email,
                    passcode: 'magic-link-user', // Dummy passcode
                    name: email.split('@')[0],
                }
            });
        }

        // Set Session
        const cookieStore = await cookies();
        cookieStore.set('ai_bingo_session', user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60 * 4,
        });

        return NextResponse.redirect(new URL('/game', request.url));

    } catch (error) {
        console.error("Link verification failed:", error);
        return NextResponse.redirect(new URL('/?error=Verification Failed', request.url));
    }
}
