import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // restricted paths
    const protectedPaths = ['/facilitator', '/game', '/leaderboard'];
    const isProtected = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));

    if (isProtected) {
        const sessionCookie = request.cookies.get('ai_bingo_session');

        if (!sessionCookie) {
            // Redirect to login page if no session cookie
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/facilitator/:path*',
        '/game/:path*',
        '/leaderboard/:path*',
    ],
};
