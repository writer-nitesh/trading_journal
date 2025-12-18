import { db } from "@/lib/firebase/database";
import { doc, getDoc } from "firebase/firestore";
import { decrypt } from "@/lib/encryption";
import { getSmartAPIInstance } from "@/lib/smartapi";

export async function GET(req) {
  const userId = req.headers.get("x-user-id");
  if (!userId) return new Response(JSON.stringify({ error: "No userId" }), { status: 400 });
  const userDoc = await getDoc(doc(db, "users", userId));
  if (!userDoc.exists()) return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
  const { angelOneApiKey, angelOneApiSecret, accessToken } = userDoc.data();
  const smartapi = getSmartAPIInstance(decrypt(angelOneApiKey), decrypt(angelOneApiSecret), accessToken);
  const profile = await smartapi.getProfile();
  return new Response(JSON.stringify(profile), { status: 200 });
}
