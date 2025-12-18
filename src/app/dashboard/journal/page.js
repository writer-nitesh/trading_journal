'use client'
import { useEffect } from 'react';
import CalenderView from '@/components/journal/calenderView'
import { JournalDataProvider } from '@/components/details/journalDetailsProvider';
import { CalenderDataProvider } from '@/components/journal/calenderDataProvider';
import Details from "@/components/details/index";
import useGlobalState from '@/hooks/globalState';
import { trackEvent } from '@/lib/mixpanelClient';
import { Loader } from '@/components/loader';

export default function Journal() {
    const { user, data, isDataLoading: loading } = useGlobalState()

    useEffect(() => {
        if (user?.uid) {
            trackEvent('viewed_journal');
        }
    }, [user?.uid]);



    if (loading) {
        return <Loader />
    }

    return (
        <div className='flex h-full w-full text-[16px] bg-white dark:bg-neutral-900 text-black dark:text-white pl-2 pr-2'>
            <CalenderDataProvider >
                <JournalDataProvider>
                    <CalenderView data={data} />
                    <Details />
                </JournalDataProvider>
            </CalenderDataProvider>
        </div>
    )
}