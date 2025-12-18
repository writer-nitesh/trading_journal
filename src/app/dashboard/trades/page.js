'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TradingDataTable } from "@/components/ui/trading-data-table";
import useGlobalState from '@/hooks/globalState';
import { useEffect, useMemo } from "react";
import { trackEvent } from '@/lib/mixpanelClient';

// Helper to merge broker and user data for a trade
function mergeTradeData(trade) {
    return {
        id: trade.order_id || trade.id || "",
        date: trade.order_timestamp || trade.date || "",
        symbol: trade.tradingsymbol || trade.symbol || "",
        side: trade.transaction_type || trade.side || "",
        quantity: trade.quantity || "",
        entry_price: trade.average_price || trade.entry_price || "",
        exit_price: trade.exit_price || "",
        pnl: trade.pnl || "",
        return_pct: trade.return_pct || "",
        strategy: trade.strategy || "",
        emotion: trade.emotion || "",
        mistake: trade.mistake || "",
        stop_loss: trade.stop_loss || "",
        target_price: trade.target_price || "",
        feelings: trade.feelings || "",
        notes: trade.description || trade.notes || "",
    };
}

function formatFirestoreTimestamp(timestamp) {
    return new Date(timestamp);
}

export function group(orders) {
    const grouped = [];

    // Group by symbol
    const symbolGroups = {};
    for (let order of orders) {
        const formattedOrder = {
            order_timestamp: order.order_timestamp,
            tradingsymbol: order.tradingsymbol,
            quantity: order.quantity,
            average_price: order.average_price,
            transaction_type: order.transaction_type,
            id: order.id || order.order_id,
        };

        if (!symbolGroups[order.tradingsymbol]) {
            symbolGroups[order.tradingsymbol] = [];
        }
        symbolGroups[order.tradingsymbol].push(formattedOrder);
    }

    // Process per symbol
    for (const [symbol, symbolOrders] of Object.entries(symbolGroups)) {
        const buys = [];
        const sells = [];

        for (const order of symbolOrders) {
            if (order.transaction_type === "BUY") {
                buys.push({ ...order });
            } else {
                sells.push({ ...order });
            }

            // Try to match orders
            while (buys.length > 0 && sells.length > 0) {
                const buy = buys[0];
                const sell = sells[0];

                const qty = Math.min(buy.quantity, sell.quantity);

                // Make trade group
                grouped.push({
                    orders: [
                        {
                            ...buy,
                            quantity: qty,
                        },
                        {
                            ...sell,
                            quantity: qty,
                        },
                    ],
                    stop_loss: 0,
                    target_price: 0,
                    feelings: "",
                    insights: [],
                    chartImage: "",
                    description: "",
                });

                // Decrease remaining qty
                buy.quantity -= qty;
                sell.quantity -= qty;

                if (buy.quantity === 0) buys.shift();
                if (sell.quantity === 0) sells.shift();
            }
        }
    }

    return grouped;
}

function deduplicateAndMergeTrades(data) {
    if (!data || !Array.isArray(data) || data.length === 0) return [];

    function processDataForTrading(data) {
        // Flatten the data structure
        const flatData = data.flatMap(dayData => {
            if (!dayData.trades) return [];

            return Object.entries(dayData.trades).flatMap(([tradeKey, trade]) => {
                if (tradeKey === 'date') return [];

                if (Array.isArray(trade.orders)) {
                    return trade.orders.map(order => ({
                        ...order,
                        _parentTrade: trade
                    }));
                }

                return [];
            });
        });

        // Use the group function to get matched trades
        const groupedTrades = group(flatData);

        // Process the grouped trades to the final format
        const completeTrades = [];
        let tradeIndex = 0;

        for (const group of groupedTrades) {
            const orders = group.orders;

            if (orders.length === 2) {
                // Completed trade (buy-sell pair)
                const buyOrder = orders.find(o => o.transaction_type === 'BUY');
                const sellOrder = orders.find(o => o.transaction_type === 'SELL');

                if (buyOrder && sellOrder) {
                    const entryTime = formatFirestoreTimestamp(buyOrder.order_timestamp);
                    const exitTime = formatFirestoreTimestamp(sellOrder.order_timestamp);

                    // Determine if this is a short trade (sell first, buy later)
                    const isShortTrade = exitTime < entryTime;
                    const entryPrice = isShortTrade ? sellOrder.average_price : buyOrder.average_price;
                    const exitPrice = isShortTrade ? buyOrder.average_price : sellOrder.average_price;
                    const quantity = Math.min(buyOrder.quantity, sellOrder.quantity);

                    // Calculate PnL based on trade direction
                    const pnl = isShortTrade
                        ? (entryPrice - exitPrice) * quantity
                        : (exitPrice - entryPrice) * quantity;
                    const returnPct = entryPrice
                        ? (isShortTrade
                            ? ((entryPrice - exitPrice) / entryPrice) * 100
                            : ((exitPrice - entryPrice) / entryPrice) * 100)
                        : 0;

                    // Get parent trade data for metadata
                    const parentTrade = buyOrder._parentTrade || sellOrder._parentTrade || {};

                    // Handle strategy field variations with default value
                    let strategy = "Not Selected";
                    if (typeof parentTrade.strategy === "string" && parentTrade.strategy.trim()) {
                        strategy = parentTrade.strategy;
                    } else if (Array.isArray(parentTrade.strategy) && parentTrade.strategy.length > 0) {
                        strategy = parentTrade.strategy[0];
                    }

                    // Get feelings with proper default
                    let feelings = "Not Selected";
                    if (typeof parentTrade.feelings === 'string' && parentTrade.feelings.trim()) {
                        feelings = parentTrade.feelings.trim();
                    } else if (Array.isArray(parentTrade.feelings) && parentTrade.feelings.length > 0) {
                        feelings = parentTrade.feelings[0].trim();
                    }

                    completeTrades.push({
                        id: `trade-${tradeIndex}`,
                        symbol: buyOrder.tradingsymbol,
                        side: isShortTrade ? "SHORT" : "LONG",
                        quantity: quantity,
                        entry_price: Number(entryPrice.toFixed(2)),
                        exit_price: Number(exitPrice.toFixed(2)),
                        pnl: Number(pnl.toFixed(2)),
                        return_pct: Number(returnPct.toFixed(2)),
                        strategy,
                        feelings,
                        mistake: parentTrade.mistake?.trim() || "Not Specified",
                        date: isShortTrade ? exitTime : entryTime,
                        entry_time: isShortTrade ? exitTime : entryTime,
                        exit_time: isShortTrade ? entryTime : exitTime,
                        duration: entryTime && exitTime ? Math.abs(exitTime - entryTime) : 0,
                        notes: parentTrade.description?.trim() || "",
                        stop_loss: parentTrade.stop_loss || 0,
                        target_price: parentTrade.target_price || 0
                    });
                }
            } else if (orders.length === 1) {
                // Open position (unmatched order)
                const order = orders[0];
                const orderDate = formatFirestoreTimestamp(order.order_timestamp);
                const parentTrade = order._parentTrade || {};

                // Handle strategy field variations with default value
                let strategy = "Not Selected";
                if (typeof parentTrade.strategy === "string" && parentTrade.strategy.trim()) {
                    strategy = parentTrade.strategy;
                } else if (Array.isArray(parentTrade.strategy) && parentTrade.strategy.length > 0) {
                    strategy = parentTrade.strategy[0];
                }

                // Get feelings with proper default
                let feelings = "Not Selected";
                if (typeof parentTrade.feelings === 'string' && parentTrade.feelings.trim()) {
                    feelings = parentTrade.feelings.trim();
                } else if (Array.isArray(parentTrade.feelings) && parentTrade.feelings.length > 0) {
                    feelings = parentTrade.feelings[0].trim();
                }

                completeTrades.push({
                    id: `open-${tradeIndex}`,
                    symbol: order.tradingsymbol,
                    side: order.transaction_type === 'SELL' ? "SHORT" : "LONG",
                    quantity: Math.abs(order.quantity),
                    entry_price: Number(order.average_price.toFixed(2)),
                    exit_price: 0,
                    pnl: 0,
                    return_pct: 0,
                    strategy,
                    feelings,
                    mistake: parentTrade.mistake?.trim() || "Not Specified",
                    date: orderDate || new Date(),
                    entry_time: orderDate,
                    exit_time: null,
                    duration: orderDate ? (new Date() - orderDate) : 0,
                    notes: parentTrade.description?.trim() || "",
                    stop_loss: parentTrade.stop_loss || 0,
                    target_price: parentTrade.target_price || 0
                });
            }
            tradeIndex++;
        }

        return completeTrades;
    }

    return processDataForTrading(data).sort((a, b) => new Date(b.date) - new Date(a.date));
}


const Trades = () => {


    const { data } = useGlobalState();

    console.log("TRADE BOOK  --------------", data);
    // ADD THIS useEffect 👇
    useEffect(() => {
        trackEvent("viewed_tradebook");
    }, []);

    // Deduplicate and merge trades by order_id
    const processedTradingData = deduplicateAndMergeTrades(data || []);


    return (
        <div className="flex flex-col gap-4 w-full overflow-hidden">
            <Card className="rounded-md m-0 p-0 overflow-hidden border-0 bg-transparent">
                <CardContent className="p1 m-0 flex justify-center items-center overflow-x-auto">
                    <div className="w-full ">
                        <TradingDataTable data={processedTradingData} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
export default Trades;
