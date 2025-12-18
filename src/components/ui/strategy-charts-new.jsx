'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from "@/hooks/use-mobile"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  LineChart,
  Line
} from 'recharts';

// Custom tooltip component
const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium">{label}</p>
        {payload.map((pld, index) => (
          <p key={index} style={{ color: pld.color }}>
            {`${pld.name}: ${formatter ? formatter(pld.value) : pld.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function StrategyCharts({ strategyMetrics = {} }) {
  const isMobile = useIsMobile();
  if (!strategyMetrics || Object.keys(strategyMetrics).length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No strategy data available</p>
      </div>
    );
  }

  // Prepare data for charts
  const data = Object.entries(strategyMetrics).map(([strategy, metrics]) => ({
    strategy: strategy.charAt(0).toUpperCase() + strategy.slice(1),
    winRate: metrics.winRate,
    totalTrades: metrics.totalTrades,
    avgWinSize: metrics.avgWinSize,
    avgLossSize: Math.abs(metrics.avgLossSize),
    totalPnL: metrics.totalPnL,
    avgDuration: metrics.avgDuration || 45,
    successRate: metrics.winRate
  }));

  // Color schemes
  const CHART_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
  
  // Pie chart data for strategy distribution
  const pieData = data.map((item, index) => ({
    ...item,
    fill: CHART_COLORS[index % CHART_COLORS.length]
  }));

  // Win vs Loss comparison data
  const winLossData = data.map(item => ({
    strategy: item.strategy,
    avgWinSize: item.avgWinSize,
    avgLossSize: item.avgLossSize,
    trades: item.totalTrades
  }));

  // Duration vs Performance data
  const durationData = data.map(item => ({
    duration: item.avgDuration,
    winRate: item.winRate,
    strategy: item.strategy,
    totalPnL: item.totalPnL
  }));

  return (
    <div className="space-y-6">
      {/* Strategy Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Win Rate by Strategy */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Win Rate by Strategy</CardTitle>
            <CardDescription>Performance comparison across different strategies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="strategy" 
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }} 
                    label={{ value: 'Win Rate (%)', angle: -90, position: 'insideLeft' }}
                    domain={[0, 100]}
                  />
                  <Tooltip content={<CustomTooltip formatter={(value) => `${value.toFixed(1)}%`} />} />
                  <Bar 
                    dataKey="winRate" 
                    name="Win Rate (%)"
                    radius={[4, 4, 0, 0]}
                  >
                    {data.map((entry, index) => {
                      const color = entry.winRate >= 70 ? '#10B981' : 
                                   entry.winRate >= 50 ? '#3B82F6' : 
                                   entry.winRate >= 30 ? '#F59E0B' : 
                                   '#EF4444';
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Strategy Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Strategy Distribution</CardTitle>
            <CardDescription>Trade volume distribution by strategy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ strategy, totalTrades }) => `${strategy}: ${totalTrades}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="totalTrades"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip formatter={(value) => `${value} trades`} />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Win/Loss Analysis */}
      <div className={isMobile ? "flex flex-col gap-6" : "grid grid-cols-1 lg:grid-cols-2 gap-6"}>
        {/* Average Win vs Loss Size */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Average Win vs Loss Size</CardTitle>
            <CardDescription>Comparison of average winning and losing trade sizes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={winLossData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="strategy" 
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip content={<CustomTooltip formatter={(value) => `₹${value.toFixed(2)}`} />} />
                  <Bar dataKey="avgWinSize" fill="#10B981" name="Avg Win Size" />
                  <Bar dataKey="avgLossSize" fill="#EF4444" name="Avg Loss Size" />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Trade Count by Strategy */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Trade Count Distribution</CardTitle>
            <CardDescription>Number of trades executed per strategy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="strategy" 
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Number of Trades', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip content={<CustomTooltip formatter={(value) => `${value} trades`} />} />
                  <Bar 
                    dataKey="totalTrades" 
                    fill="#3B82F6" 
                    name="Total Trades"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Duration Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Duration vs Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Duration vs Performance</CardTitle>
            <CardDescription>Correlation between trade duration and win rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={durationData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="duration" 
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Avg Duration (min)', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    dataKey="winRate"
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Win Rate (%)', angle: -90, position: 'insideLeft' }}
                    domain={[0, 100]}
                  />
                  <Tooltip content={<CustomTooltip formatter={(value, name) => 
                    name === 'winRate' ? `${value.toFixed(1)}%` : 
                    name === 'duration' ? `${value} min` : value
                  } />} />
                  <Scatter dataKey="winRate" fill="#8B5CF6" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* P&L by Strategy */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total P&L by Strategy</CardTitle>
            <CardDescription>Overall profit/loss performance per strategy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="strategy" 
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    label={{ value: 'P&L (₹)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip content={<CustomTooltip formatter={(value) => `₹${value.toFixed(2)}`} />} />
                  <Bar 
                    dataKey="totalPnL" 
                    name="Total P&L"
                    radius={[4, 4, 0, 0]}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.totalPnL >= 0 ? '#10B981' : '#EF4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <div className="flex justify-center flex-wrap gap-2 pt-4">
        <Badge variant="outline" className="border-green-500 text-green-700">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          Excellent (≥70%): {data.filter(s => s.winRate >= 70).length} strategies
        </Badge>
        <Badge variant="outline" className="border-blue-500 text-blue-700">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
          Good (50-69%): {data.filter(s => s.winRate >= 50 && s.winRate < 70).length} strategies
        </Badge>
        <Badge variant="outline" className="border-orange-500 text-orange-700">
          <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
          Average (30-49%): {data.filter(s => s.winRate >= 30 && s.winRate < 50).length} strategies
        </Badge>
        <Badge variant="outline" className="border-red-500 text-red-700">
          <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
          Poor (&lt;30%): {data.filter(s => s.winRate < 30).length} strategies
        </Badge>
      </div>
    </div>
  );
}
