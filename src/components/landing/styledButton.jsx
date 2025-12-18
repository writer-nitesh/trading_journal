'use client';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function StyledButton({ children, href, onClick, className = '', ariaLabel = '', type = 'button' }) {
    const { resolvedTheme } = useTheme();
    const [boxShadow, setBoxShadow] = useState('');

    useEffect(() => {
        setBoxShadow(
            resolvedTheme === 'dark'
                ? '-3px 3px 0px 0px rgba(255,255,255,1)'
                : '-3px 3px 0px 0px rgba(0,0,0,1)'
        );
    }, [resolvedTheme]);

    const baseClasses = `
        cursor-pointer
        border-2 
        border-black 
        dark:border-white 
        text-black 
        dark:text-white 
        px-4 
        py-2 
        text-sm 
        sm:text-base 
        transition-all 
        hover:-translate-x-[1px] 
        hover:translate-y-[1px] 
        active:translate-y-0 
        active:translate-x-0
        duration-150 
        ease-in-out
    `;

    if (href) {
        return (
            <Link
                href={href}
                aria-label={ariaLabel}
                className={`${baseClasses} ${className}`}
                style={{ boxShadow }}
            >
                {children}
            </Link>
        );
    }

    return (
        <button
            onClick={onClick}
            type={type}
            aria-label={ariaLabel}
            className={`${baseClasses} ${className}`}
            style={{ boxShadow }}
        >
            {children}
        </button>
    );
}
