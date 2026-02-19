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
        console.log('🔍 Attempting to verify token...');
        const email = verifyMagicLinkToken(token)?.toLowerCase();

        if (!email) {
            // Token is invalid or expired
            console.error('❌ Token verification returned null');
            return NextResponse.redirect(new URL('/?error=invalid-token', request.url));
        }

        console.log('✅ Token verified for email:', email);

        // Find or create user
        console.log('🔍 Looking up user in database...');
        let user = await prisma.participant.findUnique({
            where: { email },
        });

        if (!user) {
            console.log('📝 Creating new user...');
            user = await prisma.participant.create({
                data: {
                    email,
                    passcode: 'magic-link-user', // Default session code
                    name: email.split('@')[0],
                }
            });
        }

        console.log('✅ User found/created:', user.id);

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

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Verification error:', error);
        console.error('Error details:', {
            message: errorMessage,
            stack: error instanceof Error ? error.stack : undefined,
        });
        return NextResponse.redirect(new URL(`/?error=verification-failed&details=${encodeURIComponent(errorMessage)}`, request.url));
    }
}
