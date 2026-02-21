import { NextResponse } from 'next/server'
import { securityHeaders, rateLimit, validateCSRF, applySecurityHeaders } from '@/lib/middleware/security'

export function middleware(request) {
    const authToken = request.cookies.get('auth-token')
    const { pathname } = request.nextUrl

    // 1. Apply rate limiting to auth endpoints
    if (pathname === '/api/auth/login' || pathname === '/api/auth/logout') {
        const rateLimitResult = rateLimit(request, { max: 5, windowMs: 60000 }); // 5 attempts per minute
        
        if (!rateLimitResult.allowed) {
            const response = NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            );
            // Add rate limit headers
            Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
                response.headers.set(key, value);
            });
            return applySecurityHeaders(response);
        }
    }

    // 2. CSRF validation for API routes
    if (pathname.startsWith('/api/')) {
        const csrfResult = validateCSRF(request);
        if (!csrfResult.valid) {
            const response = NextResponse.json(
                { error: csrfResult.error || 'Invalid request' },
                { status: 403 }
            );
            return applySecurityHeaders(response);
        }
    }

    // 3. Define protected routes
    const isAdminRoute = pathname.startsWith('/admin')
    const isWriterRoute = pathname.startsWith('/writer')

    if (isAdminRoute || isWriterRoute) {
        if (!authToken) {
            const response = NextResponse.redirect(new URL('/login', request.url))
            return applySecurityHeaders(response)
        }

        try {
            const user = JSON.parse(authToken.value)

            if (isAdminRoute && user.role !== 'ADMIN') {
                const response = NextResponse.redirect(new URL('/login', request.url))
                return applySecurityHeaders(response)
            }

            if (isWriterRoute && user.role !== 'WRITER') {
                if (user.role !== 'WRITER') {
                    const response = NextResponse.redirect(new URL('/login', request.url))
                    return applySecurityHeaders(response)
                }
            }

        } catch (e) {
            // If token is invalid JSON (legacy or tampered), clear it and redirect
            const response = NextResponse.redirect(new URL('/login', request.url))
            response.cookies.delete('auth-token')
            return applySecurityHeaders(response)
        }
    }

    // 4. Add security headers to all responses
    const response = NextResponse.next()
    return applySecurityHeaders(response)
}

export const config = {
    matcher: [
        '/admin/:path*', 
        '/writer/:path*',
        '/api/:path*'
    ],
}
