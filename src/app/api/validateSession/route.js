import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { NextResponse } from "next/server";

const adminApp = getApps().length === 0 ? initializeApp({ credential: cert(JSON.parse(process.env.ADMIN_SECRET)), }) : getApps()[0];

const auth = getAuth(adminApp);

export async function POST(request) {

    const { session } = await request.json();
    if (!session) return new Response('No token', { status: 401 });

    try {
        await auth.verifySessionCookie(session, true);
        return new NextResponse('Valid session', { status: 200 });
    } catch (err) {
        return new NextResponse('Invalid session', { status: 403 });
    }
}
