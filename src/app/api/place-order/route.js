import { db } from "@/lib/firebase/database";
import { doc, getDoc } from "firebase/firestore";
import { decrypt } from "@/lib/encryption";
import { getSmartAPIInstance } from "@/lib/smartapi";

export async function POST(req) {
  const { userId, orderParams } = await req.json();
  const userDoc = await getDoc(doc(db, "users", userId));
  if (!userDoc.exists()) return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
  const { angelOneApiKey, angelOneApiSecret, accessToken } = userDoc.data();
  const smartapi = getSmartAPIInstance(decrypt(angelOneApiKey), decrypt(angelOneApiSecret), accessToken);
  const result = await smartapi.placeOrder(orderParams);
  return new Response(JSON.stringify(result), { status: 200 });
}
