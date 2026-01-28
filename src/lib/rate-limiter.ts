import { LRUCache } from 'lru-cache';

/**
 * Rate limit configuration for different actions
 */
type RateLimitConfig = {
    maxRequests: number;    // Max actions allowed
    windowMs: number;       // Time window in milliseconds
};

/**
 * Rate limit rules per action type
 */
const configs: Record<string, RateLimitConfig> = {
    unlockComponent: { maxRequests: 10, windowMs: 60_000 },      // 10 per minute
    markComplete: { maxRequests: 30, windowMs: 60_000 },         // 30 per minute
    createSession: { maxRequests: 5, windowMs: 3600_000 },       // 5 per hour
    joinSession: { maxRequests: 10, windowMs: 60_000 },          // 10 per minute
};

/**
 * Cache to store rate limit state
 * Key: userId:action
 * Value: { count, resetAt }
 */
const cache = new LRUCache<string, { count: number; resetAt: number }>({
    max: 10000,         // Max 10K unique user-action combinations
    ttl: 3600_000,      // Expire after 1 hour
});

/**
 * Check if a user action is within rate limits
 * 
 * @param userId - Unique identifier for the user (participant ID)
 * @param action - Action type being performed
 * @returns Object with allowed status and optional retryAfter seconds
 */
export async function checkRateLimit(
    userId: string,
    action: keyof typeof configs
): Promise<{ allowed: boolean; retryAfter?: number }> {
    const config = configs[action];

    if (!config) {
        // Unknown action, allow by default
        console.warn(`Unknown rate limit action: ${action}`);
        return { allowed: true };
    }

    const key = `${userId}:${action}`;
    const now = Date.now();

    const record = cache.get(key);

    if (!record || now > record.resetAt) {
        // First request or window expired - reset counter
        cache.set(key, { count: 1, resetAt: now + config.windowMs });
        return { allowed: true };
    }

    if (record.count >= config.maxRequests) {
        // Rate limit exceeded
        const retryAfter = Math.ceil((record.resetAt - now) / 1000); // Convert to seconds
        console.warn(`Rate limit exceeded: ${userId} - ${action} (retry in ${retryAfter}s)`);
        return { allowed: false, retryAfter };
    }

    // Increment count
    cache.set(key, { count: record.count + 1, resetAt: record.resetAt });
    return { allowed: true };
}

/**
 * Get current rate limit status for a user action (for displaying limits to users)
 */
export function getRateLimitStatus(userId: string, action: keyof typeof configs) {
    const config = configs[action];
    if (!config) return null;

    const key = `${userId}:${action}`;
    const record = cache.get(key);
    const now = Date.now();

    if (!record || now > record.resetAt) {
        return {
            remaining: config.maxRequests,
            total: config.maxRequests,
            resetAt: now + config.windowMs,
        };
    }

    return {
        remaining: Math.max(0, config.maxRequests - record.count),
        total: config.maxRequests,
        resetAt: record.resetAt,
    };
}
