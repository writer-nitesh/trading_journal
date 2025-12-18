'use client'

import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import { Badge } from '@/components/ui/badge';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

function parseTimestamp(input) {
  if (!input) return null;

  try {
    if (typeof input.toDate === 'function') {
      return input.toDate();
    }
    if (typeof input.seconds === 'number') {
      return new Date(input.seconds * 1000);
    }
    const parsed = new Date(input);
    return isNaN(parsed.getTime()) ? null : parsed;
  } catch {
    return null;
  }
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3">
        <p className="font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {`${entry.dataKey}: ${formatter ? formatter(entry.value) : entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function StrategyCharts({ strategyMetrics = {}, tradingData = [], selectedFilter = { type: "strategy", value: "all" } }) {

  console.log("StrategyCharts received tradingData:", tradingData, tradingData.length);
  console.log("StrategyCharts received strategyMetrics:", strategyMetrics, strategyMetrics.length);

  // Process all trading data and group by the selected filter type
  const data = React.useMemo(() => {
    console.log("StrategyCharts received tradingData:", tradingData.length, "items");
    console.log("Selected filter:", selectedFilter);

    if (!tradingData || tradingData.length === 0) {
      console.log("No trading data available");
      return [];
    }

    // Group data by the selected filter type
    const groupedData = {};

    console.log("tradingData:--------------", tradingData, "items");


    tradingData.forEach(trade => {
      let key;
      switch (selectedFilter.type) {
        case "strategy":
          key = typeof trade.strategy === 'string' ? trade.strategy : 'Unknown';
          break;
        case "mistake":
          key = typeof trade.mistake === 'string' ? trade.mistake : 'No Mistake';
          break;
        case "day":
          const rawDate = trade.entry_date || trade.exit_date;
          const parsedDate = parseTimestamp(rawDate);

          if (parsedDate) {
            // Use UTC to get consistent weekday
            key = parsedDate.toLocaleDateString('en-GB', {
              weekday: 'long',
              timeZone: 'UTC'
            });
          } else {
            console.error("Invalid date in trade:", rawDate);
            key = 'Unknown';
          }
          break;

        case "emotion":
          const displayText = {
            'calm': 'Calm',
            'overconfident': 'Over confident',
            'nervous': 'Nervous',
            'confused': 'Confused',
            'revenge': 'Revenge mode',
            'happy': 'Happy',
            'fear': 'Fear',
            'lettinggo': 'Letting go',
            'hardwork': 'Hard work paid off',
            'wanttolearn': 'Want to learn',
            'Not Selected': 'Not Selected'
          };
          key = typeof trade.feelings === 'string' && trade.feelings
            ? (displayText[trade.feelings] || trade.feelings)
            : 'Not Selected';
          break;
        case "slot":
          const rawTime = trade.entry_timestamp || trade.exit_timestamp;
          const timeObj = rawTime instanceof Date ? rawTime : parseTimestamp(rawTime);

          if (timeObj) {
            const hours = timeObj.getHours(); // Use local time instead of UTC
            const minutes = timeObj.getMinutes();
            const timeInMinutes = hours * 60 + minutes;

            // Indian stock market hours: 9:15 AM to 3:30 PM
            if (timeInMinutes >= 555 && timeInMinutes < 675) { // 9:15 AM to 11:15 AM
              key = "Morning Session";
            } else if (timeInMinutes >= 676 && timeInMinutes < 795) { // 11:16 AM to 1:15 PM
              key = "Middle Session";
            } else if (timeInMinutes >= 796 && timeInMinutes <= 930) { // 1:45 PM to 3:30 PM
              key = "Afternoon Session";
            } else {
              key = "Outside Trading Hours";
            }
          } else {
            console.error("Invalid timestamp for slot in trade:", rawTime);
            key = 'Unknown';
          }
          break;
        default:
          key = typeof trade.strategy === 'string' ? trade.strategy : 'Unknown';
      }

      // Ensure key is always a string and handle empty/null values
      key = key || 'Unknown';

      if (!groupedData[key]) {
        groupedData[key] = [];
      }
      groupedData[key].push(trade);
    });

    // Calculate metrics for each group
    const result = Object.entries(groupedData).map(([key, trades]) => {
      const winningTrades = trades.filter(t => t.pnl > 0);
      const losingTrades = trades.filter(t => t.pnl < 0);
      const totalPnL = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
      const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;
      const avgWin = winningTrades.length > 0 ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length : 0;
      const avgLoss = losingTrades.length > 0 ? Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length) : 0;
      const avgDuration = trades.reduce((sum, t) => sum + (t.duration || 45), 0) / trades.length;

      console.log(`Group ${key}:`, { trades: trades.length, totalPnL, winRate });

      return {
        strategy: key === 'Unknown' ? 'Not Selected' : key,
        winRate: winRate,
        totalTrades: trades.length,
        totalPnL: totalPnL,
        avgWin: avgWin,
        avgLoss: avgLoss,
        avgDuration: avgDuration.toFixed(1),
        sharpeRatio: 0, // Simplified
        maxDrawdown: 0, // Simplified
      };
    });

    // Sort by day order if filter type is "day"
    if (selectedFilter.type === "day") {
      const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      return result.sort((a, b) => {
        const dayA = dayOrder.indexOf(a.strategy);
        const dayB = dayOrder.indexOf(b.strategy);
        
        // If both days are found, sort by day order
        if (dayA !== -1 && dayB !== -1) {
          return dayA - dayB;
        }
        
        // If only one day is found, put the found one first
        if (dayA !== -1) return -1;
        if (dayB !== -1) return 1;
        
        // If neither day is found, sort alphabetically
        return a.strategy.localeCompare(b.strategy);
      });
    }

    // For other filter types, sort by profitability
    return result.sort((a, b) => b.totalPnL - a.totalPnL);
  }, [tradingData, selectedFilter]);

  // Calculate dynamic Y-axis domain for win rate
  const winRateDomain = React.useMemo(() => {
    if (data.length === 0) return [0, 100];
    
    const winRates = data.map(item => item.winRate);
    const maxWinRate = Math.max(...winRates);
    const minWinRate = Math.min(...winRates);
    
    // Add some padding to make the chart more readable
    const padding = Math.max(5, (maxWinRate - minWinRate) * 0.1);
    const upperLimit = Math.min(100, maxWinRate + padding);
    const lowerLimit = Math.max(0, minWinRate - padding);
    
    return [lowerLimit, upperLimit];
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>No strategy data available</p>
      </div>
    );
  }

  // Prepare duration data with categories
  const durationData = data.map(item => ({
    ...item,
    durationCategory: item.avgDuration < 30 ? 'Quick' :
      item.avgDuration < 60 ? 'Medium' : 'Long'
  }));

  // Strategy distribution data
  const strategyDistribution = data.map((item, index) => ({
    name: item.strategy,
    value: item.totalTrades,
    pnl: item.totalPnL,
    fill: COLORS[index % COLORS.length]
  }));

  const sortedData = [...data].sort((a, b) => b.totalTrades - a.totalTrades);


  return (
    <div className="space-y-0 p-6">

      {/* 1. Dynamic Performance Chart */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">
            {selectedFilter.type.charAt(0).toUpperCase() + selectedFilter.type.slice(1)} Performance Overview
          </h3>
        </div>
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Performance chart on left side */}
          <div className="h-80">
            <h4 className="text-sm font-medium ">Win Rate by {selectedFilter.type.charAt(0).toUpperCase() + selectedFilter.type.slice(1)}</h4>

            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 40, right: 30, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" />                
                <XAxis
                  dataKey="strategy"
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={64}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Win Rate (%)', angle: -90, position: 'insideLeft' }}
                  domain={winRateDomain}
                  tickFormatter={(value) => `${value.toFixed(0)}%`}
                />
                <Tooltip content={<CustomTooltip formatter={(value) => `${value.toFixed(1)}%`} />} />
                <Bar
                  dataKey="winRate"
                  name="Win Rate (%)"
                  radius={[4, 4, 0, 0]}
                >
                  {data.map((entry, index) => {
                    const color = entry.winRate >= 70 ? '#10B981' : // Green for high win rate
                      entry.winRate >= 50 ? '#3B82F6' : // Blue for medium win rate
                        entry.winRate >= 30 ? '#F59E0B' : // Orange for low win rate
                          '#EF4444'; // Red for very low win rate
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Empty right side */}
          <div>
            {/* Average Win vs Loss Comparison */}
            <div className="h-64">
              <h4 className="text-sm font-medium mb-2">Average Win vs Loss Size</h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="strategy" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
                  <Legend />
                  <Bar dataKey="avgWin" fill="#10B981" name="Avg Win" />
                  <Bar dataKey="avgLoss" fill="#EF4444" name="Avg Loss" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>

      {/* 2. Win/Loss Analysis */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Average Duration by Strategy */}
          <div className="h-64">
            <h4 className="text-sm font-medium mb-2">Average Duration by {selectedFilter.type.charAt(0).toUpperCase() + selectedFilter.type.slice(1)}</h4>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={durationData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="strategy" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                <Tooltip content={<CustomTooltip formatter={(value) => `${value} min`} />} />
                <Bar dataKey="avgDuration" name="Avg Duration (min)">
                  {durationData.map((entry, index) => {
                    const color = entry.durationCategory === 'Quick' ? '#10B981' :
                      entry.durationCategory === 'Medium' ? '#F59E0B' : '#EF4444';
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Trade Count Distribution */}
          <div className="h-64">
            <h4 className="text-sm font-medium mb-2">Trade Count by {selectedFilter.type.charAt(0).toUpperCase() + selectedFilter.type.slice(1)}</h4>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={sortedData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="strategy" tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="totalTrades" name="Total Trades">
                  {sortedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

          </div>
        </div>
      </div>



    </div>
  );
}