import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, setDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where, orderBy, limit, arrayUnion } from 'firebase/firestore';
import { clientApp } from '../lib/firebase/';
import { getCurrentUserAsync, getCurrentUserId } from './firebase/database/index';

const collectionName = "phone"

export const db = getFirestore(clientApp);

export async function createPhoneData(data, id = null) {
    try {
        const user = await getCurrentUserAsync();

        if (id) {
            const docRef = doc(db, collectionName, id);
            await setDoc(docRef, {
                number: data.phone,
                verified: true,
                userId: user.uid,
            });
            return docRef.id;
        }
        throw new Error("Id is missing")
    } catch (error) {
        console.error("Error creating user data:", error);
        throw error;
    }
}

export async function getPhoneData() {
    try {
        const userId = await getCurrentUserId();
        const q = query(
            collection(db, collectionName),
            where("userId", "==", userId)
        );

        const querySnapshot = await getDocs(q);
        const userDocuments = [];

        querySnapshot.forEach((doc) => {
            userDocuments.push({ id: doc.id, ...doc.data() });
        });

        return userDocuments;
    } catch (error) {
        console.error("Error getting user data: ", error);
        throw error;
    }
}