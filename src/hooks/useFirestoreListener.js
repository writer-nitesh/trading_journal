import { useEffect, useState } from "react";
import { onSnapshot } from "firebase/firestore";
import useGlobalState from "./globalState";

/**
 * Reusable Firestore listener hook.
 * @param {CollectionReference|Query|DocumentReference} ref - Firestore ref.
 * @param {function} parserFn - Optional doc transformer.
 * @returns [data, loading, error]
 */
export function useFirestoreListener(ref, parserFn = (doc) => ({ id: doc.id, ...doc.data() })) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { user } = useGlobalState();

    useEffect(() => {
        if (!user || !ref) {
            setData([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribe = onSnapshot(
            ref,
            (snapshot) => {
                if ("docs" in snapshot) {
                    setData(snapshot.docs.map(parserFn));
                } else {
                    setData(parserFn(snapshot));
                }
                setLoading(false);
            },
            (err) => {
                console.error("Firestore listener error:", err);
                setError(err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [ref, user]);

    return [data, loading, error];
}
