'use client'
import { useEffect } from 'react';
import useGlobalState from './globalState';
import { collection, query, where, onSnapshot, getFirestore } from 'firebase/firestore';
import { clientApp } from '@/lib/firebase/index';

const db = getFirestore(clientApp);

export default function DataListener() {
    const { user, setData, setIsDataLoading: setLoading } = useGlobalState()

    useEffect(() => {
        if (!user?.uid) {
            setData([]); // Clear data when no user
            setLoading(false);
            return;
        }

        setLoading(true);

        const q = query(
            collection(db, 'journal'),
            where('userId', '==', user.uid)
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const result = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                console.log("Journal data:", result);

                setData(result);
                setLoading(false);
            },
            (error) => {
                console.error('Error listening to journal data:', error);
                setData([]); // Clear data on error
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user?.uid, setData, setLoading]); // Added missing dependencies

    return null;
}