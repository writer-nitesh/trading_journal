import { db } from "@/lib/firebase/database";
import { doc, setDoc } from "firebase/firestore";
import { encrypt } from "@/lib/encryption";

export async function POST(req) {
  const { userId, apiKey, apiSecret } = await req.json();
  if (!userId || !apiKey || !apiSecret) {
    return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
  }
  await setDoc(doc(db, "users", userId), {
    angelOneApiKey: encrypt(apiKey),
    angelOneApiSecret: encrypt(apiSecret),
    isConnected: false,
    lastSync: new Date(),
  }, { merge: true });
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
