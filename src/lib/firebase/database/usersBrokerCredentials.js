import { db, getCurrentUserId } from "./index";
import { collection, where, onSnapshot, query } from 'firebase/firestore';


export async function listenToUserCredentials(callback) {
    const userId = await getCurrentUserId();

    const q = query(collection(db, "credentials"), where("userId", "==", userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const credentials = snapshot.docs.map((doc) => doc.data());
        callback(credentials[0]?.credential || []);
    });
    return unsubscribe;
}