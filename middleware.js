import { NextResponse } from 'next/server'

export function middleware(request) {
    const authToken = request.cookies.get('auth-token')
    const { pathname } = request.nextUrl

    // Define protected routes
    const isAdminRoute = pathname.startsWith('/admin')
    const isWriterRoute = pathname.startsWith('/writer')

    if (isAdminRoute || isWriterRoute) {
        if (!authToken) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        try {
            const user = JSON.parse(authToken.value)

            if (isAdminRoute && user.role !== 'ADMIN') {
                return NextResponse.redirect(new URL('/login', request.url)) // Or 403 page
            }

            if (isWriterRoute && user.role !== 'WRITER') {
                // Allow admins to view writer routes? Maybe not for now to keep it strict
                if (user.role !== 'WRITER') {
                    return NextResponse.redirect(new URL('/login', request.url))
                }
            }

        } catch (e) {
            // If token is invalid JSON (legacy or tampered), clear it and redirect
            const response = NextResponse.redirect(new URL('/login', request.url))
            response.cookies.delete('auth-token')
            return response
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*', '/writer/:path*'],
}
