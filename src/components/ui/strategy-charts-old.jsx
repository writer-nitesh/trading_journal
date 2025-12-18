'use client'

import React, { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  LineChart,
  Line,
  ComposedChart,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

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

export function StrategyCharts({ strategyMetrics = {} }) {
  const [activeChart, setActiveChart] = useState('performance');

  const data = Object.values(strategyMetrics).map(strategy => ({
    strategy: strategy.strategy,
    winRate: strategy.winRate,
    totalTrades: strategy.totalTrades,
    totalPnL: strategy.totalPnL,
    avgWinSize: strategy.avgWinSize,
    avgLossSize: strategy.avgLossSize,
    winCount: strategy.winCount,
    lossCount: strategy.lossCount,
    riskReward: strategy.riskRewardRatio,
    profitFactor: strategy.profitFactor,
    avgDuration: strategy.avgDuration,
  }));

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Strategy Performance Charts</CardTitle>
          <CardDescription>Visual analysis of strategy performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No data available for charts</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Strategy Performance Charts</CardTitle>
        <CardDescription>Visual analysis of strategy performance metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeChart} onValueChange={setActiveChart} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="winloss">Win/Loss Analysis</TabsTrigger>
            <TabsTrigger value="duration">Duration Analysis</TabsTrigger>
            <TabsTrigger value="distribution">Strategy Distribution</TabsTrigger>
          </TabsList>

          {/* Strategy Type vs Win Rate Chart */}
          <TabsContent value="performance" className="space-y-4">
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
            <div className="flex justify-center flex-wrap gap-2">
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
                Poor ({"<"}30%): {data.filter(s => s.winRate < 30).length} strategies
              </Badge>
            </div>
          </TabsContent>

          {/* Win/Loss Analysis */}
          <TabsContent value="winloss" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Average Win vs Loss Size Chart */}
              <div className="h-80">
                <h4 className="text-sm font-medium mb-3 text-center">Average Win vs Loss Size</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="strategy" 
                      tick={{ fontSize: 10 }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
                    <Legend />
                    <Bar 
                      dataKey="avgWinSize" 
                      name="Avg Win Size"
                      fill="#10B981" 
                      radius={[2, 2, 0, 0]}
                    />
                    <Bar 
                      dataKey="avgLossSize" 
                      name="Avg Loss Size"
                      fill="#EF4444" 
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Win/Loss Trade Count Distribution */}
              <div className="h-80">
                <h4 className="text-sm font-medium mb-3 text-center">Win vs Loss Trade Count</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="strategy" 
                      tick={{ fontSize: 10 }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="winCount" name="Winning Trades" stackId="trades" fill="#10B981" />
                    <Bar dataKey="lossCount" name="Losing Trades" stackId="trades" fill="#EF4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Win/Loss Insights */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Best Avg Win</p>
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(Math.max(...data.map(s => s.avgWinSize)))}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {data.find(s => s.avgWinSize === Math.max(...data.map(d => d.avgWinSize)))?.strategy}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Worst Avg Loss</p>
                <p className="text-lg font-semibold text-red-600">
                  {formatCurrency(Math.max(...data.map(s => s.avgLossSize)))}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {data.find(s => s.avgLossSize === Math.max(...data.map(d => d.avgLossSize)))?.strategy}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Best Risk:Reward</p>
                <p className="text-lg font-semibold text-blue-600">
                  1:{Math.max(...data.map(s => s.riskReward)).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {data.find(s => s.riskReward === Math.max(...data.map(d => d.riskReward)))?.strategy}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Portfolio R:R</p>
                <p className="text-lg font-semibold">
                  1:{(data.reduce((sum, s) => sum + s.riskReward, 0) / data.length).toFixed(2)}
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Duration Analysis */}
          <TabsContent value="duration" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Average Duration by Strategy */}
              <div className="h-80">
                <h4 className="text-sm font-medium mb-3 text-center">Average Duration by Strategy</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="strategy" 
                      tick={{ fontSize: 10 }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 12 }} label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                    <Tooltip content={<CustomTooltip formatter={(value) => `${value.toFixed(1)} hours`} />} />
                    <Bar 
                      dataKey="avgDuration" 
                      name="Avg Duration (hours)"
                      radius={[4, 4, 0, 0]}
                    >
                      {data.map((entry, index) => {
                        const color = entry.avgDuration < 4 ? '#10B981' : // Green for quick trades
                                     entry.avgDuration <= 24 ? '#3B82F6' : // Blue for medium trades
                                     '#F59E0B'; // Orange for long trades
                        return <Cell key={`cell-${index}`} fill={color} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Duration vs Performance Correlation */}
              <div className="h-80">
                <h4 className="text-sm font-medium mb-3 text-center">Duration vs Performance</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="strategy" 
                      tick={{ fontSize: 10 }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      yAxisId="left"
                      dataKey="totalPnL" 
                      name="Total P&L"
                      radius={[4, 4, 0, 0]}
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.totalPnL >= 0 ? '#10B981' : '#EF4444'} />
                      ))}
                    </Bar>
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="avgDuration" 
                      name="Avg Duration (hours)"
                      stroke="#F59E0B" 
                      strokeWidth={3}
                      dot={{ r: 5, fill: "#F59E0B" }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Duration Insights */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Shortest Duration</p>
                <p className="text-lg font-semibold text-green-600">
                  {Math.min(...data.map(s => s.avgDuration)).toFixed(1)}h
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {data.find(s => s.avgDuration === Math.min(...data.map(d => d.avgDuration)))?.strategy}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Longest Duration</p>
                <p className="text-lg font-semibold text-orange-600">
                  {Math.max(...data.map(s => s.avgDuration)).toFixed(1)}h
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {data.find(s => s.avgDuration === Math.max(...data.map(d => d.avgDuration)))?.strategy}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Portfolio Avg</p>
                <p className="text-lg font-semibold">
                  {(data.reduce((sum, s) => sum + s.avgDuration, 0) / data.length).toFixed(1)}h
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Duration Range</p>
                <p className="text-lg font-semibold">
                  {(Math.max(...data.map(s => s.avgDuration)) - Math.min(...data.map(s => s.avgDuration))).toFixed(1)}h
                </p>
              </div>
            </div>

            {/* Duration Categories */}
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-3">Duration Categories</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="border-green-500 text-green-700">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Quick ({"<"}4h): {data.filter(s => s.avgDuration < 4).length} strategies
                </Badge>
                <Badge variant="outline" className="border-blue-500 text-blue-700">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Medium (4-24h): {data.filter(s => s.avgDuration >= 4 && s.avgDuration <= 24).length} strategies
                </Badge>
                <Badge variant="outline" className="border-orange-500 text-orange-700">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                  Long ({">"}24h): {data.filter(s => s.avgDuration > 24).length} strategies
                </Badge>
              </div>
            </div>
          </TabsContent>

          {/* Strategy Distribution */}
          <TabsContent value="distribution" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Strategy Type Distribution */}
              <div className="h-80">
                <h4 className="text-sm font-medium mb-3 text-center">Strategy Type Distribution</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ strategy, totalTrades, percent }) => 
                        `${strategy}: ${totalTrades} (${(percent * 100).toFixed(0)}%)`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="totalTrades"
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* P&L Distribution by Strategy */}
              <div className="h-80">
                <h4 className="text-sm font-medium mb-3 text-center">P&L Distribution by Strategy</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.filter(d => d.totalPnL > 0)} // Only profitable strategies
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ strategy, totalPnL, percent }) => 
                        `${strategy}: ${formatCurrency(totalPnL)} (${(percent * 100).toFixed(0)}%)`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="totalPnL"
                    >
                      {data.filter(d => d.totalPnL > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Strategy Distribution Insights */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Most Active Strategy</p>
                <p className="text-lg font-semibold capitalize text-blue-600">
                  {data.reduce((most, current) => 
                    current.totalTrades > most.totalTrades ? current : most
                  ).strategy}
                </p>
                <p className="text-xs text-muted-foreground">
                  {data.reduce((most, current) => 
                    current.totalTrades > most.totalTrades ? current : most
                  ).totalTrades} trades
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Most Profitable Strategy</p>
                <p className="text-lg font-semibold capitalize text-green-600">
                  {data.reduce((most, current) => 
                    current.totalPnL > most.totalPnL ? current : most
                  ).strategy}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(data.reduce((most, current) => 
                    current.totalPnL > most.totalPnL ? current : most
                  ).totalPnL)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Best Win Rate</p>
                <p className="text-lg font-semibold capitalize text-purple-600">
                  {data.reduce((best, current) => 
                    current.winRate > best.winRate ? current : best
                  ).strategy}
                </p>
                <p className="text-xs text-muted-foreground">
                  {data.reduce((best, current) => 
                    current.winRate > best.winRate ? current : best
                  ).winRate}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Strategies</p>
                <p className="text-lg font-semibold">
                  {data.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  {data.filter(s => s.totalPnL > 0).length} profitable
                </p>
              </div>
            </div>

            {/* Strategy Performance Summary */}
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-3">Strategy Performance Summary</h4>
              <div className="space-y-2">
                {data.map((strategy, index) => (
                  <div key={strategy.strategy} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <div>
                        <p className="font-medium capitalize">{strategy.strategy}</p>
                        <p className="text-xs text-muted-foreground">
                          {strategy.totalTrades} trades • {strategy.winRate}% win rate
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${strategy.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(strategy.totalPnL)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {strategy.avgDuration.toFixed(1)}h avg
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
