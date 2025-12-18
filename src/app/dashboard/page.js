'use client';

import { useEffect, useState } from "react";
import { trackEvent } from '../../lib/mixpanelClient';
import useGlobalState from "@/hooks/globalState";
import { flattenOrders } from "@/lib/logic";

import TradingInsightsPanel from "@/components/dashboard/TradingInsightsPanel";
import TradingMetricsSummary from "@/components/ui/trading-metrics-summary";
import { useRouter } from "node_modules/next/navigation";
import { addUserData } from "@/lib/firebase/database/userData";

export default function DashboardPage() {
    const [showPopup, setShowPopup,] = useState(false);
    const { requestTokens, data, userData } = useGlobalState();
    const isConnected = requestTokens;
    const [tradingData, setTradingData] = useState([]);

    // Fire tracking events
    useEffect(() => {
        if (!sessionStorage.getItem('viewed_homescreen_fired')) {
            trackEvent('viewed_homescreen');
            sessionStorage.setItem('viewed_homescreen_fired', 'true');
        }
        trackEvent('viewed_dashboard');
    }, []);

    // Show broker connect popup if not connected
    useEffect(() => {
        if (!isConnected) {
            const timer = setTimeout(() => setShowPopup(true), 5000);
            return () => clearTimeout(timer);
        }
    }, [isConnected]);

    const processDataForTrading = (rawData) => {
        const allOrders = flattenOrders(rawData);
        const grouped = {};

        allOrders.forEach(order => {
            const symbol = order.tradingsymbol;
            if (!grouped[symbol]) grouped[symbol] = [];
            grouped[symbol].push({
                ...order,
                order_timestamp: new Date(order.order_timestamp)
            });
        });

        const completeTrades = [];
        let tradeIndex = 0;

        Object.entries(grouped).forEach(([symbol, orders]) => {
            orders.sort((a, b) => a.order_timestamp - b.order_timestamp);
            let position = 0, avgEntryPrice = 0, totalQuantity = 0, entryOrders = [], isShort = false;

            orders.forEach(order => {
                if (position === 0) isShort = order.transaction_type === 'SELL';

                const isEntry = (isShort && order.transaction_type === 'SELL') || (!isShort && order.transaction_type === 'BUY');
                const isExit = (isShort && order.transaction_type === 'BUY' && position < 0) ||
                    (!isShort && order.transaction_type === 'SELL' && position > 0);

                if (isEntry) {
                    const prevValue = avgEntryPrice * totalQuantity;
                    const newValue = order.average_price * order.quantity;
                    totalQuantity += order.quantity;
                    avgEntryPrice = totalQuantity ? (prevValue + newValue) / totalQuantity : 0;
                    position += isShort ? -order.quantity : order.quantity;
                    entryOrders.push(order);
                }

                if (isExit && entryOrders.length > 0) {
                    const exitQty = Math.min(Math.abs(order.quantity), Math.abs(position));
                    if (exitQty > 0) {
                        const entryOrder = entryOrders[0];
                        const entryTime = new Date(entryOrder.order_timestamp);
                        const exitTime = new Date(order.order_timestamp);
                        const pnl = isShort
                            ? (avgEntryPrice - order.average_price) * exitQty
                            : (order.average_price - avgEntryPrice) * exitQty;
                        const returnPct = avgEntryPrice
                            ? (isShort ? ((avgEntryPrice - order.average_price) / avgEntryPrice)
                                : ((order.average_price - avgEntryPrice) / avgEntryPrice)) * 100
                            : 0;
                        const tradeData = order._parentTrade || {};
                        const strategy = tradeData.strategy || tradeData.startegy?.[0] || "";
                        const feelings = tradeData.feelings?.[0] || tradeData.feelings || "Not Selected";
                        const mistake = tradeData.mistake || "";

                        completeTrades.push({
                            id: `trade-${tradeIndex++}`,
                            symbol,
                            side: isShort ? "SHORT" : "LONG",
                            quantity: exitQty,
                            entry_price: +avgEntryPrice.toFixed(2),
                            exit_price: +order.average_price.toFixed(2),
                            pnl: +pnl.toFixed(2),
                            return_pct: +returnPct.toFixed(2),
                            strategy,
                            feelings,
                            mistake,
                            entry_date: entryTime.toISOString().slice(0, 10),
                            exit_date: exitTime.toISOString().slice(0, 10),
                            duration: +((exitTime - entryTime) / 60000).toFixed(2),
                            entry_timestamp: entryTime,
                            exit_timestamp: exitTime
                        });

                        position += isShort ? exitQty : -exitQty;
                        if (position === 0) {
                            avgEntryPrice = 0;
                            totalQuantity = 0;
                            entryOrders = [];
                        } else {
                            totalQuantity -= exitQty;
                        }
                    }
                }
            });
        });

        return completeTrades;
    };


    useEffect(() => {
        if (userData && userData.onBoarding === 'incomplete' && data && data.length > 0) {
            const saveData = async () => {
                try {
                    await addUserData({
                        onBoarding: "completed",
                        plan: {
                            type: "trial",
                            trialPeriod: 7
                        }
                    });
                } catch (error) {
                    console.error("Error saving user data:", error);
                }
            };

            saveData();
        }
    }, [userData, data]);



    // Enhance data when global state changes
    useEffect(() => {
        if (data && data.length > 0) setTradingData(processDataForTrading(data));
    }, [data]);

    return (
        <div className="overflow-hidden flex lg:h-[calc(100vh-4.7rem)] flex-col lg:flex-row w-full ">

            <div className="lg:flex-1 flex-col lg:flex-row h-full overflow-hidden mb">
                <div className="flex-1 overflow-y-auto  custom-scroll h-full pb-18">
                    <TradingMetricsSummary tradingData={tradingData} />
                </div>
            </div>
            <div className="overflow-y-auto h-full w-full lg:w-96">
                <TradingInsightsPanel tradingData={tradingData} />
            </div>
        </div>
    );
}

