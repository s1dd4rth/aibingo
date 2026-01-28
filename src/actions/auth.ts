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

        // Build verification link (remove trailing slash from origin if present)
        const origin = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
        const link = `${origin}/verify?token=${token}`;

        // Send email using the mail utility
        const mailResult = await sendMail({
            to: email,
            subject: '🧙‍♂️ Your Magic Link to AI Bingo',
            html: `
                <div style="background-color: #0F172A; padding: 40px 20px; font-family: 'Courier New', monospace; color: #F8FAFC;">
                    <div style="max-width: 500px; margin: 0 auto; background-color: #1E293B; border: 1px solid #334155; padding: 30px; box-shadow: 4px 4px 0px 0px rgba(0, 0, 0, 0.5);">
                        <!-- Header -->
                        <div style="margin-bottom: 24px; border-bottom: 1px solid #334155; padding-bottom: 16px;">
                            <div style="color: #06B6D4; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">Authentication Protocol</div>
                            <h1 style="color: #F8FAFC; font-size: 24px; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; letter-spacing: -0.05em;">AI BINGO<span style="color: #F97316;">.QUEST</span></h1>
                        </div>

                        <!-- Content -->
                        <div style="margin-bottom: 30px;">
                            <p style="font-size: 16px; line-height: 1.5; color: #94A3B8; margin-bottom: 24px;">
                                User_Identity verified for access request. Use the secure token below to establish connection.
                            </p>
                            
                            <!-- Button -->
                            <a href="${link}" style="display: block; box-sizing: border-box; width: 100%; text-align: center; background-color: #F97316; color: #0F172A; text-decoration: none; padding: 14px 0; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid #EA580C; box-shadow: 4px 4px 0px 0px rgba(0,0,0,0.5);">
                                Establish_Connection
                            </a>
                        </div>

                        <!-- Footer -->
                        <div style="border-top: 1px solid #334155; padding-top: 16px; font-size: 10px; color: #64748B; text-align: center; text-transform: uppercase;">
                            Token expires in 15 minutes // Do not share
                        </div>
                    </div>
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
