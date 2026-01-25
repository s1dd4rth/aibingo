import nodemailer from 'nodemailer';

interface MailOptions {
    to: string;
    subject: string;
    html: string;
}

interface SendMailResult {
    success: boolean;
    previewUrl?: string;
    error?: string;
}

let transporter: nodemailer.Transporter | null = null;

async function getTransporter() {
    if (transporter) return transporter;

    const isDev = process.env.NODE_ENV !== 'production';

    if (isDev) {
        // Use Ethereal for development
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
    } else {
        // Use production SMTP from environment variables
        if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
            throw new Error('SMTP configuration missing. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS.');
        }

        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587', 10),
            secure: process.env.SMTP_PORT === '465',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    return transporter;
}

export async function sendMail(options: MailOptions): Promise<SendMailResult> {
    try {
        const transport = await getTransporter();
        const isDev = process.env.NODE_ENV !== 'production';

        const info = await transport.sendMail({
            from: process.env.EMAIL_FROM || 'noreply@example.com',
            to: options.to,
            subject: options.subject,
            html: options.html,
        });

        // Return preview URL for Ethereal in development
        if (isDev) {
            return {
                success: true,
                previewUrl: nodemailer.getTestMessageUrl(info) || undefined,
            };
        }

        return { success: true };
    } catch (error) {
        console.error('Email sending error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to send email',
        };
    }
}
