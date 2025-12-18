import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const BASE_URL = process.env.BASE_URL;

export async function middleware(request) {

    const currentSession = (await cookies()).get('session')?.value;

    let session = false;

    if (currentSession) {
        try {
            const validateSession = await fetch(`${BASE_URL}/api/validateSession`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session: currentSession }),
            });
            session = validateSession.ok;
        } catch (error) {
            console.log('Session validation failed:', error);
            session = false;
        }
    }


    const pathname = request.nextUrl.pathname;

    if (session && (pathname === '/signup')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (!session && pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/signup', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/signup'],
};
