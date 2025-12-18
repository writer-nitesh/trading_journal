import useGlobalState from '@/hooks/globalState';
import { createContext, useEffect, useState } from 'react';
import { parseBrokerTimestamp } from '../journal/calenderView';

const flattenTrades = (rawData = []) => {
    const result = {};
    rawData.forEach((entry) => {
        // Access the trades object, not the top-level entry
        const trades = entry.trades || {};
        Object.entries(trades).forEach(([key, value]) => {
            if (key.startsWith("TRADE_")) {
                // Preserve all trade data including orders, stop_loss, target_price, feelings
                result[key] = {
                    ...value,
                    orders: Array.isArray(value.orders) ? value.orders.map((order) => ({
                        ...order,
                        ref: key,
                    })) : []
                };
            }
        });
    });
    return result;
};


export const JournalContext = createContext();

export function JournalDataProvider({ children }) {
    const [selectedTrade, setSelectedTrade] = useState('TRADE_001');
    const [selectedDate, setSelectedDate] = useState();
    const [todaysTrade, setTodaysTrade] = useState();

    const { data } = useGlobalState()
    useEffect(() => {
        console.log("🟡 useEffect triggered");
        console.log("selectedDate:", selectedDate);
        console.log("data:", data);

        if (!selectedDate || !Array.isArray(data)) return;

        const newTrade = data.filter((trade) => {
            const rawDate = trade.trades?.date;
            if (!rawDate) return false;

            const parsedDate = parseBrokerTimestamp(rawDate);
            if (!parsedDate) return false;

            // Compare only 'YYYY-MM-DD' strings
            return `${new Date(parsedDate).getFullYear()}-${new Date(parsedDate).getMonth()}-${new Date(parsedDate).getDate()}` === selectedDate;
        });

        console.log("✅ Filtered newTrade:", newTrade);

        const detailsData = flattenTrades(newTrade);
        console.log("📦 detailsData:", detailsData);

        setTodaysTrade(detailsData);
    }, [selectedDate, data]);

    return (
        <JournalContext.Provider value={{
            todaysTrade,
            selectedTrade,
            setSelectedTrade,
            setSelectedDate,
            selectedDate
        }}>
            {children}
        </JournalContext.Provider>
    );
}
