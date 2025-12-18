import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "../ui/button";
import TradePanel from "./tradePanel";
import FeelingsPanel from "./feelingsPanel";
import Builder from "./builder";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useCallback, useContext, useEffect, useState } from "react";
import { CalenderContext } from "../journal/calenderDataProvider";
import { JournalContext } from "./journalDetailsProvider";
import { calculatePnLForTrade, getDataForDate } from "@/lib/logic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { trackEvent } from '../../lib/mixpanelClient'; 

export default function Details() {

    const { setWeekOffset, openDialog, setOpenDialog } = useContext(CalenderContext);
    const { selectedTrade, setSelectedTrade, todaysTrade: data } = useContext(JournalContext);

    console.log(data, "data --------------INDEX");


    // Add safety check before calculating PnL
    // const handlePrevWeek = () => {
    //     setWeekOffset((prev) => prev - 1);
    // }

    // const handleNextWeek = () => {
    //     setWeekOffset((prev) => prev + 1);
    // }

    // const handleToday = () => {
    //     setWeekOffset(0);
    // }

    const changeTrade = (direction) => {
        if (!data) return;

        const tradeKeys = Object.keys(data)
            .filter(key => key.startsWith('TRADE_'))
            .sort((a, b) => {
                const aNum = parseInt(a.split('_')[1]);
                const bNum = parseInt(b.split('_')[1]);
                return aNum - bNum;
            });
        const currentIndex = tradeKeys.indexOf(selectedTrade);

        if (direction === 'left' && currentIndex > 0) {
            setSelectedTrade(tradeKeys[currentIndex - 1]);
        } else if (direction === 'right' && currentIndex < tradeKeys.length - 1) {
            setSelectedTrade(tradeKeys[currentIndex + 1]);
        }
    }
    useEffect(() => {
        if (openDialog) {
            trackEvent('viewed_tradedetailspage');
        }
    }, [openDialog]);

    return (
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogContent className="fixed top-[50%] left-1/2 -translate-x-1/2 w-[calc(100vw-1rem)] sm:w-[calc(100vw-4rem)] max-w-[calc(100vw-2rem)] sm:max-w-[calc(100vw-8rem)] max-h-[95vh] overflow-hidden p-0 m-0 gap-0 rounded-md bg-white dark:bg-neutral-900 shadow-md">
                <DialogHeader>
                    <DialogTitle className="hidden">Trade Details</DialogTitle>
                    <div className="bg-[#F2F2F2] dark:bg-neutral-900 p-2 sm:p-0 m-0 h-12 sm:h-12 w-full flex items-center justify-center">
                        {/* Week Selector */}
                        {/*
                         <div className="flex items-center">
                            <Button
                                variant="icon"
                                onClick={handlePrevWeek}
                                className="p-2 hover:bg-neutral-100 rounded-lg "
                            >
                                <ChevronLeft className="w-5 h-5 text-neutral-600" />
                            </Button>

                            <Button
                                variant="icon"
                                onClick={handleToday}
                                className="px-4 py-2 font-medium rounded-lg">
                                {data && data.currentDate ? data.currentDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }) : 'Today'}
                            </Button>

                            <Button
                                variant="icon"
                                onClick={handleNextWeek}
                                className="p-2 hover:bg-neutral-100 rounded-lg">
                                <ChevronRight className="w-5 h-5 text-neutral-600" />
                            </Button>
                        </div>
                         */}

                        {
                            data &&
                            <div className="flex items-center">
                                <Button
                                    variant="icon"
                                    onClick={() => { changeTrade('left') }}
                                    className="p-1 sm:p-2 hover:bg-neutral-100 rounded-lg">
                                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-600" />

                                </Button>

                                <div className="px-2 sm:px-4 py-1 sm:py-2 font-medium rounded-lg text-sm sm:text-base">
                                    Trade {parseInt(selectedTrade.split('_')[1])}
                                </div>

                                <Button
                                    variant="icon"
                                    onClick={() => { changeTrade('right') }}
                                    className="p-1 sm:p-2 hover:bg-neutral-100 rounded-lg">
                                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-600" />
                                </Button>
                            </div>
                        }

                        {/*
                         <Button
                            variant="icon"
                            className="p-2 hover:bg-neutral-100 rounded-lg ml-2"
                            aria-label="Open calendar picker"
                        >
                            <Calendar className="w-5 h-5 text-neutral-600" />
                        </Button>
                         */}
                    </div>
                </DialogHeader>
                <DialogDescription className="sr-only">
                    Details about the strategy and trade journal for the selected week.
                </DialogDescription>
                {
                    data ?
                        <>
                            <div className="lg:grid hidden lg:grid-cols-3 gap-6 h-full p-2 overflow-y-auto">
                                <TradePanel />
                                <Builder />
                                <FeelingsPanel />
                            </div>

                            <Tabs defaultValue="details" className="lg:hidden h-full flex flex-col">
                                <TabsList className="grid w-full grid-cols-3 mx-2 mt-2">
                                    <TabsTrigger value="details" className="text-xs sm:text-sm">Details</TabsTrigger>
                                    <TabsTrigger value="tags" className="text-xs sm:text-sm">Tags</TabsTrigger>
                                    <TabsTrigger value="notes" className="text-xs sm:text-sm">Notes</TabsTrigger>
                                </TabsList>
                                <div className="flex-1 overflow-y-auto p-2">
                                    <TabsContent value="details" className="mt-0"><TradePanel /></TabsContent>
                                    <TabsContent value="tags" className="mt-0"><Builder /></TabsContent>
                                    <TabsContent value="notes" className="mt-0"><FeelingsPanel /></TabsContent>
                                </div>
                            </Tabs>

                        </>
                        :
                        <div className="h-[calc(100vh-6.3rem)] flex items-center justify-center text-neutral-400 text-sm">
                            No trades
                        </div>
                }
            </DialogContent>
        </Dialog>
    );
}