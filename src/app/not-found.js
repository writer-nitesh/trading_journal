'use client'
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function NotFound() {
    const router = useRouter();
    useEffect(() => {
        router.push('/');
    }, []);

    return (
        <div className='flex flex-col gap-4 justify-center items-center h-screen'>
            <h1 className='text-2xl font-bold'>404 - Page Not Found</h1>
            <p className='text-lg font-light'>Redirecting to dashboard...</p>
        </div>
    )
}