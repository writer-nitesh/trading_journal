// Enhanced Logic Validation for Dashboard Testing
// Note: newDbData will be passed as parameter instead of direct import

// Import the original logic functions (need to be adapted for web use)
export function groupCompletedTradeSetsBrowser(orders) {
    orders.sort((a, b) =>
        new Date(a.order_timestamp).getTime() - new Date(b.order_timestamp).getTime()
    );

    const completedOrders = orders.filter(order => order.status === 'COMPLETE' || !order.status);

    const grouped = {};
    let tempGroup = [];
    let tradeCounter = 1;
    let runningQty = 0;

    const formatToISTDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString('en-CA', {
            timeZone: 'Asia/Kolkata'
        });
    };

    const overallDate = completedOrders.length > 0
        ? formatToISTDate(completedOrders[0].order_timestamp)
        : null;

    for (let order of completedOrders) {
        const formattedOrder = {
            order_timestamp: order.order_timestamp,
            tradingsymbol: order.tradingsymbol,
            quantity: order.quantity,
            average_price: order.average_price,
            transaction_type: order.transaction_type
        };

        if (tempGroup.length === 0) {
            tempGroup.push(formattedOrder);
            runningQty = order.transaction_type === "BUY" ? order.quantity : -order.quantity;
            continue;
        }

        const first = tempGroup[0];
        const sameMeta = order.tradingsymbol === first.tradingsymbol;

        if (!sameMeta) {
            tempGroup = [formattedOrder];
            runningQty = order.transaction_type === "BUY" ? order.quantity : -order.quantity;
            continue;
        }

        const isSameSide = order.transaction_type === "BUY" ? runningQty >= 0 : runningQty <= 0;

        if (isSameSide) {
            tempGroup.push(formattedOrder);
            runningQty += order.transaction_type === "BUY" ? order.quantity : -order.quantity;
        } else {
            runningQty += order.transaction_type === "BUY" ? order.quantity : -order.quantity;
            tempGroup.push(formattedOrder);

            if (runningQty === 0) {
                const groupKey = `TRADE_${String(tradeCounter).padStart(3, "0")}`;
                grouped[groupKey] = {
                    orders: [...tempGroup],
                    stop_loss: 0,
                    target_price: 0,
                    feelings: '',
                    insights: [],
                    chartImage: '',
                    description: '',
                };
                tradeCounter++;
                tempGroup = [];
                runningQty = 0;
            }
        }
    }

    return {
        date: overallDate,
        ...grouped
    };
}

export function calculateOverallPnLBrowser(groupedTrades) {
    let totalBuy = 0;
    let totalSell = 0;
    let totalQty = 0;

    for (let tradeKey in groupedTrades) {
        if (tradeKey === 'date') continue;
        
        const trades = groupedTrades[tradeKey].orders;

        let buyQty = 0, buyTotal = 0;
        let sellQty = 0, sellTotal = 0;

        for (let order of trades) {
            const qty = Number(order.quantity);
            const price = Number(order.average_price);

            if (order.transaction_type === "BUY") {
                buyQty += qty;
                buyTotal += qty * price;
            } else {
                sellQty += qty;
                sellTotal += qty * price;
            }
        }

        totalBuy += buyTotal;
        totalSell += sellTotal;
        totalQty += buyQty;
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

// Comprehensive logic validation function
export function validateDashboardLogic(newDbData) {
    console.log('🔍 Starting Dashboard Logic Validation...');
    
    if (!newDbData || !Array.isArray(newDbData)) {
        console.error('❌ No valid data provided to validateDashboardLogic');
        return {
            summary: { error: 'No valid data provided' },
            originalLogic: {},
            dataValidator: {},
            comparison: {},
            symbolAnalysis: {},
            strategyAnalysis: {},
            errors: ['No valid data provided']
        };
    }
    
    const validationResults = {
        summary: {},
        originalLogic: {},
        dataValidator: {},
        comparison: {},
        symbolAnalysis: {},
        strategyAnalysis: {},
        errors: []
    };

    try {
        // 1. Test Original Logic
        console.log('Testing original logic functions...');
        
        // Add status to simulate completed orders
        const ordersWithStatus = newDbData.map(order => ({
            ...order,
            status: 'COMPLETE'
        }));

        const groupedResult = groupCompletedTradeSetsBrowser(ordersWithStatus);
        const tradeKeys = Object.keys(groupedResult).filter(key => key.startsWith('TRADE_'));
        
        const tradeData = {};
        tradeKeys.forEach(key => {
            tradeData[key] = groupedResult[key];
        });

        const overallPnL = calculateOverallPnLBrowser(groupedResult);

        validationResults.originalLogic = {
            totalTrades: tradeKeys.length,
            totalPnL: overallPnL.pnl,
            totalBuyAmount: overallPnL.amount.totalBuy,
            totalSellAmount: overallPnL.amount.totalSell,
            pnlType: overallPnL.type,
            date: groupedResult.date,
            sampleTrades: tradeKeys.slice(0, 5).map(key => {
                const trade = groupedResult[key];
                const symbol = trade.orders[0].tradingsymbol;
                const orderCount = trade.orders.length;
                
                // Calculate individual trade P&L
                let buyTotal = 0, sellTotal = 0;
                trade.orders.forEach(order => {
                    const amount = order.quantity * order.average_price;
                    if (order.transaction_type === 'BUY') {
                        buyTotal += amount;
                    } else {
                        sellTotal += amount;
                    }
                });
                
                return {
                    tradeId: key,
                    symbol,
                    orderCount,
                    pnl: sellTotal - buyTotal,
                    buyAmount: buyTotal,
                    sellAmount: sellTotal
                };
            })
        };

        // 2. Test Data Validator (import from existing)
        console.log('Testing data validator logic...');
        
        // Import and use existing data validator functions
        import('./dataValidator.js').then(({ processNewDbData, calculateTestAnalytics }) => {
            const processedData = processNewDbData(newDbData);
            const analytics = calculateTestAnalytics(processedData);
            
            validationResults.dataValidator = {
                totalTrades: analytics.totalTrades,
                totalPnL: analytics.totalPnL,
                winRate: analytics.winRate,
                winningTrades: analytics.winningTrades,
                losingTrades: analytics.losingTrades,
                avgWin: analytics.avgWin,
                avgLoss: analytics.avgLoss,
                maxProfit: analytics.maxProfit,
                maxLoss: analytics.maxLoss,
                symbols: analytics.symbols,
                strategies: analytics.strategies,
                timeRange: analytics.timeRange
            };

            // 3. Comparison Analysis
            const pnlDifference = Math.abs(validationResults.originalLogic.totalPnL - validationResults.dataValidator.totalPnL);
            const tradeDifference = Math.abs(validationResults.originalLogic.totalTrades - validationResults.dataValidator.totalTrades);

            validationResults.comparison = {
                pnlDifference,
                tradeDifference,
                pnlAccurate: pnlDifference < 100,
                tradeCountAccurate: tradeDifference <= 2,
                overallValid: pnlDifference < 100 && tradeDifference <= 2
            };

            // 4. Symbol Analysis
            const originalSymbols = new Set();
            tradeKeys.forEach(key => {
                groupedResult[key].orders.forEach(order => {
                    originalSymbols.add(order.tradingsymbol);
                });
            });

            const validatorSymbols = new Set(processedData.map(trade => trade.symbol));

            validationResults.symbolAnalysis = {
                originalSymbolCount: originalSymbols.size,
                validatorSymbolCount: validatorSymbols.size,
                symbolsMatch: [...originalSymbols].every(symbol => validatorSymbols.has(symbol)),
                topSymbols: getTopSymbolsByPnL(processedData).slice(0, 5)
            };

            // 5. Summary
            validationResults.summary = {
                totalTransactions: newDbData.length,
                originalTrades: validationResults.originalLogic.totalTrades,
                validatorTrades: validationResults.dataValidator.totalTrades,
                symbolsAnalyzed: validatorSymbols.size,
                strategiesIdentified: validationResults.dataValidator.strategies.length,
                validationPassed: validationResults.comparison.overallValid,
                accuracy: {
                    pnl: validationResults.comparison.pnlAccurate ? 'PASS' : 'FAIL',
                    trades: validationResults.comparison.tradeCountAccurate ? 'PASS' : 'FAIL',
                    symbols: validationResults.symbolAnalysis.symbolsMatch ? 'PASS' : 'FAIL'
                }
            };

            console.log('✅ Logic validation completed successfully');
        });

    } catch (error) {
        console.error('❌ Error during validation:', error);
        validationResults.errors.push(error.message);
    }

    return validationResults;
}

// Helper function to analyze symbols by P&L
function getTopSymbolsByPnL(processedData) {
    const symbolAnalytics = {};
    
    processedData.forEach(trade => {
        if (!symbolAnalytics[trade.symbol]) {
            symbolAnalytics[trade.symbol] = { trades: 0, pnl: 0 };
        }
        symbolAnalytics[trade.symbol].trades++;
        symbolAnalytics[trade.symbol].pnl += trade.pnl;
    });

    return Object.entries(symbolAnalytics)
        .sort(([,a], [,b]) => b.pnl - a.pnl)
        .map(([symbol, data]) => ({
            symbol,
            trades: data.trades,
            pnl: Number(data.pnl.toFixed(2))
        }));
}

// Export validation functions
export {
    validateDashboardLogic as default,
    getTopSymbolsByPnL
};
