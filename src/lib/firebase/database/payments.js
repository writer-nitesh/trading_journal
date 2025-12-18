import { db, getCurrentUserId } from "./index";
import { collection, doc, setDoc } from "firebase/firestore";

const PAYMENTS_COLLECTION = "payments";

export async function addPaymentsData(data) {
  const userId = await getCurrentUserId();

  // Always create new payment doc with auto-generated ID
  const paymentDocRef = doc(collection(db, PAYMENTS_COLLECTION));
  const documentId = paymentDocRef.id;

  await setDoc(paymentDocRef, {
    userId,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log("New payment record created:", documentId);

  return documentId;
}
