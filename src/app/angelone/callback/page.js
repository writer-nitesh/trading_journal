'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useAngelSession from '../../../hooks/useAngelSession';
import { db } from '@/lib/firebase/database';
import { doc, setDoc } from 'firebase/firestore';
// import { toast } from '../../components/ui/sonner'; // Uncomment if using sonner

export default function AngelOneCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, setError } = useAngelSession();
  const [totp, setTotp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorState, setErrorState] = useState(null);
  const [status, setStatus] = useState('pending');

  const auth_token = searchParams.get('auth_token');
  const feed_token = searchParams.get('feed_token');
  const userId = typeof window !== "undefined" ? localStorage.getItem('userId') : null;

  useEffect(() => {
    if (!auth_token) {
      setErrorState('Missing auth_token in URL.');
      setStatus('error');
      return;
    }
  }, [auth_token]);

  useEffect(() => {
    // 1. Extract token from URL
    console.log('Callback: auth_token:', auth_token);
    console.log('Callback: userId:', userId);

    if (!auth_token) {
      setErrorState('Missing auth_token in URL.');
      setStatus('error');
      return;
    }
    if (!userId) {
      setErrorState('Missing userId. Make sure you are logged in and userId is set in localStorage.');
      setStatus('error');
      return;
    }

    // 3. Save token to Firestore
    setDoc(doc(db, 'credentials', userId), {
      access_token: auth_token,
      feed_token,
      updated_at: new Date(),
    }, { merge: true })
      .then(() => {
        setStatus('success');
        router.push('/dashboard');
      })
      .catch((err) => {
        setError('Failed to save tokens: ' + err.message);
        setErrorState(err.message);
        setStatus('error');
      });
  }, [searchParams, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorState(null);

    const userId = typeof window !== "undefined" ? localStorage.getItem('userId') : null;
    if (!userId) {
      setErrorState('Missing userId. Make sure you are logged in and userId is set in localStorage.');
      setLoading(false);
      return;
    }

    try {
      // Save tokens to Firestore
      await setDoc(doc(db, 'credentials', userId), {
        access_token: auth_token,
        feed_token,
        updated_at: new Date(),
      }, { merge: true });

      // Continue with session creation
      const res = await fetch('/api/angelone/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth_token,
          feed_token,
          client_code: process.env.NEXT_PUBLIC_ANGEL_CLIENT_CODE || 'AAAO739722',
          api_key: process.env.NEXT_PUBLIC_ANGEL_API_KEY || 'm5dcULU3',
          secret_key: process.env.NEXT_PUBLIC_ANGEL_SECRET_KEY || '876a132f-48b6-4f33-b079-5c6e1528251d',
          totp,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Session creation failed');
      login(process.env.NEXT_PUBLIC_ANGEL_CLIENT_CODE || 'AAAO739722');
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
      setErrorState(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'pending') return <div>Logging you in...</div>;
  if (status === 'success') return <div>Login successful! Redirecting...</div>;
  if (errorState) return <div className="text-red-500">{errorState}</div>;
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">AngelOne Login Callback</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            className="border rounded px-3 py-2"
            placeholder="Enter TOTP (from Authenticator app)"
            value={totp}
            onChange={e => setTotp(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Connecting...' : 'Complete Login'}
          </button>
        </form>
      </div>
    </div>
  );
} 