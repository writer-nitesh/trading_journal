"use server"

import { cookies } from "next/headers";


export async function postSessionLogin(idToken, csrfToken) {
    const cookieStore = cookies();
    const storedCsrfToken = cookieStore.get('csrfToken')?.value;
    console.log("---------------- storedCsrfToken------------------");
    console.log(storedCsrfToken);


    if (!storedCsrfToken || csrfToken !== storedCsrfToken) {
        return { status: 'failed' };
    }

    // Set session expiration to 5 days.
    const expiresIn = 60 * 60 * 24 * 5;

    try {
        // Create the session cookie. This will also verify the ID token in the process.
        const sessionCookie = await getAuth().createSessionCookie(idToken, { expiresIn });

        // Set cookie policy for session cookie.
        cookieStore.set('session', sessionCookie, {
            maxAge: expiresIn,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        });

        return { status: 'success' };
    } catch (error) {
        return { status: 'failed' };
    }
}