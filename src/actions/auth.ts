'use server';

import { z } from 'zod';
import { LoginSchema } from '@/lib/types';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { sendMail } from '@/lib/mail';
import { generateMagicLinkToken } from '@/lib/token';

const COOKIE_NAME = 'ai_bingo_session';

// Simple in-memory rate limiter (for production, use Redis or a proper rate-limit library)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10); // 1 minute
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || '5', 10); // 5 requests per window

function checkRateLimit(identifier: string): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(identifier);

    if (!record || now > record.resetAt) {
        // Reset or create new record
        rateLimitMap.set(identifier, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
        return true;
    }

    if (record.count >= RATE_LIMIT_MAX) {
        return false; // Rate limit exceeded
    }

    record.count++;
    return true;
}

export async function sendMagicLink(formData: z.infer<typeof LoginSchema>) {
    const result = LoginSchema.safeParse(formData);

    if (!result.success) {
        return { success: false, error: 'Invalid email' };
    }

    const { email } = result.data;

    // Rate limiting by email
    if (!checkRateLimit(email)) {
        return {
            success: false,
            error: 'Too many requests. Please try again in a minute.'
        };
    }

    try {
        // Generate secure JWT token
        const token = generateMagicLinkToken(email);

        // Build verification link
        const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const link = `${origin}/verify?token=${token}`;

        // Send email using the mail utility
        const mailResult = await sendMail({
            to: email,
            subject: '🧙‍♂️ Your Magic Link to AI Bingo',
            html: `
                <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #6366f1;">Welcome to AI Bingo Quest!</h2>
                    <p>Click the button below to log in and start your AI learning adventure:</p>
                    <div style="margin: 30px 0;">
                        <a href="${link}" 
                           style="background: #6366f1; color: white; padding: 12px 24px; 
                                  text-decoration: none; border-radius: 6px; display: inline-block;">
                            🚀 Log In to AI Bingo
                        </a>
                    </div>
                    <p style="color: #666; font-size: 14px;">
                        This link will expire in 15 minutes for security.
                    </p>
                    <p style="color: #666; font-size: 14px;">
                        If you didn't request this, you can safely ignore this email.
                    </p>
                </div>
            `,
        });

        if (!mailResult.success) {
            return { success: false, error: mailResult.error };
        }

        console.log('📨 Magic link sent to:', email);
        if (mailResult.previewUrl) {
            console.log('🔗 Preview URL:', mailResult.previewUrl);
        }

        return {
            success: true,
            previewUrl: mailResult.previewUrl
        };

    } catch (error) {
        console.error('Magic link error:', error);
        return { success: false, error: 'Failed to send magic link' };
    }
}


export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
    redirect('/');
}

export async function getSession() {
    const cookieStore = await cookies();
    return cookieStore.get(COOKIE_NAME)?.value;
}
