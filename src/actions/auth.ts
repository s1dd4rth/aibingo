'use server';

import { z } from 'zod';
import { LoginSchema } from '@/lib/types';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const COOKIE_NAME = 'ai_bingo_session';

import nodemailer from 'nodemailer';

export async function sendMagicLink(formData: z.infer<typeof LoginSchema>) {
    const result = LoginSchema.safeParse(formData);

    if (!result.success) {
        return { success: false, error: 'Invalid email' };
    }

    const { email } = result.data;

    try {
        // 1. Setup Transporter
        // For "Free Opensource Dev", we use Ethereal (auto-generated test accounts)
        // or look for env vars.
        let transporter;
        let isDev = true;

        if (process.env.SMTP_HOST) {
            transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT || '587'),
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
            isDev = false;
        } else {
            // Auto-generate Ethereal account
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
        }

        // 2. Generate Link
        // Simple Base64 token for this demo
        const token = Buffer.from(email).toString('base64');
        // In dev, we use localhost; in prod, use logic or env var
        const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const link = `${origin}/verify?token=${token}`;

        // 3. Send Email
        const info = await transporter.sendMail({
            from: '"AI Bingo" <login@aibingo.game>',
            to: email,
            subject: '🧙‍♂️ Your Magic Link',
            text: `Click here to login: ${link}`,
            html: `<p>Click here to login: <a href="${link}">${link}</a></p>`,
        });

        // 4. Return Preview URL (If Dev)
        const previewUrl = isDev ? nodemailer.getTestMessageUrl(info) : null;
        console.log("📨 Email sent:", info.messageId);
        if (previewUrl) console.log("🔗 Preview URL:", previewUrl);

        return { success: true, previewUrl };

    } catch (error) {
        console.error('Email error:', error);
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
