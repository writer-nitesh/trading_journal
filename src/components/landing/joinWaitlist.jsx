'use client';
import { sendGTMEvent } from '@next/third-parties/google';
import { useRouter } from "next/navigation";
import StyledButton from './styledButton';
import { trackEvent } from '@/lib/mixpanelClient';

export default function JoinWaitlist() {
    const router = useRouter();

    function handleGetFreeJournal() {
        if (typeof window !== 'undefined') {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({ event: 'buttonClicked', buttonName: 'Join Waitlist' });
        }
        sendGTMEvent();
        trackEvent('clicked_on_getfreejournal');
        router.push('#subscribe-form');
    }

    return (
        <div className="flex flex-col gap-5 px-6 sm:px-12 lg:px-40 lg:py-20  items-center justify-center text-lg sm:text-xl lg:text-2xl leading-8 sm:leading-9 lg:leading-10 text-center">
            <p>
                Tradio is India’s simplest trading journal app. Auto-track trades with seamless broker integration from Zerodha, Groww, Dhan and more. Understand strategies, trading psychology, and improve your performance
            </p>
            <StyledButton
                onClick={handleGetFreeJournal}
                ariaLabel="Join waitlist for Tradio trading journal"
            >
                Get free trading journal
            </StyledButton>
        </div>
    );
}