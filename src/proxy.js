import { NextResponse } from 'next/server';

export function proxy(request) {
    const path = request.nextUrl.pathname;
    if (path === '/admin/login' || path.startsWith('/admin/login/')) {
        return NextResponse.next();
    }

    if (!request.cookies.has('admin_token')) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Route handlers still verify the JWT signature and expiry.
    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
