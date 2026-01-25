import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyMagicLinkToken } from '@/lib/token';

const COOKIE_NAME = 'ai_bingo_session';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
        return NextResponse.redirect(new URL('/?error=missing-token', request.url));
    }

    try {
        // Verify JWT token
        const email = verifyMagicLinkToken(token);

        if (!email) {
            // Token is invalid or expired
            return NextResponse.redirect(new URL('/?error=invalid-token', request.url));
        }

        // Find or create user
        let user = await prisma.participant.findUnique({
            where: { email },
        });

        if (!user) {
            user = await prisma.participant.create({
                data: {
                    email,
                    passcode: 'magic-link-user', // Default session code
                    name: email.split('@')[0],
                }
            });
        }

        // Set secure session cookie
        const cookieStore = await cookies();
        cookieStore.set(COOKIE_NAME, user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        console.log('✅ User authenticated:', email);

        return NextResponse.redirect(new URL('/game', request.url));

    } catch (error) {
        console.error('Verification error:', error);
        return NextResponse.redirect(new URL('/?error=verification-failed', request.url));
    }
}
