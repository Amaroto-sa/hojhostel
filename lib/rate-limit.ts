/**
 * A simple global in-memory rate limiter for serverless environments.
 * While Vercel isolates containers, this will catch aggressive brute-force
 * loops hitting the same container instance.
 */

const rateLimitMap = new Map<string, { count: number, lastTime: number }>();

export function isIpRateLimited(ip: string, maxRequests: number = 3, windowMs: number = 60000): boolean {
    if (ip === "unknown") return false; // Fail open if IP can't be determined

    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record) {
        rateLimitMap.set(ip, { count: 1, lastTime: now });
        return false;
    }

    if (now - record.lastTime > windowMs) {
        // Window expired, reset
        rateLimitMap.set(ip, { count: 1, lastTime: now });
        return false;
    }

    // Still in same window
    record.count += 1;
    rateLimitMap.set(ip, record);

    return record.count > maxRequests;
}
