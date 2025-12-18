"use client";
import React, { useState, useEffect, useMemo } from "react";

import {
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  DollarSign,
  BarChart as BarChartIcon,
  PieChart,
  Activity,
  Brain,
  CheckSquare,
  Clock,
  ArrowUp,
  ArrowDown,
  Eye,
  X,
  Check,
  Plus,
  Edit,
  User,
  Sun,
  Moon,
  Award,
  Shield,
  AlertTriangle,
  Zap,
  Crosshair,
  Percent,
  Timer,
  Volume2,
  Hourglass,
  Flame,
  Trophy,
} from "lucide-react";
import { ChartRadialStacked } from "../charts/radialChart";
import { CumulativeChart } from "../charts/cumulativeChart";
import { ChartBarDefault } from "../charts/untitled";

import useGlobalState from "@/hooks/globalState";
import { PerformanceHeatmap } from "@/components/charts/PerformanceHeatmap";

// --- UTILITY FUNCTIONS ---
const formatCurrency = (value, currency = "USD") => {
  if (value === 0) return currency === "INR" ? "₹0" : "$0";

  // Just use the currency for symbol, no conversion
  const validCurrency =
    currency && ["USD", "INR"].includes(currency) ? currency : "USD";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: validCurrency,
    minimumFractionDigits: 0,
  }).format(value);
};

const formatDuration = (minutes) => {
  if (minutes < 1) return "<1m";
  if (minutes < 60) {
    return `${Math.round(minutes)}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// --- UI COMPONENTS ---

const Modal = ({ isOpen, onClose, children, widthClass = "w-96" }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      style={{ backgroundColor: "rgba(48, 46, 46, 0.3)" }}
    >
      <div
        className={`bg-white dark:bg-neutral-800 rounded-xl shadow-2xl max-w-full flex flex-col overflow-hidden animate-scale-in ${widthClass}`}
      >
        {children}
      </div>
    </div>
  );
};

const DashboardFilter = ({
  currentFilter,
  setFilter,
  customDateRange,
  onCustomDateClick,
}) => {
  const filters = ["overall", "today", "weekly", "monthly", "custom"];

  const getFilterLabel = (filter) => {
    return filter;
  };

  return (
    <div className="flex flex-col items-end">
      {/* Custom date range display - now above the buttons */}
      {currentFilter === "custom" &&
        customDateRange.start &&
        customDateRange.end && (
          <div className="mb-2 px-3 py-1 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded text-xs text-neutral-600 dark:text-neutral-300 shadow-sm whitespace-nowrap">
            Custom range: {formatDate(customDateRange.start)} to{" "}
            {formatDate(customDateRange.end)}
          </div>
        )}

      <div className="flex bg-neutral-100 dark:bg-neutral-900 rounded-md p-0.5 gap-1">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() =>
              filter === "custom" ? onCustomDateClick() : setFilter(filter)
            }
            className={`px-3 py-1.5 text-xs font-medium capitalize rounded-md transition-colors flex items-center gap-1 ${
              currentFilter === filter
                ? "text-white shadow-sm"
                : "text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
            } ${filter === "custom" ? "min-w-0" : ""}`}
            style={
              currentFilter === filter ? { backgroundColor: "#009966" } : {}
            }
          >
            {filter === "custom" && (
              <Calendar className="h-3 w-3 flex-shrink-0" />
            )}
            <span>{getFilterLabel(filter)}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const MetricInsightModalContent = ({ metric, onClose, filter }) => (
  <>
    <div className="bg-gradient-to-r from-neutral-50 to-blue-50 dark:from-neutral-800 dark:to-blue-900 p-4 border-b border-neutral-100 dark:border-neutral-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
            {/* Use the metric's own icon */}
            <metric.icon className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
              {metric.title}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">
              Analysis for '{filter}' period
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-white dark:hover:bg-neutral-700 hover:shadow-sm transition-all"
        >
          <X className="h-4 w-4 text-neutral-400" />
        </button>
      </div>
    </div>
    <div className="flex-1 p-4 overflow-y-auto bg-neutral-50 dark:bg-neutral-900 space-y-4">
      <div className="bg-white dark:bg-neutral-800 rounded-xl p-3 shadow-sm border border-blue-100 dark:border-blue-800">
        <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
          {metric.analysis}
        </p>
      </div>
    </div>
  </>
);

const DateRangeModal = ({
  isOpen,
  onClose,
  onApply,
  initialStartDate,
  initialEndDate,
}) => {
  const [startDate, setStartDate] = useState(initialStartDate || "");
  const [endDate, setEndDate] = useState(initialEndDate || "");

  useEffect(() => {
    if (isOpen) {
      setStartDate(initialStartDate || "");
      setEndDate(initialEndDate || "");
    }
  }, [isOpen, initialStartDate, initialEndDate]);

  const handleApply = () => {
    if (startDate && endDate) {
      if (new Date(startDate) <= new Date(endDate)) {
        onApply(startDate, endDate);
        onClose();
      } else {
        alert("Start date must be before or equal to end date");
      }
    } else {
      alert("Please select both start and end dates");
    }
  };

  const handleClear = () => {
    onApply(null, null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} widthClass="w-80">
      <div className="bg-gradient-to-r from-neutral-50 to-blue-50 dark:from-neutral-800 dark:to-blue-900 p-4 border-b border-neutral-100 dark:border-neutral-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
              Select Date Range
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white dark:hover:bg-neutral-700 hover:shadow-sm transition-all"
          >
            <X className="h-4 w-4 text-neutral-400" />
          </button>
        </div>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-700 dark:text-neutral-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-700 dark:text-neutral-100"
          />
        </div>
        <div className="flex space-x-2 pt-2">
          <button
            onClick={handleApply}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Apply Filter
          </button>
          <button
            onClick={handleClear}
            className="flex-1 bg-neutral-200 dark:bg-neutral-600 hover:bg-neutral-300 dark:hover:bg-neutral-500 text-neutral-700 dark:text-neutral-200 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Clear Filter
          </button>
        </div>
      </div>
    </Modal>
  );
};

const MetricCard = ({ metric, percentageChange }) => {
  const [isHovered, setIsHovered] = useState(false);
  const IconComponent = metric.icon;
  const statusConfig = {
    good: {
      color: "text-green-600",
      bgColor: "bg-green-50",
      darkBgColor: "dark:bg-green-900",
      borderColor: "border-green-500",
    },
    warning: {
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      darkBgColor: "dark:bg-orange-900",
      borderColor: "border-orange-500",
    },
    bad: {
      color: "text-red-600",
      bgColor: "bg-red-50",
      darkBgColor: "dark:bg-red-900",
      borderColor: "border-red-500",
    },
    neutral: {
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      darkBgColor: "dark:bg-blue-900",
      borderColor: "border-blue-500",
    },
  };
  const config = statusConfig[metric.status] || statusConfig.neutral;

  return (
    <div className="relative group ">
      <div
        className={`flex items-center w-full group bg-white dark:bg-neutral-800 rounded-xl px-4 py-2 shadow-md border border-neutral-100 dark:border-neutral-700 hover:shadow-xl transition-all duration-300 hover:-tranneutral-y-1 relative overflow-hidden`}
        style={{ zIndex: isHovered ? 10000 : "auto" }}
      >
        <div
          className={`absolute inset-0 opacity-5 ${config.bgColor} ${config.darkBgColor}`}
        />
        <div
          className={`absolute top-0 left-0 w-full h-0.5 ${config.borderColor.replace(
            "border-",
            "bg-"
          )}`}
          style={{ borderTopLeftRadius: "12px", borderTopRightRadius: "12px" }}
        />
        <Eye
          className="h-3 w-3 text-neutral-600 dark:text-neutral-300 absolute right-2 top-2 cursor-pointer hover:text-blue-500"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        />

        <div className="relative w-full">
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div
              className={`w-7 h-7 rounded-lg transform tranneutral-y-1 ${config.bgColor} ${config.darkBgColor} flex items-center justify-center shadow-sm`}
            >
              <IconComponent
                className={`h-4 w-4 ${config.color}`}
                strokeWidth={2.5}
              />
            </div>

            {/* Add percentage change indicator */}
            {percentageChange !== undefined && percentageChange !== null && (
              <div
                className={`flex items-center text-xs font-medium ${
                  percentageChange > 0
                    ? "text-green-600"
                    : percentageChange < 0
                    ? "text-red-600"
                    : "text-neutral-500"
                }`}
              >
                {percentageChange > 0 ? (
                  <ArrowUp className="h-3 w-3 mr-1" />
                ) : percentageChange < 0 ? (
                  <ArrowDown className="h-3 w-3 mr-1" />
                ) : null}
                {Math.abs(percentageChange).toFixed(1)}%
              </div>
            )}
          </div>

          <div className="relative z-10">
            <h3 className="text-neutral-500 dark:text-neutral-400 text-sm font-medium mb-2 uppercase tracking-wide">
              {metric.title}
            </h3>
            <p className="text-[22px] font-bold text-neutral-900 dark:text-neutral-100 leading-none">
              {metric.value}
            </p>
          </div>
        </div>

        {metric.others && (
          <div className=" flex h-20 absolute right-0 bottom-0 p-0 m-0 ">
            {/* {JSON.stringify(metric.others)} */}

            <ChartRadialStacked
              win={metric.others.totalWins}
              loss={metric.others.totalLosses}
            />
          </div>
        )}
      </div>
      {isHovered && (
        <div
          className="absolute top-full left-0 mt-2 p-4 bg-white dark:bg-neutral-800 rounded-lg shadow-2xl border-2 border-neutral-300 dark:border-neutral-600 text-sm text-neutral-800 dark:text-neutral-100 max-w-sm font-medium leading-relaxed"
          style={{ zIndex: 10001 }}
        >
          <div className="absolute -top-2 left-4 w-4 h-4 bg-white dark:bg-neutral-800 border-l-2 border-t-2 border-neutral-300 dark:border-neutral-600 transform rotate-45"></div>
          {metric.analysis}
        </div>
      )}
    </div>
  );
};

// --- MAIN DASHBOARD COMPONENT ---

// Add these two functions here, before your main component
const calculatePercentageChange = (oldValue, newValue) => {
  if (oldValue === 0) return newValue === 0 ? 0 : 100;
  return ((newValue - oldValue) / Math.abs(oldValue)) * 100;
};

const getComparisonMetrics = (tradingData, filter, selectedFilter) => {
  const now = new Date();
  let comparisonStartDate, comparisonEndDate;

  // Determine comparison period based on filter
  if (filter === "today") {
    // Compare with yesterday
    comparisonStartDate = new Date(now);
    comparisonStartDate.setDate(now.getDate() - 1);
    comparisonEndDate = new Date(now);
    comparisonEndDate.setDate(now.getDate() - 1);
  } else if (filter === "weekly") {
    // Compare with last week (7 days before the current week)
    comparisonStartDate = new Date(now);
    comparisonStartDate.setDate(now.getDate() - 13); // 13 days ago
    comparisonEndDate = new Date(now);
    comparisonEndDate.setDate(now.getDate() - 7); // 7 days ago
  } else if (filter === "monthly") {
    // Compare with last month
    comparisonStartDate = new Date(now);
    comparisonStartDate.setMonth(now.getMonth() - 1);
    comparisonEndDate = new Date(now);
    comparisonEndDate.setDate(0); // Last day of previous month
  }

  // Filter comparison data
  let comparisonData = tradingData.filter((trade) => {
    const tradeDate = new Date(trade.entry_date || trade.exit_date);
    return tradeDate >= comparisonStartDate && tradeDate <= comparisonEndDate;
  });

  // Apply selectedFilter to comparison data (same logic as main filter)
  if (selectedFilter.value !== "all") {
    comparisonData = comparisonData.filter((trade) => {
      switch (selectedFilter.type) {
        case "strategy":
          return trade.strategy === selectedFilter.value;
        case "mistake":
          return trade.mistake === selectedFilter.value;
        case "day":
          const tradeDay = new Date(
            trade.entry_date || trade.exit_date
          ).toLocaleDateString("en-US", { weekday: "long" });
          return tradeDay === selectedFilter.value;
        case "emotion":
          return trade.feelings === selectedFilter.value;
        case "slot":
          const hour = new Date(trade.entry_date || trade.exit_date).getHours();
          let timeSlot;
          if (hour < 9) timeSlot = "Pre-Market";
          else if (hour < 10) timeSlot = "Opening";
          else if (hour < 12) timeSlot = "Morning";
          else if (hour < 15) timeSlot = "Afternoon";
          else timeSlot = "Closing";
          return timeSlot === selectedFilter.value;
        default:
          return true;
      }
    });
  }

  // Calculate comparison metrics
  const comparisonWinningTrades = comparisonData.filter((t) => t.pnl > 0);
  const comparisonLosingTrades = comparisonData.filter((t) => t.pnl < 0);
  const comparisonTotalTrades = comparisonData.length;
  const comparisonTotalpnl = comparisonData.reduce(
    (sum, t) => sum + (t.pnl || 0),
    0
  );
  const comparisonWinRate =
    comparisonTotalTrades > 0
      ? (comparisonWinningTrades.length / comparisonTotalTrades) * 100
      : 0;

  const comparisonTotalProfit = comparisonWinningTrades.reduce(
    (sum, t) => sum + t.pnl,
    0
  );
  const comparisonTotalLoss = Math.abs(
    comparisonLosingTrades.reduce((sum, t) => sum + t.pnl, 0)
  );
  const comparisonAvgWinSize =
    comparisonWinningTrades.length > 0
      ? comparisonTotalProfit / comparisonWinningTrades.length
      : 0;
  const comparisonAvgLossSize =
    comparisonLosingTrades.length > 0
      ? comparisonTotalLoss / comparisonLosingTrades.length
      : 0;
  const comparisonRiskreward =
    comparisonAvgWinSize / Math.abs(comparisonAvgLossSize) || 0;
  const comparisonExpectancy =
    (comparisonAvgWinSize * comparisonWinRate -
      comparisonAvgLossSize * (100 - comparisonWinRate)) /
      100 || 0;
  const comparisonMaxProfit =
    comparisonData.length > 0
      ? Math.max(0, ...comparisonData.map((t) => t.pnl))
      : 0;
  const comparisonMaxLoss =
    comparisonData.length > 0
      ? Math.max(0, ...comparisonData.map((t) => -t.pnl))
      : 0;
  const comparisonProfitFactor =
    comparisonTotalLoss > 0 ? comparisonTotalProfit / comparisonTotalLoss : 0;

  return {
    totalpnl: comparisonTotalpnl,
    winRate: comparisonWinRate,
    riskreward: comparisonRiskreward,
    avgWinSize: comparisonAvgWinSize,
    avgLossSize: comparisonAvgLossSize,
    totalWins: comparisonWinningTrades.length,
    totalLosses: comparisonLosingTrades.length,
    expectancy: comparisonExpectancy,
    maxProfit: comparisonMaxProfit,
    maxLoss: comparisonMaxLoss,
    profitFactor: comparisonProfitFactor,
  };
};

export default function TradingMetricsSummary({
  tradingData = [],
  selectedFilter = { type: "strategy", value: "all" },
}) {
  // State for the dashboard filter (overall, today, etc.)
  const [metricsFilter, setMetricsFilter] = useState("overall");
  // State to hold the metric selected for modal view
  //const [selectedMetric, setSelectedMetric] = useState(null);

  // Add these two new state variables after line where you have setSelectedMetric
  const [customDateRange, setCustomDateRange] = useState({
    start: null,
    end: null,
  });
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const { currency } = useGlobalState();

  const totalDays = useMemo(
    () =>
      new Set(
        tradingData.map((trade) => {
          const date = trade.entry_date || trade.exit_date;
          return new Date(date).toLocaleDateString("en-IN", {
            timeZone: "Asia/Kolkata",
          });
        })
      ).size,
    [tradingData]
  );

  const handleCustomDateApply = (startDate, endDate) => {
    setCustomDateRange({ start: startDate, end: endDate });
    setMetricsFilter("custom");
  };

  const handleFilterChange = (filter) => {
    if (filter !== "custom") {
      setCustomDateRange({ start: null, end: null });
    }
    setMetricsFilter(filter);
  };

  // Calculate metrics based on current filter
  const metrics = useMemo(() => {
    if (!tradingData || tradingData.length === 0) {
      return {
        winRate: 0,
        totalWins: 0,
        totalLosses: 0,
        avgWinSize: 0,
        avgLossSize: 0,
        tradesPerDay: 0,
        maxProfit: 0,
        avgDuration: 0,
        profitFactor: 0,
        totalpnl: 0,
        maxWinStreak: 0,
        maxLoseStreak: 0,
        riskreward: 0,
        avgtradesperday: 0,
        expectancy: 0,
        maxLoss: 0,
        lossDaysWithIntradayProfit: 0,
        profitDaysWithIntradayLoss: 0,
        cumulativePnlByDay: [],
        maxDrawdown: 0,
        ProfitpnlStdDev: 0,
        dailyMeanProfitPnl: 0,
        profitsharpeRatio: 0,
        LosspnlStdDev: 0,
        LosssharpeRatio: 0,
        dailyMeanLossPnl: 0,
      };
    }

    let filteredData = [...tradingData];

    // 1️⃣ Apply metricsFilter
    const now = new Date();

    filteredData = filteredData.filter((trade) => {
      const tradeDate = new Date(trade.entry_date || trade.exit_date);
      if (!tradeDate) return false;

      if (metricsFilter === "today") {
        const today = now.toISOString().slice(0, 10);
        return tradeDate.toISOString().slice(0, 10) === today;
      }

      if (metricsFilter === "weekly") {
        // Rolling last 7 days including today
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 6);
        return tradeDate >= sevenDaysAgo && tradeDate <= now;
      }

      if (metricsFilter === "monthly") {
        // Current calendar month
        return (
          tradeDate.getFullYear() === now.getFullYear() &&
          tradeDate.getMonth() === now.getMonth()
        );
      }

      if (
        metricsFilter === "custom" &&
        customDateRange.start &&
        customDateRange.end
      ) {
        const startDate = new Date(customDateRange.start);
        const endDate = new Date(customDateRange.end);
        // Set end date to end of day to include trades on the end date
        endDate.setHours(23, 59, 59, 999);
        return tradeDate >= startDate && tradeDate <= endDate;
      }

      if (metricsFilter === "last30days") {
        // Rolling last 30 days including today
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 29);
        return tradeDate >= thirtyDaysAgo && tradeDate <= now;
      }

      // 'overall' = no filter
      return true;
    });

    // 2️⃣ Apply selectedFilter (strategy, mistake, day, emotion, slot)
    if (selectedFilter.value !== "all") {
      filteredData = filteredData.filter((trade) => {
        try {
          switch (selectedFilter.type) {
            case "strategy":
              return trade.strategy === selectedFilter.value;
            case "mistake":
              return trade.mistake === selectedFilter.value;
            case "day":
              const tradeDay = new Date(
                trade.entry_date || trade.exit_date
              ).toLocaleDateString("en-US", { weekday: "long" });
              return tradeDay === selectedFilter.value;
            case "emotion":
              return trade.feelings === selectedFilter.value;
            case "slot":
              const hour = new Date(
                trade.entry_date || trade.exit_date
              ).getHours();
              let timeSlot;
              if (hour < 9) timeSlot = "Pre-Market";
              else if (hour < 10) timeSlot = "Opening";
              else if (hour < 12) timeSlot = "Morning";
              else if (hour < 15) timeSlot = "Afternoon";
              else timeSlot = "Closing";
              return timeSlot === selectedFilter.value;
            default:
              return true;
          }
        } catch (e) {
          console.error("Invalid trade data:", trade);
          return false;
        }
      });
    }

    // 3️⃣ Group by exact calendar day
    const dayTradesMap = {};
    filteredData.forEach((trade) => {
      const date = trade.entry_date || trade.exit_date;
      if (!date) return;
      const dayKey = new Date(date).toISOString().slice(0, 10); // YYYY-MM-DD
      if (!dayTradesMap[dayKey]) dayTradesMap[dayKey] = [];
      dayTradesMap[dayKey].push(trade);
    });

    const winningTrades = filteredData.filter((t) => t.pnl > 0);
    const losingTrades = filteredData.filter((t) => t.pnl < 0);

    const totalTrades = filteredData.length;
    const totalpnl = filteredData.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const totalProfit = winningTrades.reduce((sum, t) => sum + t.pnl, 0);
    const totalLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0));

    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : 0;
    const winRate =
      totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;
    const avgWinSize =
      winningTrades.length > 0 ? totalProfit / winningTrades.length : 0;
    const avgLossSize =
      losingTrades.length > 0 ? totalLoss / losingTrades.length : 0;
    const maxProfit =
      filteredData.length > 0
        ? Math.max(0, ...filteredData.map((t) => t.pnl))
        : 0;
    const maxLoss =
      filteredData.length > 0
        ? Math.max(0, ...filteredData.map((t) => -t.pnl))
        : 0;
    const avgDuration =
      filteredData.length > 0
        ? filteredData.reduce((sum, t) => sum + (t.duration || 0), 0) /
          filteredData.length
        : 0;
    const tradesPerDay = totalDays > 0 ? totalTrades / totalDays : 0;
    const riskreward = avgWinSize / Math.abs(avgLossSize) || 0;
    const avgtradesperday = totalTrades / totalDays || 0;
    const expectancy =
      (avgWinSize * winRate - avgLossSize * (100 - winRate)) / 100 || 0;

    // --- Cumulative PnL by Day ---
    const cumulativePnlByDay = [];
    const dayKeys = Object.keys(dayTradesMap).sort(); // Sort days chronologically
    let runningTotal = 0;
    dayKeys.forEach((day) => {
      const dayTotal = dayTradesMap[day].reduce(
        (sum, trade) => sum + (trade.pnl || 0),
        0
      );
      runningTotal += dayTotal;
      cumulativePnlByDay.push({ day, cumulativePnl: runningTotal });
    });

    // --- Max Drawdown Calculation ---
    let peak = 0;
    let maxDrawdown = 0;
    cumulativePnlByDay.forEach(({ cumulativePnl }) => {
      if (cumulativePnl > peak) peak = cumulativePnl;
      const drawdown = peak - cumulativePnl;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    });

    // --- Streak Calculation ---
    const sortedData = [...filteredData].sort(
      (a, b) => new Date(a.entry_timestamp) - new Date(b.entry_timestamp)
    );
    let maxWinStreak = 0,
      maxLoseStreak = 0,
      currentWinStreak = 0,
      currentLoseStreak = 0;
    for (const t of sortedData) {
      if (t.pnl > 0) {
        currentWinStreak++;
        maxWinStreak = Math.max(maxWinStreak, currentWinStreak);
        currentLoseStreak = 0;
      } else if (t.pnl < 0) {
        currentLoseStreak++;
        maxLoseStreak = Math.max(maxLoseStreak, currentLoseStreak);
        currentWinStreak = 0;
      } else {
        currentWinStreak = 0;
        currentLoseStreak = 0;
      }
    }

    // --- Days ending in loss but saw profit intraday ---
    let lossDaysWithIntradayProfit = 0;
    Object.values(dayTradesMap).forEach((trades) => {
      // Sort trades by entry time for correct cumulative calculation
      const sorted = trades.sort(
        (a, b) => new Date(a.entry_timestamp) - new Date(b.entry_timestamp)
      );
      let cumPnl = 0;
      let sawProfit = false;
      sorted.forEach((trade) => {
        cumPnl += trade.pnl || 0;
        if (cumPnl > 0) sawProfit = true;
      });
      if (cumPnl < 0 && sawProfit) {
        lossDaysWithIntradayProfit++;
      }
    });

    // --- Profit days with intraday loss ---
    let profitDaysWithIntradayLoss = 0;
    Object.values(dayTradesMap).forEach((trades) => {
      // Sort trades by entry time for correct cumulative calculation
      const sorted = trades.sort(
        (a, b) => new Date(a.entry_timestamp) - new Date(b.entry_timestamp)
      );
      let cumPnl = 0;
      let sawLoss = false;
      sorted.forEach((trade) => {
        cumPnl += trade.pnl || 0;
        if (cumPnl < 0) sawLoss = true;
      });
      if (cumPnl > 0 && sawLoss) {
        profitDaysWithIntradayLoss++;
      }
    });

    // --- Daily Mean PnL calculations ---
    function getDailyMeanPnl(dayKeys, dayTradesMap, type = "profit") {
      const isProfit = type === "profit";
      const dailyTotals = dayKeys
        .map((day) => {
          const trades = dayTradesMap[day].filter((trade) =>
            isProfit ? Number(trade.pnl) > 0 : Number(trade.pnl) < 0
          );
          return trades.reduce((sum, trade) => sum + Number(trade.pnl), 0);
        })
        .filter((total) => (isProfit ? total > 0 : total < 0));

      return dailyTotals.length
        ? dailyTotals.reduce((a, b) => a + b, 0) / dailyTotals.length
        : 0;
    }

    const dailyMeanProfitPnl = getDailyMeanPnl(dayKeys, dayTradesMap, "profit");
    const dailyMeanLossPnl = getDailyMeanPnl(dayKeys, dayTradesMap, "loss");

    // --- Standard deviation helper ---
    function getStdDev(values) {
      if (values.length === 0) return 0;
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance =
        values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
      return Math.sqrt(variance);
    }

    // --- Arrays for std dev ---
    const dailyProfitTotals = dayKeys
      .map((day) =>
        dayTradesMap[day]
          .filter((t) => t.pnl > 0)
          .reduce((sum, t) => sum + t.pnl, 0)
      )
      .filter((v) => v > 0);

    const dailyLossTotals = dayKeys
      .map((day) =>
        dayTradesMap[day]
          .filter((t) => t.pnl < 0)
          .reduce((sum, t) => sum + t.pnl, 0)
      )
      .filter((v) => v < 0);

    // --- Std Dev values ---
    const ProfitpnlStdDev = getStdDev(dailyProfitTotals);
    const LosspnlStdDev = getStdDev(dailyLossTotals);

    // --- Sharpe ratios ---
    const riskFreeRate = 0;
    const profitsharpeRatio =
      ProfitpnlStdDev > 0
        ? (dailyMeanProfitPnl - riskFreeRate) / ProfitpnlStdDev
        : 0;
    const LosssharpeRatio =
      LosspnlStdDev > 0 ? (dailyMeanLossPnl - riskFreeRate) / LosspnlStdDev : 0;

    let percentageChanges = {};
    if (
      metricsFilter === "today" ||
      metricsFilter === "weekly" ||
      metricsFilter === "monthly"
    ) {
      // Calculate comparison period data
      const comparisonData = getComparisonMetrics(
        tradingData,
        metricsFilter,
        selectedFilter
      );

      // Calculate percentage changes for each metric
      percentageChanges = {
        totalpnl: calculatePercentageChange(comparisonData.totalpnl, totalpnl),
        winRate: calculatePercentageChange(comparisonData.winRate, winRate),
        riskreward: calculatePercentageChange(
          comparisonData.riskreward,
          riskreward
        ),
        avgWinSize: calculatePercentageChange(
          comparisonData.avgWinSize,
          avgWinSize
        ),
        avgLossSize: calculatePercentageChange(
          comparisonData.avgLossSize,
          avgLossSize
        ),
        expectancy: calculatePercentageChange(
          comparisonData.expectancy,
          expectancy
        ),

        profitFactor: calculatePercentageChange(
          comparisonData.profitFactor,
          profitFactor
        ),
        dailyMeanProfitPnl: calculatePercentageChange(
          comparisonData.dailyMeanProfitPnl,
          dailyMeanProfitPnl
        ),
        dailyMeanLossPnl: calculatePercentageChange(
          comparisonData.dailyMeanLossPnl,
          dailyMeanLossPnl
        ),
        // Add other metrics as needed
      };
    }

    return {
      winRate,
      totalWins: winningTrades.length,
      totalLosses: losingTrades.length,
      avgWinSize,
      avgLossSize,
      tradesPerDay: tradesPerDay.toFixed(1),
      maxProfit,
      avgDuration,
      profitFactor,
      totalpnl,
      maxWinStreak,
      maxLoseStreak,
      riskreward,
      avgtradesperday,
      expectancy,
      maxLoss,
      lossDaysWithIntradayProfit,
      profitDaysWithIntradayLoss,
      cumulativePnlByDay,
      maxDrawdown,
      ProfitpnlStdDev,
      dailyMeanProfitPnl,
      profitsharpeRatio,
      LosspnlStdDev,
      LosssharpeRatio,
      dailyMeanLossPnl,
      percentageChanges,
    };
  }, [tradingData, selectedFilter, totalDays, metricsFilter, customDateRange]);


  const metricsCards = useMemo(
    () => [
      {
        title: "Total PnL",
        value: formatCurrency(metrics.totalpnl, currency),
        icon: DollarSign,
        status: "good",
        analysis:
          "This is the total profit and loss across all trades. A positive total PnL indicates a profitable trading strategy.",
        percentageChange: metrics.percentageChanges?.totalpnl,
      },
      {
        title: "Win Rate",
        value: `${metrics.winRate.toFixed(1)}%`,
        icon: Target,
        // others: {
        //   totalWins: metrics.totalWins.toString(),
        //   totalLosses: metrics.totalLosses.toString(),
        // },
        status:
          metrics.winRate >= 60
            ? "good"
            : metrics.winRate >= 40
            ? "neutral"
            : "bad",
        analysis:
          "Your win rate is the percentage of trades that were profitable. A higher win rate suggests your strategy's entry signals are effective. Consistently above 50% is a strong sign.",
        percentageChange: metrics.percentageChanges?.winRate,
      },
      {
        title: "Risk/Reward Ratio",
        value: metrics.riskreward.toFixed(2),
        icon: Percent,
        status:
          metrics.riskreward >= 1.2
            ? "good"
            : metrics.riskreward >= 1
            ? "neutral"
            : "bad",
        analysis:
          "This ratio compares the potential profit of a trade to its potential loss. A ratio above 1 means you're risking less than you're aiming to gain, which is ideal.",
        percentageChange: metrics.percentageChanges?.winRate,
      },
      {
        title: "Winning Trades",
        value: metrics.totalWins.toString(),
        icon: TrendingUp,
        status: "neutral",
        analysis:
          "The total count of your profitable trades. This metric, combined with win rate, gives a clear picture of your success frequency.",
      },
      {
        title: "Losing Trades",
        value: metrics.totalLosses.toString(),
        icon: TrendingDown,
        status: "neutral",
        analysis:
          "The total count of your unprofitable trades. Analyzing these trades can reveal patterns in mistakes or strategy weaknesses.",
      },
      {
        title: "Expectancy",
        value: metrics.expectancy.toFixed(2),
        icon: Percent,
        status: metrics.expectancy >= 0 ? "good" : "bad",
        analysis:
          "Expectancy measures the average amount you can expect to win or lose per trade. A positive expectancy indicates a potentially profitable strategy.",
        percentageChange: metrics.percentageChanges?.expectancy,
      },
      {
        title: "Max Drawdown",
        value: formatCurrency(metrics.maxDrawdown, currency),
        icon: TrendingDown,
        status: "bad",
        analysis:
          "The largest peak-to-trough decline in your trading account. Understanding your max drawdown is crucial for risk management and ensuring it doesn't exceed your acceptable limits.",
      },
      {
        title: "Avg Duration",
        value: formatDuration(metrics.avgDuration),
        icon: Clock,
        status: "neutral",
        analysis:
          "The average time you hold a position. This helps you understand if you're a short-term scalper, a day trader, or a swing trader.",
        percentageChange: metrics.percentageChanges?.avgDuration,
      },
      {
        title: "Loss After Profit",
        value: metrics.lossDaysWithIntradayProfit.toString(),
        icon: Flame,
        status: metrics.lossDaysWithIntradayProfit > 0 ? "warning" : "neutral",
        analysis:
          "Number of days where you ended with a loss, but were in profit at some point during the day. Indicates missed opportunity to lock in gains or poor risk management.",
      },
      {
        title: "Avg Trades Per Day",
        value: metrics.avgtradesperday.toFixed(1),
        icon: Calendar,
        status: "neutral",
        analysis:
          "This is the average number of trades you take each day. It helps gauge your trading frequency and can indicate your trading style (scalper, day trader, etc.).",
      },
      {
        title: "Avg Win Size",
        value: formatCurrency(metrics.avgWinSize, currency),
        icon: ArrowUp,
        status: "good",
        analysis:
          "This is the average profit on your winning trades. A large average win indicates you're letting your winners run effectively.",
        percentageChange: metrics.percentageChanges?.avgWinSize,
      },
      {
        title: "Avg Loss Size",
        value: formatCurrency(metrics.avgLossSize, currency),
        icon: ArrowDown,
        status: "bad",
        analysis:
          "This is the average loss on your losing trades. Keeping this number small is crucial for long-term profitability. It should ideally be smaller than your average win size.",
        percentageChange: metrics.percentageChanges?.avgLossSize,
      },
      {
        title: "Max Profit",
        value: formatCurrency(metrics.maxProfit, currency),
        icon: Trophy,
        status: "warning",
        analysis:
          "The largest single profit you've made. While encouraging, be wary if your total profit relies too heavily on one or two outlier trades.",
      },
      {
        title: "Max Loss",
        value: formatCurrency(metrics.maxLoss, currency),
        icon: Trophy,
        status: "bad",
        analysis:
          "The largest single loss you've incurred. Understanding your max loss is crucial for risk management and ensuring it doesn't exceed your acceptable limits.",
      },
      {
        title: "COME BACK DAYS",
        value: metrics.profitDaysWithIntradayLoss.toString(),
        icon: Flame,
        status: metrics.profitDaysWithIntradayLoss > 0 ? "warning" : "neutral",
        analysis:
          "Number of days where you ended with a profit, but experienced a loss at some point during the day. Indicates potential volatility in your trading strategy.",
      },
      {
        title: "Max Win Streak",
        value: metrics.maxWinStreak.toString(),
        icon: CheckSquare,
        status: metrics.maxWinStreak >= 3 ? "good" : "neutral",
        analysis:
          "The highest number of consecutive winning trades. Long win streaks indicate strong momentum and discipline.",
      },

      {
        title: "Max Lose Streak",
        value: metrics.maxLoseStreak.toString(),
        icon: AlertTriangle,
        status: metrics.maxLoseStreak >= 3 ? "bad" : "neutral",
        analysis:
          "The highest number of consecutive losing trades. Long losing streaks may signal a need to review your strategy or risk management.",
      },

      // {
      //   title: "Cumulative PnL",

      //   value:
      //     metrics.cumulativePnlByDay.length > 0
      //       ? formatCurrency(
      //           metrics.cumulativePnlByDay[
      //             metrics.cumulativePnlByDay.length - 1
      //           ].cumulativePnl,
      //           currency
      //         )
      //       : formatCurrency(0, currency),
      //   icon: BarChartIcon,
      //   status: "neutral",
      //   analysis:
      //     "This shows your cumulative profit and loss up to the latest day. It helps visualize your overall trading performance over time.",
      // },

      {
        title: "Profit Factor",
        value: metrics.profitFactor.toFixed(2),
        icon: Percent,
        status:
          metrics.profitFactor >= 2
            ? "good"
            : metrics.profitFactor >= 1
            ? "neutral"
            : "bad",
        analysis:
          "Profit Factor is the gross profit divided by the gross loss. A value greater than 1 means your strategy is profitable. Aim for 2 or higher for a robust system.",
        percentageChange: metrics.percentageChanges?.profitFactor,
      },

      {
        title: "Daily Pro PnL Std Dev",
        value: formatCurrency(metrics.ProfitpnlStdDev, currency),
        icon: Activity,
        status: metrics.ProfitpnlStdDev < 1000 ? "good" : "warning",
        analysis:
          "Standard deviation measures the volatility of your daily profits and losses. Lower values mean more consistent results.",
      },

      {
        title: "Daily Mean Profit PnL",
        value: formatCurrency(metrics.dailyMeanProfitPnl, currency),
        icon: TrendingUp,
        status: metrics.dailyMeanProfitPnl >= 0 ? "good" : "bad",
        analysis:
          "The average profit and loss over your trading history. A positive mean PnL indicates overall profitability.",
      },

      {
        title: "Profit Sharpe Ratio",
        value: metrics.profitsharpeRatio.toFixed(2),
        icon: Brain,
        status:
          metrics.profitsharpeRatio > 1
            ? "good"
            : metrics.profitsharpeRatio > 0.5
            ? "neutral"
            : "bad",
        analysis:
          "Sharpe Ratio measures your risk-adjusted return. A higher Sharpe Ratio means better returns for the risk taken. Above 1 is considered good.",
      },
      {
        title: "Daily Loss PnL Std Dev",
        value: formatCurrency(metrics.LosspnlStdDev, currency),
        icon: Activity,
        status: metrics.LosspnlStdDev < 1000 ? "good" : "warning",
        analysis:
          "Standard deviation measures the volatility of your daily losses. Lower values mean more consistent results.",
      },
      {
        title: "Loss Sharpe Ratio",
        value: metrics.LosssharpeRatio.toFixed(2),
        icon: Brain,
        status:
          metrics.LosssharpeRatio > 1
            ? "good"
            : metrics.LosssharpeRatio > 0.5
            ? "neutral"
            : "bad",
        analysis:
          "Sharpe Ratio measures your risk-adjusted return. A higher Sharpe Ratio means better returns for the risk taken. Above 1 is considered good.",
      },
      {
        title: "Loss Mean PnL",
        value: formatCurrency(metrics.dailyMeanLossPnl, currency),
        icon: TrendingDown,
        status: metrics.dailyMeanLossPnl < 0 ? "bad" : "good",
        analysis:
          "The average loss per losing trade. Keeping this value low is crucial for overall profitability.",
      },
    ],
    [metrics]
  );

  const [toShow, setToShow] = useState(10);

  return (
    <div className="w-full px-4 overflow-y-auto py-4  custom-scroll">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex  items-end gap-4 w-full sm:w-auto">
          <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
            Performance Metrics
          </h2>

          {toShow === 10 ? (
            <button
              type="button"
              className="text-neutral-600 cursor-pointer"
              onClick={() => {
                setToShow(metricsCards.length);
              }}
            >
              Show All
            </button>
          ) : (
            <button
              type="button"
              className="text-neutral-600 cursor-pointer"
              onClick={() => {
                setToShow(10);
              }}
            >
              Show Less
            </button>
          )}
        </div>
        {/* The filter component now correctly uses the state */}
        <DashboardFilter
          currentFilter={metricsFilter}
          setFilter={handleFilterChange} // Changed from setMetricsFilter to handleFilterChange
          customDateRange={customDateRange} // New prop added
          onCustomDateClick={() => setIsDateModalOpen(true)} // New prop added
        />
      </div>

      {/* The grid now maps over the correct variable and uses a proper key */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        {metricsCards.slice(0, 5).map((metric) => (
          <MetricCard
            key={metric.title}
            metric={metric}
            percentageChange={metric.percentageChange}
          />
        ))}
      </div>

      <div
        className={`grid lg:grid-cols-5 gap-4 mb-6 lg:grid ${
          toShow === 10 ? "hidden" : "grid-cols-2"
        }`}
      >
        {metricsCards.slice(5, toShow).map((metric) => (
          <MetricCard
            key={metric.title}
            metric={metric}
            percentageChange={metric.percentageChange}
          />
        ))}
      </div>

      <DateRangeModal
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
        onApply={handleCustomDateApply}
        initialStartDate={customDateRange.start}
        initialEndDate={customDateRange.end}
      />

      <div className="flex flex-col lg:flex-row gap-4">
        <CumulativeChart data={metrics.cumulativePnlByDay} />
        <ChartBarDefault data={tradingData} />
      </div>

      <div className="my-4">
        <PerformanceHeatmap data={tradingData} />
      </div>
    </div>
  );
}
// Add these exports at the bottom of your trading-metrics-summary.js file
export { DashboardFilter, DateRangeModal };
