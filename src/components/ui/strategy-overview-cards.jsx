'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, Activity, Clock, DollarSign } from 'lucide-react';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatNumber = (value, decimals = 1) => {
  return Number(value).toFixed(decimals);
};

export function StrategyOverviewCards({ portfolioMetrics = {}, strategyAnalytics = {} }) {
  const strategies = Object.values(strategyAnalytics);
  
  // Calculate additional insights
  const bestPerformer = strategies.reduce((best, current) => 
    current.totalPnL > (best.totalPnL || 0) ? current : best, {});
  
  const worstPerformer = strategies.reduce((worst, current) => 
    current.totalPnL < (worst.totalPnL || 0) ? current : worst, {});

  const highestWinRate = strategies.reduce((best, current) => 
    current.winRate > (best.winRate || 0) ? current : best, {});

  const mostTrades = strategies.reduce((most, current) => 
    current.totalTrades > (most.totalTrades || 0) ? current : most, {});

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Strategies */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Strategies</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{portfolioMetrics.totalStrategies || 0}</div>
          <p className="text-xs text-muted-foreground">
            {portfolioMetrics.totalTrades || 0} total trades
          </p>
        </CardContent>
      </Card>

      {/* Best Performing Strategy */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Best Performer</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold capitalize">
            {bestPerformer.strategy || 'N/A'}
          </div>
          <p className="text-xs text-green-600">
            {bestPerformer.totalPnL ? formatCurrency(bestPerformer.totalPnL) : 'No data'}
          </p>
        </CardContent>
      </Card>

      {/* Highest Win Rate Strategy */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Highest Win Rate</CardTitle>
          <Target className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold capitalize">
            {highestWinRate.strategy || 'N/A'}
          </div>
          <p className="text-xs text-blue-600">
            {highestWinRate.winRate ? `${formatNumber(highestWinRate.winRate)}%` : 'No data'}
          </p>
        </CardContent>
      </Card>

      {/* Overall Portfolio Win Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Portfolio Win Rate</CardTitle>
          <DollarSign className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {portfolioMetrics.overallWinRate ? `${formatNumber(portfolioMetrics.overallWinRate)}%` : '0%'}
          </div>
          <p className="text-xs text-muted-foreground">
            Across all strategies
          </p>
        </CardContent>
      </Card>

      {/* Most Active Strategy */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Most Active</CardTitle>
          <Clock className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold capitalize">
            {mostTrades.strategy || 'N/A'}
          </div>
          <p className="text-xs text-orange-600">
            {mostTrades.totalTrades || 0} trades
          </p>
        </CardContent>
      </Card>

      {/* Average Trades per Strategy */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Trades/Strategy</CardTitle>
          <Activity className="h-4 w-4 text-gray-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {portfolioMetrics.avgTradesPerStrategy || '0'}
          </div>
          <p className="text-xs text-muted-foreground">
            Per strategy
          </p>
        </CardContent>
      </Card>

      {/* Total Portfolio P&L */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Portfolio P&L</CardTitle>
          {portfolioMetrics.totalPnL >= 0 ? 
            <TrendingUp className="h-4 w-4 text-green-600" /> : 
            <TrendingDown className="h-4 w-4 text-red-600" />
          }
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${
            portfolioMetrics.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(portfolioMetrics.totalPnL || 0)}
          </div>
          <p className="text-xs text-muted-foreground">
            All strategies combined
          </p>
        </CardContent>
      </Card>

      {/* Worst Performing Strategy */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold capitalize">
            {worstPerformer.strategy || 'N/A'}
          </div>
          <p className="text-xs text-red-600">
            {worstPerformer.totalPnL ? formatCurrency(worstPerformer.totalPnL) : 'No data'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
