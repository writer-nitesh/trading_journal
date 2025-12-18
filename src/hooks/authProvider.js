'use client'

import { useEffect } from 'react';
import useGlobalState from './globalState';
import { onUserAuthStateChange } from '@/lib/firebase/database/index';
import { listernUserData } from '@/lib/firebase/database/userData';

export default function AuthProvider() {
    const { user, setUser, setUserData } = useGlobalState();

    useEffect(() => {
        const unsubscribe = onUserAuthStateChange((currentUser) => {
            setUser(currentUser || null);
        });


        return () => unsubscribe();
    }, []);


    useEffect(() => {
        let unsubscribe;

        const startListening = async () => {
            try {
                unsubscribe = await listernUserData((res) => {
                    setUserData(res)
                });
            } catch (error) {
                toast.error(error.message);
            }
        };

        if (user) {
            startListening();
        }

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [user]);

    return null;
}
