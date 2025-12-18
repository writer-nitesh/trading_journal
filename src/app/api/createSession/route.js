import { adminApp } from "@/lib/firebase/admin";
import { getAuth } from "firebase-admin/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";



export async function POST(req) {

    const { idToken } = await req.json();

    const cookieStore = await cookies();
    const expiresIn = 60 * 60 * 24 * 5 * 1000;

    try {
        const sessionCookie = await getAuth(adminApp).createSessionCookie(idToken, { expiresIn });

        const response = NextResponse.json({ status: 'success' });

        cookieStore.set({
            name: 'session',
            value: sessionCookie,
            httpOnly: true,
            secure: true,
            maxAge: expiresIn / 1000,
            path: '/',
        });

        return response;
    } catch (error) {
        return new NextResponse('UNAUTHORIZED REQUEST!', { status: 401 });
    }
}