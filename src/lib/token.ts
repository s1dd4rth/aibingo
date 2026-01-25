import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const SECRET = process.env.MAGIC_LINK_SECRET || 'dev-secret-change-in-production';
const EXPIRES_IN = process.env.MAGIC_LINK_EXPIRES_IN || '15m';

interface TokenPayload {
    email: string;
    tokenId: string;
    iat?: number;
    exp?: number;
}

/**
 * Generate a secure magic link token for the given email
 */
export function generateMagicLinkToken(email: string): string {
    // Generate cryptographically secure random token ID
    const tokenId = crypto.randomBytes(32).toString('hex');

    // Sign JWT with email and tokenId
    const token = jwt.sign(
        { email, tokenId },
        SECRET,
        { expiresIn: EXPIRES_IN } as jwt.SignOptions
    );

    return token;
}

/**
 * Verify and decode a magic link token
 * Returns the email if valid, null if invalid/expired
 */
export function verifyMagicLinkToken(token: string): string | null {
    try {
        const decoded = jwt.verify(token, SECRET) as TokenPayload;
        return decoded.email;
    } catch (error) {
        // Token is invalid or expired
        console.error('Token verification failed:', error instanceof Error ? error.message : 'Unknown error');
        return null;
    }
}

/**
 * Generate a hash of a token for storage (optional, for revocation support)
 */
export function hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
}
