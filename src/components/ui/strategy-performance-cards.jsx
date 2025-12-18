'use client'

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, BarChart3, Clock, DollarSign } from 'lucide-react';

const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '₹0';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value));
};

const formatPercentage = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.0%';
  }
  return `${Number(value).toFixed(1)}%`;
};

const getStrategyIcon = (strategy) => {
  const icons = {
    breakout: BarChart3,
    momentum: TrendingUp,
    reversal: Target,
    scalping: Clock,
    swing: DollarSign
  };
  return icons[strategy] || BarChart3;
};

const getPerformanceColor = (pnl, winRate) => {
  if (pnl > 0 && winRate >= 60) return 'text-green-600 bg-green-50 border-green-200';
  if (pnl > 0 && winRate >= 40) return 'text-blue-600 bg-blue-50 border-blue-200';
  if (pnl < 0 && winRate < 40) return 'text-red-600 bg-red-50 border-red-200';
  return 'text-yellow-600 bg-yellow-50 border-yellow-200';
};

export function StrategyPerformanceCards({ strategyMetrics = {} }) {
  const strategies = Object.values(strategyMetrics);

  if (strategies.length === 0) {
    return (
      <div className="grid gap-4">
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No strategy data available</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Strategy Overview Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Strategy Performance Analysis</h3>
          <p className="text-sm text-muted-foreground">
            Performance breakdown by trading strategy ({strategies.length} strategies)
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {strategies.reduce((sum, s) => sum + s.totalTrades, 0)} total trades
        </Badge>
      </div>

      {/* Strategy Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {strategies.map((strategy) => {
          const IconComponent = getStrategyIcon(strategy.strategy);
          const performanceColor = getPerformanceColor(strategy.totalPnL, strategy.winRate);

          return (
            <Card key={strategy.strategy} className={`border-2 ${performanceColor.split(' ').slice(2).join(' ')}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${performanceColor.split(' ').slice(1, 2).join(' ')}`}>
                      <IconComponent className={`h-4 w-4 ${performanceColor.split(' ')[0]}`} />
                    </div>
                    <div>
                      <CardTitle className="text-base capitalize">{strategy.strategy}</CardTitle>
                      <CardDescription className="text-xs">
                        {strategy.totalTrades} trades
                      </CardDescription>
                    </div>
                  </div>
                  <Badge 
                    variant={strategy.totalPnL >= 0 ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {strategy.totalPnL >= 0 ? '+' : ''}{formatCurrency(strategy.totalPnL)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Win Rate</p>
                    <div className="flex items-center space-x-1">
                      {strategy.winRate >= 50 ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      )}
                      <span className="text-sm font-semibold">
                        {formatPercentage(strategy.winRate)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Risk:Reward</p>
                    <span className="text-sm font-semibold">
                      1:{strategy.riskRewardRatio.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Win/Loss Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Wins/Losses</span>
                    <span className="font-medium">
                      {strategy.winCount}/{strategy.lossCount}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${strategy.winRate}%` }}
                    />
                  </div>
                </div>

                {/* Average Trade Sizes */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Avg Win</p>
                    <p className="font-medium text-green-600">
                      {formatCurrency(strategy.avgWinSize)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Avg Loss</p>
                    <p className="font-medium text-red-600">
                      {formatCurrency(strategy.avgLossSize)}
                    </p>
                  </div>
                </div>

                {/* Additional Metrics */}
                <div className="pt-2 border-t border-muted">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Profit Factor</span>
                    <span className="font-medium">
                      {strategy.profitFactor.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-muted-foreground">Avg Duration</span>
                    <span className="font-medium">
                      {strategy.avgDuration}h
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Strategy Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">
                {strategies.length}
              </p>
              <p className="text-xs text-muted-foreground">Active Strategies</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {formatPercentage(
                  strategies.reduce((sum, s) => sum + s.winRate, 0) / strategies.length
                )}
              </p>
              <p className="text-xs text-muted-foreground">Overall Win Rate</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {strategies.filter(s => s.totalPnL > 0).length}
              </p>
              <p className="text-xs text-muted-foreground">Profitable Strategies</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {Math.max(...strategies.map(s => s.totalTrades))}
              </p>
              <p className="text-xs text-muted-foreground">Max Trades/Strategy</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
