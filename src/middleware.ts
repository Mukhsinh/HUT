import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const authSession = request.cookies.get('auth_session');
    const isLoginPage = request.nextUrl.pathname.startsWith('/login');

    // 1. If trying to access app without session, redirect to login
    if (!authSession && !isLoginPage) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 2. If already logged in and trying to go to login, redirect to home
    if (authSession && isLoginPage) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    // Protected routes (include all except api, static files, and images)
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
