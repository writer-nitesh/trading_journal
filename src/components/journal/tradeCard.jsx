'use client'
import { Button } from "../ui/button"
import Link from "next/link"
import { Edit } from "lucide-react"
import Image from "next/image"
import { salsaFont, truncateText } from '@/lib/utils';
import { calculatePnLForTrade } from "@/lib/logic"
import { useContext } from "react"
import { CalenderContext } from "./calenderDataProvider"
import { trackEvent } from '@/lib/mixpanelClient';
import { JournalContext } from "../details/journalDetailsProvider"
import { truncate } from "lodash"
import { parseBrokerTimestamp } from "./calenderView"
import Smile from "@/icons/emoji/smile";
import Frown from "@/icons/emoji/frown";
import Angry from "@/icons/emoji/angry"
import Laugh from "@/icons/emoji/laugh"
import Meme from "@/icons/emoji/meme"

export default function TradeCard({ tradeId, data, tradeDate }) {

    const { setSelectedTrade, setSelectedDate } = useContext(JournalContext)
    const { setOpenDialog } = useContext(CalenderContext)

    const pnl = calculatePnLForTrade(data.orders.orders);



    const handleCardClick = () => {
        const parsedDate = parseBrokerTimestamp(tradeDate);
        const formattedDate = `${new Date(parsedDate).getFullYear()}-${new Date(parsedDate).getMonth()}-${new Date(parsedDate).getDate()}`
        console.log(formattedDate, "formattedDate");
        console.log(parsedDate, "parsedDate");

        setSelectedTrade(tradeId);
        setSelectedDate(formattedDate);
        setOpenDialog(true);
    };


    return (
        <div
            onClick={handleCardClick}
            role="button"
            tabIndex={0}
            className={`flex flex-col gap-2 p-2 border cursor-pointer
                ${pnl.type === 'PROFIT' ? 'bg-[#DAF7CA] dark:bg-green-900 border-green-600 dark:border-green-700' : 'bg-[#F7DBCA] dark:bg-red-900 border-[#00000080] dark:border-red-700'}  
                border-neutral-300 dark:border-neutral-700 rounded-md transition-colors duration-300 w-full`}
        >
            <div className='flex justify-between items-center'>
                <p className={`font-bold ${salsaFont.className}`}>
                    {pnl.type === 'PROFIT' && '+'}{pnl.pnl}
                </p>
                <div className="flex gap-2 items-center justify-center">
                    <div className={`bg-white dark:bg-black text-black dark:text-white font-medium rounded py-1 lg:px-2 px-1 lg:text-xs text-[10px]   border border-[#00000080] dark:border-none`}>
                        Trade {parseInt(tradeId.split('_')[1])}
                    </div>
                    <Link href="">
                        <Edit size={20} className="text-black dark:text-white" />
                    </Link>
                </div>
            </div>

            <div className='flex gap-2 items-center justify-between w-full my-2'>
                <Angry />
                <Frown />
                <Smile />
                <Laugh />
                <Meme />
            </div>

            <div className='flex gap-1 sm:gap-2 w-full'>
                <Button
                    onClick={(e) => {
                        e.stopPropagation();
                        trackEvent('clicked_on_card_strategy');
                        handleCardClick();
                    }}
                    className="flex-1 p-1 px-2 sm:p-2 sm:px-3 m-0 border border-[#00000080] dark:border-neutral-600 bg-white dark:bg-black text-black dark:text-white hover:bg-green-50 dark:hover:bg-neutral-800 text-xs sm:text-sm md:text-base min-w-0"
                    variant="ghost"
                >
                   
                   <span className="truncate text-sm ">
{data.orders.strategy ? truncateText(data.orders.strategy, window.innerWidth < 640 ? 6 : 12) : 'Strategy'}
                   </span>
                        
                 
                </Button>

                <Button
                    className="flex-1 p-1 px-2 sm:p-2 sm:px-3 m-0 border border-[#00000080] dark:border-neutral-600 bg-white dark:bg-black text-black dark:text-white hover:bg-red-50 dark:hover:bg-neutral-800 text-xs sm:text-sm md:text-base min-w-0"
                    variant="ghost"
                    onClick={(e) => {
                        e.stopPropagation();
                        trackEvent('clicked_on_card_mistakes')
                        handleCardClick();
                    }}
                >
                   <span className="truncate text-sm ">
                        {data.orders.mistake ? truncate(data.orders.mistake, window.innerWidth < 640 ? 6 : 8) : 'Mistake'}
             </span>
                </Button>
            </div>
        </div>
    )
}
