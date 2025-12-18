import { initializeApp, cert, getApps } from "firebase-admin/app";


const serviceAccount = process.env.ADMIN_SECRET;

if (!serviceAccount) {
    throw new Error("ADMIN_SECRET is not defined in the environment.");
}

export const adminApp =
    getApps().length === 0
        ? initializeApp({ credential: cert(JSON.parse(serviceAccount)) })
        : getApps()[0];
