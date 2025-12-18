import { db, getCurrentUserId } from "./index";
import {
    collection,
    where,
    onSnapshot,
    query,
    getDocs,
    doc,
    setDoc,
    updateDoc,
    arrayUnion
} from "firebase/firestore";

const USERS_COLLECTION = "users"

export async function listernUserData(callback) {
    const userId = await getCurrentUserId();

    const q = query(collection(db, USERS_COLLECTION), where("userId", "==", userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const userData = snapshot.docs.map((doc) => doc.data());
        callback(userData[0] || {});
    });
    return unsubscribe;
}

export async function getUserData(id) {
    try {
        const q = query(
            collection(db, USERS_COLLECTION),
            where("userId", "==", id)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return null; // no user found
        }

        // If you expect only one user per ID:
        return querySnapshot.docs[0].data();

        // If multiple possible:
        // return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
        console.error("Error fetching user data:", err);
        throw err;
    }
}

export async function addUserData(data) {
    const userId = await getCurrentUserId();

    const q = query(
        collection(db, USERS_COLLECTION),
        where("userId", "==", userId)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        const userDocRef = querySnapshot.docs[0].ref;

        const updates = { updatedAt: new Date() };

        if (data.plan) {
            for (const [key, value] of Object.entries(data.plan)) {
                if (key === "paymentDetails") {
                    updates["plan.paymentDetails"] = arrayUnion(...value);
                } else {
                    updates[`plan.${key}`] = value;
                }
            }
        }

        // ✅ Merge other top-level fields
        for (const [key, value] of Object.entries(data)) {
            if (key !== "plan") {
                updates[key] = value;
            }
        }

        await updateDoc(userDocRef, updates);

        console.log("User data updated", updates);
    } else {
        const userDocRef = doc(db, USERS_COLLECTION, userId);

        await setDoc(userDocRef, {
            userId,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data,
            ...(data.plan
                ? {
                    plan: {
                        ...data.plan,
                        paymentDetails: data.plan.paymentDetails || [],
                    },
                }
                : {}),
        });

        console.log("User data created", data);
    }
}
