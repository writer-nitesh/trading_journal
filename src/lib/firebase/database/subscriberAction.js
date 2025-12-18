import { addDoc, collection, getDocs, getFirestore, query, where } from "firebase/firestore";
import { clientApp } from "..";

const db = getFirestore(clientApp);

export async function createSubscriber(data) {
    try {
        // Step 1: Check if the email already exists
        const q = query(collection(db, "subscribers"), where("email", "==", data.email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            return {
                status: false,
                message: "You have already subscribed.",
            };
        }

        // Step 2: Add new subscriber
        const docRef = await addDoc(collection(db, "subscribers"), {
            ...data,
            created_at: new Date(),
            updated_at: new Date(),
        });

        return {
            status: true,
            message: "Thank you for subscribing",
        };
    } catch (error) {
        throw error;
    }
}

