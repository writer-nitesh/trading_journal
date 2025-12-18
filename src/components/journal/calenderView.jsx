'use client';
import { useCallback, useContext } from 'react';
import { ChevronLeft, ChevronRight, Calendar, ChevronDown, X } from 'lucide-react';
import { isDateToday } from '@/lib/dateCalculator';
import TradeCard from './tradeCard';
import { formatNumber, salsaFont } from '@/lib/utils';
import { CalenderContext } from './calenderDataProvider';
import { JournalContext } from '../details/journalDetailsProvider';
import { calculateOverallPnL } from '@/lib/logic';
import GetOrders from '../getOrders';
import useGlobalState from '@/hooks/globalState';
import { useState } from 'react';

export function parseBrokerTimestamp(timestamp) {
    return new Date(timestamp);
}

const DatePickerModal = ({ isOpen, onClose, onDateSelect, currentDate }) => {
    const [selectedDate, setSelectedDate] = useState(
        currentDate ? new Date(currentDate) : new Date()
    );

    const currentYear = selectedDate.getFullYear();
    const currentMonth = selectedDate.getMonth();

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Generate year options (current year ± 10 years)
    const currentActualYear = new Date().getFullYear();
    const yearOptions = [];
    for (let i = currentActualYear - 10; i <= currentActualYear + 5; i++) {
        yearOptions.push(i);
    }

    const handleYearChange = (year) => {
        setSelectedDate(new Date(parseInt(year), currentMonth, 1));
    };

    const handleMonthChange = (month) => {
        setSelectedDate(new Date(currentYear, parseInt(month), 1));
    };

    const handleDateClick = (date) => {
        onDateSelect(date);
        onClose();
    };

    const generateCalendarDays = () => {
        const days = [];
        const today = new Date();
        
        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            const isCurrentMonth = date.getMonth() === currentMonth;
            const isToday = date.toDateString() === today.toDateString();
            const isSelected = currentDate && date.toDateString() === new Date(currentDate).toDateString();
            
            days.push({
                date,
                day: date.getDate(),
                isCurrentMonth,
                isToday,
                isSelected
            });
        }
        
        return days;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 pointer-events-none">
            <div 
                className="absolute top-16 left-1/2 transform -translate-x-1/2 pointer-events-auto"
                style={{ zIndex: 1000 }}
            >
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-2xl border border-neutral-200 dark:border-neutral-700 p-4 w-80">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-black dark:text-white">
                            Select Date
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded"
                        >
                            <X className="w-4 h-4 text-black dark:text-white" />
                        </button>
                    </div>

                    {/* Year and Month Selectors */}
                    <div className="flex gap-2 mb-4">
                        <select
                            value={currentMonth}
                            onChange={(e) => handleMonthChange(e.target.value)}
                            className="flex-1 px-3 py-2 text-sm bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                            {monthNames.map((month, index) => (
                                <option key={index} value={index}>
                                    {month}
                                </option>
                            ))}
                        </select>
                        
                        <select
                            value={currentYear}
                            onChange={(e) => handleYearChange(e.target.value)}
                            className="px-3 py-2 text-sm bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                            {yearOptions.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-0.5 mb-1">
                        {weekDays.map(day => (
                            <div
                                key={day}
                                className="p-1 text-center text-xs font-medium text-neutral-500 dark:text-neutral-400"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-0.5 mb-3">
                        {generateCalendarDays().map((day, index) => (
                            <button
                                key={index}
                                onClick={() => handleDateClick(day.date)}
                                className={`
                                    p-1.5 text-xs rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors
                                    ${!day.isCurrentMonth 
                                        ? 'text-neutral-300 dark:text-neutral-600' 
                                        : 'text-black dark:text-white'
                                    }
                                    ${day.isToday 
                                        ? 'bg-teal-100 text-teal-900 dark:bg-teal-900 dark:text-teal-200' 
                                        : ''
                                    }
                                    ${day.isSelected 
                                        ? 'bg-teal-500 text-white' 
                                        : ''
                                    }
                                `}
                            >
                                {day.day}
                            </button>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                        <button
                            onClick={() => handleDateClick(new Date())}
                            className="px-3 py-1.5 text-xs bg-teal-500 text-white rounded hover:bg-teal-600"
                        >
                            Today
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Backdrop to close */}
            <div 
                className="fixed inset-0 pointer-events-auto"
                onClick={onClose}
            />
        </div>
    );
};

const WeeklyCalendar = () => {
    const { weekOffset, setWeekOffset, weekData } = useContext(CalenderContext);
    const { data } = useGlobalState()
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    const handlePrevWeek = useCallback(() => {
        setWeekOffset(prev => prev - 1);
    }, []);

    const handleNextWeek = useCallback(() => {
        setWeekOffset(prev => prev + 1);
    }, []);

    const handleToday = useCallback(() => {
        setWeekOffset(0);
    }, []);

    const handleCalendarClick = () => {
    setIsDatePickerOpen(true);
};

const handleDateSelect = (selectedDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for accurate comparison
    
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    
    // Find Monday of current week
    const currentMonday = new Date(today);
    const currentDayOfWeek = today.getDay();
    const daysFromMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1; // Handle Sunday as 6 days from Monday
    currentMonday.setDate(today.getDate() - daysFromMonday);
    
    // Find Monday of selected week
    const selectedMonday = new Date(selected);
    const selectedDayOfWeek = selected.getDay();
    const selectedDaysFromMonday = selectedDayOfWeek === 0 ? 6 : selectedDayOfWeek - 1;
    selectedMonday.setDate(selected.getDate() - selectedDaysFromMonday);
    
    // Calculate week difference
    const diffInTime = selectedMonday.getTime() - currentMonday.getTime();
    const diffInWeeks = Math.round(diffInTime / (7 * 24 * 60 * 60 * 1000));
    
    setWeekOffset(diffInWeeks);
    setIsDatePickerOpen(false);
};
    
    const getDataForDate = (date) => {
        if (!date) return [];

        const inputDateOnly = new Date(date).toLocaleDateString("en-US")

        const matchedItems = data.filter((item) => {
            const rawDate = item?.trades?.date;
            if (!rawDate) return false;

            const itemDateOnly = rawDate
            const isMatch = itemDateOnly === inputDateOnly;

            console.log("🔎 comparing:", itemDateOnly, "===", inputDateOnly, "=>", isMatch);

            return isMatch;
        });

        if (matchedItems.length === 0) {
            console.warn("⚠️ No items found for", inputDateOnly);
            return [];
        }

        return matchedItems.map(item => ({
            ...item.trades,
            id: item.id,
        }));
    };

    
        return (
    <>
        <div className="w-full h-[calc(100vh-5rem)] flex flex-col bg-white text-black dark:bg-neutral-900 dark:text-white" >
            {/* Header */}
            <div className="flex items-center justify-between px-2 my-1 pb-0  ">
                {/* Centered navigation */}
                <div className="flex-1 flex justify-center">
                    <div className="flex items-center lg:gap-3 gap-1.5 lg:text-base text-xs">
                        <button onClick={handlePrevWeek} className="p-1 lg:p-2 rounded-lg">
                            <ChevronLeft className="w-5 h-5 text-black dark:text-neutral-300" />
                        </button>
                        <button onClick={handleToday} className="px-4 py-2 font-medium rounded-lg text-black dark:text-white">
                            {weekData.title}
                        </button>
                        <button onClick={handleNextWeek} className="p-1 lg:p-2 rounded-lg">
                            <ChevronRight className="w-5 h-5 text-black dark:text-neutral-300" />
                        </button>
                        <button 
    onClick={handleCalendarClick}
    className="p-2 rounded-lg ml-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
    title="Select Date"
>
    <Calendar className="w-5 h-5 text-black dark:text-neutral-300" />
</button>
                    </div>
                </div>

                <div className="flex bg-teal-50 dark:bg-transparent rounded-lg p-1">
                    <button
                        className="px-4 py-2 text-teal-700 font-medium bg-teal-100 rounded-md hover:bg-teal-200 transition-colors"
                        onClick={() => window.location.href = '/dashboard/trades'}
                    >
                        Table View
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid lg:grid-cols-5 grid-flow-col auto-cols-[200px]  gap-px bg-neutral-200 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 rounded-md lg:overflow-hidden" >
                {
                    days.map((day, index) => {
                        const date = weekData.dates[index];
                        const isToday = date && isDateToday(date)
                        const dayData = getDataForDate(date);
                        const pnlResult = calculateOverallPnL(dayData);
                        const totalPnL = pnlResult.pnl

                        const totalValue = {
                            type: pnlResult.type,
                            pnl: Math.abs(totalPnL).toFixed(2),
                        };

                        return (
                            <div key={day} className="bg-white text-black dark:bg-neutral-800 dark:text-white flex flex-col h-[calc(100vh-9rem+4px)]">
                                {/* Day Header */}
                                <div
                                    className={`px-4 ${salsaFont.className} py-3 border-b h-14 rounded border-neutral-200 dark:border-neutral-700 flex justify-between items-center relative ${isToday ? "bg-teal-100 text-teal-900 dark:bg-teal-900 dark:text-teal-200" : "bg-white text-black dark:bg-neutral-800 dark:text-white"}`}
                                >
                                    <div className="flex flex-col items-start justify-start w-full">
                                        <h3
                                            className={`font-medium ${isToday ? "text-teal-900 dark:text-teal-200" : "text-black dark:text-white"}`}
                                        >
                                            {day}
                                        </h3>
                                        <span className="text-black dark:text-neutral-400">
                                            {date
                                                ? new Date(date).getDate()
                                                : ""}
                                        </span>
                                    </div>
                                    {dayData.length > 0 && (
                                        <div
                                            className={`${totalValue.type === "PROFIT"
                                                ? "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-200"
                                                : "bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-200"
                                                } rounded-full px-2 py-1 absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-1`}
                                        >
                                            {totalValue.type === "PROFIT" ? "+" : "-"} {formatNumber(totalValue?.pnl) ?? 0}
                                        </div>
                                    )}
                                </div>

                                {/* Day Content */}
                                <div className="h-full p-3 flex flex-col overflow-y-auto custom-scroll bg-white text-black dark:bg-neutral-900 dark:text-white">
                                    {
                                        dayData.length > 0 ? (
                                            <div className="space-y-2">
                                                {dayData
                                                    .flatMap(dataObj =>
                                                        Object.entries(dataObj)
                                                            .filter(([key]) => key.startsWith("TRADE_"))
                                                            .map(([key, orders]) => ({ tradeId: key, orders }))
                                                    )
                                                    .sort((a, b) => a.tradeId.localeCompare(b.tradeId))
                                                    .map((trade, idx) => {
                                                        return <TradeCard
                                                            key={idx}
                                                            tradeId={trade.tradeId}
                                                            tradeDate={date}
                                                            data={trade}
                                                        />
                                                    })}
                                            </div>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-neutral-500 dark:text-neutral-400">
                                                {isToday ?
                                                    <GetOrders showElseCondition={true} />
                                                    : "No Trades"}
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                        );
                    })
                }
            </div>
            
            
            {/* Add this DatePickerModal */}
            <DatePickerModal
                isOpen={isDatePickerOpen}
                onClose={() => setIsDatePickerOpen(false)}
                onDateSelect={handleDateSelect}
                currentDate={weekData.dates && weekData.dates[0]}
            />

            
        </div >
        </>
    );

};

export default WeeklyCalendar;