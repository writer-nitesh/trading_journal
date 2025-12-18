'use client';
import { Card, CardContent } from "@/components/ui/card";
import { trackEvent } from '@/lib/mixpanelClient';
import { StrategyCharts } from "@/components/ui/strategy-charts";
import { TradingFilters } from "@/components/ui/trading-filters";
import useGlobalState from "@/hooks/globalState";
import { flattenOrders } from "@/lib/logic";
import { calculateStrategyAnalytics } from "@/lib/strategyAnalytics";
import { useEffect, useMemo, useState } from "react";

function parseTimestamp(timestamp) {
    return new Date(timestamp);
}

function processDataForTrading(data) {
    const allOrders = flattenOrders(data);

    // Group by symbol
    const grouped = {};
    allOrders.forEach(order => {
        const symbol = order.tradingsymbol;
        if (!grouped[symbol]) grouped[symbol] = [];
        const orderWithIST = {
            ...order,
            order_timestamp: parseTimestamp(order.order_timestamp)
        };
        grouped[symbol].push(orderWithIST);
    });

    const completeTrades = [];
    let tradeIndex = 0;

    for (const symbol in grouped) {
        const orders = grouped[symbol]
            .sort((a, b) => new Date(a.order_timestamp) - new Date(b.order_timestamp));

        let position = 0;
        let avgEntryPrice = 0;
        let totalQuantity = 0;
        let entryOrders = [];
        let isShort = false;

        for (const order of orders) {
            if (position === 0) {
                isShort = order.transaction_type === 'SELL';
            }

            if ((isShort && order.transaction_type === 'SELL') || (!isShort && order.transaction_type === 'BUY')) {
                // Entry order
                const prevTotalValue = avgEntryPrice * totalQuantity;
                const newOrderValue = order.average_price * order.quantity;
                totalQuantity += order.quantity;
                avgEntryPrice = totalQuantity
                    ? (prevTotalValue + newOrderValue) / totalQuantity
                    : 0;
                position += isShort ? -order.quantity : order.quantity;
                entryOrders.push(order);
            } else if ((isShort && order.transaction_type === 'BUY' && position < 0) ||
                (!isShort && order.transaction_type === 'SELL' && position > 0)) {
                // Exit order
                const exitQuantity = Math.min(Math.abs(order.quantity), Math.abs(position));
                if (exitQuantity > 0 && entryOrders.length > 0) {
                    const entryOrder = entryOrders[0];
                    const entryTime = new Date(entryOrder.order_timestamp);
                    const exitTime = new Date(order.order_timestamp);
                    const entryPrice = avgEntryPrice;
                    const exitPrice = order.average_price;

                    const pnl = isShort
                        ? (entryPrice - exitPrice) * exitQuantity
                        : (exitPrice - entryPrice) * exitQuantity;
                    const returnPct = entryPrice
                        ? (isShort ? ((entryPrice - exitPrice) / entryPrice) : ((exitPrice - entryPrice) / entryPrice)) * 100
                        : 0;
                    const durationMinutes = (exitTime - entryTime) / (1000 * 60);

                    // Get trade data from parent trade
                    let tradeData = order._parentTrade || {};
                    if (!tradeData.strategy && Array.isArray(tradeData.startegy) && tradeData.startegy.length > 0) {
                        tradeData.strategy = tradeData.startegy[0];
                    }

                    const strategy = typeof tradeData.strategy === "string"
                        ? tradeData.strategy
                        : (Array.isArray(tradeData.startegy) && tradeData.startegy.length > 0 ? tradeData.startegy[0] : "");

                    const mistake = tradeData.mistake || "";

                    const feelings = typeof tradeData.feelings === 'string' && tradeData.feelings
                        ? tradeData.feelings
                        : (Array.isArray(tradeData.feelings) && tradeData.feelings.length > 0
                            ? tradeData.feelings[0]
                            : "Not Selected");

                    completeTrades.push({
                        id: `trade-${tradeIndex}`,
                        symbol,
                        side: isShort ? "SHORT" : "LONG",
                        quantity: exitQuantity,
                        entry_price: Number(entryPrice.toFixed(2)),
                        exit_price: Number(exitPrice.toFixed(2)),
                        pnl: Number(pnl.toFixed(2)),
                        return_pct: Number(returnPct.toFixed(2)),
                        strategy,
                        feelings,
                        mistake,
                        entry_date: entryTime.toISOString().slice(0, 10),
                        exit_date: exitTime.toISOString().slice(0, 10),
                        duration: Number(durationMinutes.toFixed(2)),
                        entry_timestamp: entryTime,
                        exit_timestamp: exitTime,
                    });
                    tradeIndex++;

                    // Update position
                    position += isShort ? exitQuantity : -exitQuantity;
                    if (position === 0) {
                        avgEntryPrice = 0;
                        totalQuantity = 0;
                        entryOrders = [];
                    } else {
                        totalQuantity -= exitQuantity;
                    }
                }
            }
        }
    }
    return completeTrades;
}

export default function DashboardPage() {
    const [selectedFilters, setSelectedFilters] = useState({
        type: 'day',
        value: 'all'
    });
    const [showPopup, setShowPopup] = useState(false);
    const [tradingData, setTradingData] = useState([]);

    const { requestTokens, data } = useGlobalState();
    const isConnected = requestTokens;

    // Analytics tracking
    useEffect(() => {
        if (!sessionStorage.getItem('viewed_homescreen_fired')) {
            trackEvent('viewed_homescreen');
            sessionStorage.setItem('viewed_homescreen_fired', 'true');
        }
        trackEvent('viewed_dashboard');
    }, []);

    // Show popup if broker not connected
    useEffect(() => {
        if (!isConnected) {
            const timer = setTimeout(() => setShowPopup(true), 5000);
            return () => clearTimeout(timer);
        }
    }, [isConnected]);

    // Process trading data
    useEffect(() => {
        if (data && data.length > 0) {
            const enhancedData = processDataForTrading(data);
            setTradingData(enhancedData);
        }
    }, [data]);

    // Calculate strategy analytics
    const strategyAnalytics = useMemo(() => {
        return calculateStrategyAnalytics(tradingData);
    }, [tradingData]);

    return (
        <div className="space-y-6 p-4">
            <TradingFilters
                selectedFilters={selectedFilters}
                onFiltersChange={setSelectedFilters}
            />

            <Card>
                <CardContent className="p-0">
                    <StrategyCharts
                        strategyMetrics={strategyAnalytics}
                        tradingData={tradingData}
                        selectedFilter={selectedFilters}
                    />
                </CardContent>
            </Card>
        </div>
    );
}