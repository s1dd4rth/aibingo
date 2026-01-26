import { generateMagicLinkToken, verifyMagicLinkToken, hashToken } from '../lib/token';
import jwt from 'jsonwebtoken';

describe('Token Utilities', () => {
    const TEST_EMAIL = 'test@example.com';
    const TEST_SECRET = 'dev-secret-change-in-production'; // Matches default in token.ts

    it('generates a valid JWT token', () => {
        const token = generateMagicLinkToken(TEST_EMAIL);
        expect(token).toBeDefined();

        const decoded = jwt.decode(token) as any;
        expect(decoded.email).toBe(TEST_EMAIL);
        expect(decoded.tokenId).toBeDefined();
    });

    it('verifies a valid token correctly', () => {
        const token = generateMagicLinkToken(TEST_EMAIL);
        const email = verifyMagicLinkToken(token);
        expect(email).toBe(TEST_EMAIL);
    });

    it('returns null for an invalid token', () => {
        const result = verifyMagicLinkToken('invalid-token');
        expect(result).toBeNull();
    });

    it('returns null for an expired token', () => {
        // Create an expired token manually
        const token = jwt.sign(
            { email: TEST_EMAIL, tokenId: '123' },
            TEST_SECRET,
            { expiresIn: '0s' } // Expired immediately
        );

        // Wait briefly to ensure expiration (though 0s usually sufficient)
        return new Promise(resolve => setTimeout(resolve, 100)).then(() => {
            const result = verifyMagicLinkToken(token);
            expect(result).toBeNull();
        });
    });

    it('hashes token consistently', () => {
        const token = 'some-token-string';
        const hash1 = hashToken(token);
        const hash2 = hashToken(token);

        expect(hash1).toBe(hash2);
        expect(hash1).not.toBe(token);
    });
});
