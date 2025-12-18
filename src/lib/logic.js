import { parseBrokerTimestamp } from "./utils";

const normalizeStatus = (status) => {
    if (!status) return "";
    const s = status.toUpperCase();
    if (["COMPLETE", "TRADED", "FILLED", "PLACED","CLOSED"].includes(s)) return "COMPLETE";
    return s;
};


// export function groupCompletedTradeSets(orders, lastGroupKey) {

//     // Sort orders by timestamp
//     orders.sort((a, b) =>
//         new Date(a.order_timestamp).getTime() - new Date(b.order_timestamp).getTime()
//     );

//     // Filter only completed/traded orders
//     const completedOrders = orders.filter(order => normalizeStatus(order.status) === 'COMPLETE');

//     const grouped = {};
//     let tempGroup = [];
//     let tradeCounter = lastGroupKey
//         ? parseInt(lastGroupKey.split("_")[1], 10) + 1
//         : 1;
//     let runningQty = 0;

//     const overallDate = completedOrders.length > 0
//         ? new Date(completedOrders[0].order_timestamp).toLocaleDateString("en-US")
//         : null;

//     for (let order of completedOrders) {
//         const formattedOrder = {
//             order_timestamp: order.order_timestamp,
//             tradingsymbol: order.tradingsymbol,
//             quantity: order.quantity,
//             average_price: order.average_price,
//             transaction_type: order.transaction_type,
//             id: order.id || order.order_id // Support both keys
//         };

//         if (tempGroup.length === 0) {
//             tempGroup.push(formattedOrder);
//             runningQty = order.transaction_type === "BUY" ? order.quantity : -order.quantity;
//             continue;
//         }

//         const first = tempGroup[0];
//         const sameMeta = order.tradingsymbol === first.tradingsymbol;

//         if (!sameMeta) {
//             tempGroup = [formattedOrder];
//             runningQty = order.transaction_type === "BUY" ? order.quantity : -order.quantity;
//             continue;
//         }

//         const isSameSide = order.transaction_type === "BUY" ? runningQty >= 0 : runningQty <= 0;

//         if (isSameSide) {
//             tempGroup.push(formattedOrder);
//             runningQty += order.transaction_type === "BUY" ? order.quantity : -order.quantity;
//         } else {
//             runningQty += order.transaction_type === "BUY" ? order.quantity : -order.quantity;
//             tempGroup.push(formattedOrder);

//             if (runningQty === 0) {
//                 const groupKey = `TRADE_${String(tradeCounter).padStart(3, "0")}`;
//                 grouped[groupKey] = {
//                     orders: [...tempGroup],
//                     stop_loss: 0,
//                     target_price: 0,
//                     feelings: '',
//                     insights: [],
//                     chartImage: '',
//                     description: ''
//                 };
//                 tradeCounter++;
//                 tempGroup = [];
//                 runningQty = 0;
//             }
//         }
//     }

//     return {
//         date: overallDate,
//         ...grouped
//     };
// }

export function groupCompletedTradeSets(orders, lastGroupKey) {
    // Sort by time
    orders.sort(
        (a, b) =>
            new Date(a.order_timestamp).getTime() -
            new Date(b.order_timestamp).getTime()
    );

    // Keep only completed/traded orders
    const completedOrders = orders.filter(
        (order) => normalizeStatus(order.status) === "COMPLETE"
    );

    const grouped = {};
    let tradeCounter = lastGroupKey
        ? parseInt(lastGroupKey.split("_")[1], 10) + 1
        : 1;

    const overallDate =
        completedOrders.length > 0
            ? new Date(completedOrders[0].order_timestamp).toLocaleDateString(
                  "en-US"
              )
            : null;

    // Group by symbol
    const symbolGroups = {};
    for (let order of completedOrders) {
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
                const groupKey = `TRADE_${String(tradeCounter).padStart(3, "0")}`;
                grouped[groupKey] = {
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
                };
                tradeCounter++;

                // Decrease remaining qty
                buy.quantity -= qty;
                sell.quantity -= qty;

                if (buy.quantity === 0) buys.shift();
                if (sell.quantity === 0) sells.shift();
            }
        }
    }

    return {
        date: overallDate,
        ...grouped,
    };
}



export function calculateOverallPnL(tradeArray) {
    let totalBuy = 0;
    let totalSell = 0;
    let totalQty = 0;

    for (const tradeObj of tradeArray) {
        for (const key in tradeObj) {
            if (!key.startsWith("TRADE_")) continue;

            const trade = tradeObj[key];
            if (!trade || !Array.isArray(trade.orders)) {
                console.warn(`Skipping invalid trade: ${key}`, trade);
                continue;
            }

            const trades = trade.orders;

            let buyQty = 0, buyTotal = 0;
            let sellQty = 0, sellTotal = 0;

            for (const order of trades) {
                const qty = Number(order.quantity);
                const price = Number(order.average_price);

                if (order.transaction_type === "BUY") {
                    buyQty += qty;
                    buyTotal += qty * price;
                } else if (order.transaction_type === "SELL") {
                    sellQty += qty;
                    sellTotal += qty * price;
                }
            }

            if (buyQty !== sellQty) {
                console.warn(`Qty mismatch in ${key}: BUY ${buyQty} ≠ SELL ${sellQty}`);
                continue;
            }

            totalBuy += buyTotal;
            totalSell += sellTotal;
            totalQty += buyQty;
        }
    }

    const totalPnL = totalSell - totalBuy;

    return {
        amount: {
            totalBuy: Number(totalBuy.toFixed(2)),
            totalSell: Number(totalSell.toFixed(2)),
            totalQty: totalQty
        },
        pnl: Number(totalPnL.toFixed(2)),
        type: totalPnL > 0 ? "PROFIT" : totalPnL < 0 ? "LOSS" : "BREAKEVEN"
    };
}




export function calculatePnLForTrade(trades) {
    if (!Array.isArray(trades)) {
        return {
            error: 'trades is not iterable',
            amount: null,
            pnl: null,
            type: 'INVALID'
        };
    }
    let buyQty = 0, buyTotal = 0;
    let sellQty = 0, sellTotal = 0;

    for (let order of trades) {
        const qty = Number(order.quantity);
        const price = Number(order.average_price);

        if (order.transaction_type === "BUY") {
            buyQty += qty;
            buyTotal += qty * price;
        } else if (order.transaction_type === "SELL") {
            sellQty += qty;
            sellTotal += qty * price;
        }
    }

    if (buyQty !== sellQty) {
        return {
            error: `⚠ Quantity mismatch: BUY ${buyQty} ≠ SELL ${sellQty}`,
            amount: null,
            pnl: null,
            type: "INVALID"
        };
    }

    const pnl = sellTotal - buyTotal;

    return {
        amount: {
            totalBuy: Number(buyTotal.toFixed(2)),
            totalSell: Number(sellTotal.toFixed(2)),
            totalQty: buyQty
        },
        pnl: Number(pnl.toFixed(2)),
        type: pnl > 0 ? "PROFIT" : pnl < 0 ? "LOSS" : "BREAKEVEN"
    };
}


export function calculateDetails(trades) {
    if (!trades || trades.length === 0) return null;

    let totalBuyQuantity = 0;
    let totalBuyValue = 0;
    let totalSellQuantity = 0;
    let totalSellValue = 0;

    for (const trade of trades) {
        if (trade.transaction_type === 'BUY') {
            totalBuyQuantity += trade.quantity;
            totalBuyValue += trade.quantity * trade.average_price;
        } else if (trade.transaction_type === 'SELL') {
            totalSellQuantity += trade.quantity;
            totalSellValue += trade.quantity * trade.average_price;
        }
    }

    // Handle single-order trades
    if (totalBuyQuantity === 0 && totalSellQuantity > 0) {
        // Only sell orders
        return {
            entry_price: totalSellValue / totalSellQuantity, // For short trades, sell is entry
            exit_price: 0,
            quantity: totalSellQuantity,
            pnl: 0, // Can't calculate PnL without exit price
        };
    } else if (totalSellQuantity === 0 && totalBuyQuantity > 0) {
        // Only buy orders
        return {
            entry_price: totalBuyValue / totalBuyQuantity, // For long trades, buy is entry
            exit_price: 0,
            quantity: totalBuyQuantity,
            pnl: 0, // Can't calculate PnL without exit price
        };
    }

    // Determine if this is a long or short trade based on first order
    const isLongTrade = trades[0].transaction_type === 'BUY';

    // Calculate weighted average entry and exit prices based on trade direction
    const entry_price = isLongTrade
        ? totalBuyValue / totalBuyQuantity     // Long trade: buy is entry
        : totalSellValue / totalSellQuantity;  // Short trade: sell is entry

    const exit_price = isLongTrade
        ? totalSellValue / totalSellQuantity   // Long trade: sell is exit
        : totalBuyValue / totalBuyQuantity;    // Short trade: buy is exit

    // To calculate PnL, we need to consider the minimum of the total buy and sell quantities
    // to ensure we're only calculating PnL for the "closed" portion of the trade.
    const quantityForPnL = Math.min(totalBuyQuantity, totalSellQuantity);
    const pnl = isLongTrade
        ? (exit_price - entry_price) * quantityForPnL  // Long trade: sell - buy
        : (entry_price - exit_price) * quantityForPnL; // Short trade: sell - buy

    return {
        entry_price: parseFloat(entry_price.toFixed(2)),
        exit_price: parseFloat(exit_price.toFixed(2)),
        quantity: quantityForPnL,
        pnl: parseFloat(pnl.toFixed(2)),
    };
}

export function extractAllOrders(data) {
    const allOrders = [];

    // Iterate through each document in the array
    data.forEach(document => {
        // Check if the document has a trades object
        if (document.trades && typeof document.trades === 'object') {
            // Iterate through each trade in the trades object
            Object.keys(document.trades).forEach(tradeKey => {
                const trade = document.trades[tradeKey];

                // Skip the 'date' key as it's not a trade object
                if (tradeKey === 'date') return;

                // Check if the trade has orders array
                if (trade.orders && Array.isArray(trade.orders)) {
                    // Add each order to the allOrders array
                    trade.orders.forEach(order => {
                        let processedOrder = { ...order };

                        if (order.order_timestamp) {
                            processedOrder.order_timestamp = parseBrokerTimestamp(order.order_timestamp);
                        }

                        allOrders.push(processedOrder);
                    });
                }
            });
        }
    });

    return allOrders;
}
// Additional utility function to get trade summaries (without individual orders)
export function extractTradeSummaries(data) {
    const tradeSummaries = [];

    data.forEach(document => {
        if (document.trades && typeof document.trades === 'object') {
            const documentMetadata = {
                documentId: document.id,
                userId: document.userId,
                tradeDate: document.trades.date || null,
                documentCreatedAt: document.created_at,
                documentUpdatedAt: document.updated_at
            };

            Object.keys(document.trades).forEach(tradeKey => {
                const trade = document.trades[tradeKey];

                if (tradeKey === 'date') return;

                // Calculate trade metrics
                const buyOrders = trade.orders?.filter(o => o.transaction_type === 'BUY') || [];
                const sellOrders = trade.orders?.filter(o => o.transaction_type === 'SELL') || [];

                const totalBuyValue = buyOrders.reduce((sum, order) => sum + (order.average_price * order.quantity), 0);
                const totalSellValue = sellOrders.reduce((sum, order) => sum + (order.average_price * order.quantity), 0);
                const pnl = totalSellValue - totalBuyValue;

                const tradeSummary = {
                    tradeId: tradeKey,
                    strategy: trade.strategy || trade.startegy || null,
                    mistake: trade.mistake || null,
                    feelings: typeof trade.feelings === 'string' ? trade.feelings : (Array.isArray(trade.feelings) && trade.feelings.length > 0 ? trade.feelings[0] : ''),
                    insights: trade.insights || [],
                    description: trade.description || null,
                    targetPrice: trade.target_price || 0,
                    stopLoss: trade.stop_loss || 0,
                    chartImage: trade.chartImage || null,
                    totalOrders: trade.orders?.length || 0,
                    buyOrdersCount: buyOrders.length,
                    sellOrdersCount: sellOrders.length,
                    totalBuyValue: totalBuyValue,
                    totalSellValue: totalSellValue,
                    pnl: pnl,
                    tradingSymbol: trade.orders?.[0]?.tradingsymbol || null,
                    ...documentMetadata
                };

                tradeSummaries.push(tradeSummary);
            });
        }
    });

    return tradeSummaries;
}

/**
 * Given two arrays of orders, returns the orders in currentOrders that do not have a matching order_id in previousOrders.
 * This is useful for determining which orders are new and which orders have been cancelled.
 * @param {array} previousOrders - An array of orders from a previous call to get orders.
 * @param {array} currentOrders - An array of orders from the current call to get orders.
 * @returns {array} An array where we dont have previous orders Ids and current orders are not cancelled
 */
export function getNonMatchingOrders(previousOrders, currentOrders) {
    const prevOrderIds = new Set(previousOrders.map(item => item.id || item.id));
    return currentOrders.filter(item => !prevOrderIds.has(item.id) && item.status !== "CANCELLED");
}


export function flattenOrders(data) {
    const allOrders = [];

    function parseBrokerTimestamp(timestamp) {
        if (!timestamp) return null;
        if (typeof timestamp.toDate === 'function') return timestamp.toDate().toISOString();
        if (typeof timestamp.seconds === 'number') return new Date(timestamp.seconds * 1000).toISOString();
        const parsed = new Date(timestamp);
        return isNaN(parsed.getTime()) ? null : parsed.toISOString();
    }

    data.forEach(document => {
        if (typeof document.trades !== 'object') return;
        for (const tradeKey in document.trades) {
            if (tradeKey === 'date') continue;
            const trade = document.trades[tradeKey];
            if (Array.isArray(trade.orders)) {
                trade.orders.forEach(order => {
                    const processedOrder = { ...order };
                    if (order.order_timestamp) {
                        processedOrder.order_timestamp = parseBrokerTimestamp(order.order_timestamp);
                    }
                    processedOrder._parentTradeKey = tradeKey;
                    processedOrder._parentTrade = trade;
                    allOrders.push(processedOrder);
                });
            }
        }
    });

    return allOrders;
}

