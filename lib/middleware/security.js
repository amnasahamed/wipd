/**
 * Security Middleware - Adds security headers and CSRF protection
 * Production-hardened security configurations
 */

import { NextResponse } from 'next/server';

/**
 * Security headers to add to all responses
 */
export const securityHeaders = {
    // Prevent clickjacking
    'X-Frame-Options': 'DENY',
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    // XSS Protection (legacy browsers)
    'X-XSS-Protection': '1; mode=block',
    // Referrer Policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    // Content Security Policy
    'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-eval for dev
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' blob: data:",
        "font-src 'self'",
        "connect-src 'self'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
    ].join('; '),
    // Permissions Policy
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    // Strict Transport Security (HSTS) - only in production
    ...(process.env.NODE_ENV === 'production' && {
        'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload'
    }),
    // Remove server identification
    'X-DNS-Prefetch-Control': 'on',
};

/**
 * Simple in-memory rate limiter
 * In production, use Redis for distributed rate limiting
 */
const rateLimitStore = new Map();

export function rateLimit(request, options = {}) {
    const { max = 100, windowMs = 60000, keyGenerator } = options;
    
    // Generate key based on IP + path
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const path = new URL(request.url).pathname;
    const key = keyGenerator ? keyGenerator(request) : `${ip}:${path}`;
    
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get or create rate limit entry
    let entry = rateLimitStore.get(key);
    if (!entry) {
        entry = { count: 0, resetTime: now + windowMs };
        rateLimitStore.set(key, entry);
    }
    
    // Reset if window has passed
    if (now > entry.resetTime) {
        entry.count = 0;
        entry.resetTime = now + windowMs;
    }
    
    entry.count++;
    
    // Cleanup old entries periodically
    if (Math.random() < 0.001) {
        cleanupRateLimitStore();
    }
    
    const remaining = Math.max(0, max - entry.count);
    const resetIn = Math.ceil((entry.resetTime - now) / 1000);
    
    return {
        allowed: entry.count <= max,
        limit: max,
        remaining,
        resetIn,
        headers: {
            'X-RateLimit-Limit': max.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': resetIn.toString(),
        }
    };
}

function cleanupRateLimitStore() {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
        if (now > entry.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(response) {
    Object.entries(securityHeaders).forEach(([key, value]) => {
        if (value) {
            response.headers.set(key, value);
        }
    });
    return response;
}

/**
 * Validate CSRF token for state-changing operations
 * In production, use double-submit cookie pattern or synchronized tokens
 */
export function validateCSRF(request) {
    // Skip CSRF for safe methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
        return { valid: true };
    }
    
    // For API routes, check Origin/Referer headers
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const host = request.headers.get('host');
    
    // In production, validate origin matches expected domain
    if (process.env.NODE_ENV === 'production') {
        const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
        
        if (origin && !allowedOrigins.some(allowed => origin.startsWith(allowed))) {
            return { valid: false, error: 'Invalid origin' };
        }
        
        if (!origin && !referer) {
            return { valid: false, error: 'Missing origin/referer headers' };
        }
    }
    
    return { valid: true };
}
