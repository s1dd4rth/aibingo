import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyMagicLinkToken } from '@/lib/token';

const COOKIE_NAME = 'ai_bingo_session';

export async function GET(request: NextRequest) {
    try {
        console.log('🔍 [Verify] Request received');
        const searchParams = request.nextUrl.searchParams;
        const token = searchParams.get('token');

        if (!token) {
            console.warn('⚠️ [Verify] Missing token');
            return NextResponse.redirect(new URL('/?error=missing-token', request.url));
        }

        // Verify JWT token
        console.log('🔍 [Verify] Verifying token...');
        const email = verifyMagicLinkToken(token)?.toLowerCase();

        if (!email) {
            console.error('❌ [Verify] Token verification returned null');
            return NextResponse.redirect(new URL('/?error=invalid-token', request.url));
        }

        console.log('✅ [Verify] Token verified for email:', email);

        // Find or create user
        console.log('🔍 [Verify] Looking up user in database...');
        let user;
        try {
            user = await prisma.participant.findUnique({
                where: { email },
            });
        } catch (dbError) {
            console.error('❌ [Verify] Database connection failed:', dbError);
            return NextResponse.redirect(new URL('/?error=db-connection-failed', request.url));
        }

        if (!user) {
            console.log('📝 [Verify] Creating new user...');
            try {
                user = await prisma.participant.create({
                    data: {
                        email,
                        passcode: 'magic-link-user', // Default session code
                        name: email.split('@')[0],
                    }
                });
            } catch (createError) {
                console.error('❌ [Verify] Failed to create user:', createError);
                return NextResponse.redirect(new URL('/?error=user-creation-failed', request.url));
            }
        }

        console.log('✅ [Verify] User found/created:', user.id);

        // Set secure session cookie
        const cookieStore = await cookies();
        cookieStore.set(COOKIE_NAME, user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        console.log('✅ [Verify] User authenticated:', email);

        return NextResponse.redirect(new URL('/game', request.url));

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ [Verify] Critical Unhandled Error:', error);
        console.error('Error details:', {
            message: errorMessage,
            stack: error instanceof Error ? error.stack : undefined,
        });
        return NextResponse.redirect(new URL(`/?error=server-error&details=${encodeURIComponent(errorMessage)}`, request.url));
    }
}
