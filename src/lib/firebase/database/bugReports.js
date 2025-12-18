import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";
import { clientApp } from "@/lib/firebase/index";

const db = getFirestore(clientApp);
const storage = getStorage(clientApp);

export async function uploadBugReport(bugText, imageUrl) {
  await addDoc(collection(db, "bugReports"), {
    text: bugText,
    imageUrl,
    createdAt: Timestamp.now(),
  });
}
