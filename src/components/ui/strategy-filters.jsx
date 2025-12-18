'use client'

import React, { useState } from 'react';
import { Filter, X, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

export function StrategyFilters({ 
  onFiltersChange, 
  activeFilters = {}, 
  strategyMetrics = {},
  availableStrategies = [] 
}) {
  const [filters, setFilters] = useState({
    strategies: [],
    minTrades: 0,
    maxTrades: 100,
    minWinRate: 0,
    maxWinRate: 100,
    minPnL: -50000,
    maxPnL: 50000,
    minRiskReward: 0,
    maxRiskReward: 5,
    sortBy: 'totalPnL',
    sortOrder: 'desc',
    ...activeFilters
  });

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleStrategyToggle = (strategy) => {
    const currentStrategies = filters.strategies;
    const newStrategies = currentStrategies.includes(strategy)
      ? currentStrategies.filter(s => s !== strategy)
      : [...currentStrategies, strategy];
    
    handleFilterChange('strategies', newStrategies);
  };

  const clearFilters = () => {
    const emptyFilters = {
      strategies: [],
      minTrades: 0,
      maxTrades: 100,
      minWinRate: 0,
      maxWinRate: 100,
      minPnL: -50000,
      maxPnL: 50000,
      minRiskReward: 0,
      maxRiskReward: 5,
      sortBy: 'totalPnL',
      sortOrder: 'desc',
    };
    setFilters(emptyFilters);
    onFiltersChange?.(emptyFilters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.strategies.length > 0) count++;
    if (filters.minTrades > 0 || filters.maxTrades < 100) count++;
    if (filters.minWinRate > 0 || filters.maxWinRate < 100) count++;
    if (filters.minPnL > -50000 || filters.maxPnL < 50000) count++;
    if (filters.minRiskReward > 0 || filters.maxRiskReward < 5) count++;
    return count;
  };

  const strategies = availableStrategies.length > 0 
    ? availableStrategies 
    : Object.keys(strategyMetrics);

  // Get min/max values from actual data for better slider ranges
  const getDataRanges = () => {
    if (Object.keys(strategyMetrics).length === 0) {
      return {
        trades: { min: 0, max: 100 },
        pnl: { min: -50000, max: 50000 },
        riskReward: { min: 0, max: 5 }
      };
    }

    const values = Object.values(strategyMetrics);
    return {
      trades: {
        min: Math.min(...values.map(s => s.totalTrades)),
        max: Math.max(...values.map(s => s.totalTrades))
      },
      pnl: {
        min: Math.min(...values.map(s => s.totalPnL)),
        max: Math.max(...values.map(s => s.totalPnL))
      },
      riskReward: {
        min: Math.min(...values.map(s => s.riskRewardRatio)),
        max: Math.max(...values.map(s => s.riskRewardRatio))
      }
    };
  };

  const dataRanges = getDataRanges();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <div>
              <CardTitle>Strategy Filters</CardTitle>
              <CardDescription>
                Filter and sort strategies by performance metrics
              </CardDescription>
            </div>
          </div>
          {getActiveFilterCount() > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {getActiveFilterCount()} active filter{getActiveFilterCount() !== 1 ? 's' : ''}
              </Badge>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Strategy Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Select Strategies</Label>
          <div className="flex flex-wrap gap-2">
            {strategies.map((strategy) => (
              <Badge
                key={strategy}
                variant={filters.strategies.includes(strategy) ? 'default' : 'outline'}
                className="cursor-pointer capitalize"
                onClick={() => handleStrategyToggle(strategy)}
              >
                <BarChart3 className="h-3 w-3 mr-1" />
                {strategy}
                {filters.strategies.includes(strategy) && (
                  <X className="h-3 w-3 ml-1" />
                )}
              </Badge>
            ))}
          </div>
          {filters.strategies.length > 0 && (
            <div className="text-xs text-muted-foreground">
              {filters.strategies.length} of {strategies.length} strategies selected
            </div>
          )}
        </div>

        {/* Sorting Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sortBy">Sort By</Label>
            <Select
              value={filters.sortBy}
              onValueChange={(value) => handleFilterChange('sortBy', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="totalPnL">Total P&L</SelectItem>
                <SelectItem value="winRate">Win Rate</SelectItem>
                <SelectItem value="totalTrades">Total Trades</SelectItem>
                <SelectItem value="riskRewardRatio">Risk:Reward Ratio</SelectItem>
                <SelectItem value="profitFactor">Profit Factor</SelectItem>
                <SelectItem value="avgDuration">Average Duration</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sortOrder">Sort Order</Label>
            <Select
              value={filters.sortOrder}
              onValueChange={(value) => handleFilterChange('sortOrder', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Highest to Lowest</SelectItem>
                <SelectItem value="asc">Lowest to Highest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Range Filters */}
        <div className="space-y-4">
          {/* Trades Range */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Number of Trades</Label>
            <div className="px-2">
              <Slider
                value={[filters.minTrades, filters.maxTrades]}
                onValueChange={([min, max]) => {
                  handleFilterChange('minTrades', min);
                  handleFilterChange('maxTrades', max);
                }}
                max={dataRanges.trades.max}
                min={dataRanges.trades.min}
                step={1}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{filters.minTrades} trades</span>
              <span>{filters.maxTrades} trades</span>
            </div>
          </div>

          {/* Win Rate Range */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Win Rate (%)</Label>
            <div className="px-2">
              <Slider
                value={[filters.minWinRate, filters.maxWinRate]}
                onValueChange={([min, max]) => {
                  handleFilterChange('minWinRate', min);
                  handleFilterChange('maxWinRate', max);
                }}
                max={100}
                min={0}
                step={1}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{filters.minWinRate}%</span>
              <span>{filters.maxWinRate}%</span>
            </div>
          </div>

          {/* P&L Range */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Total P&L (₹)</Label>
            <div className="px-2">
              <Slider
                value={[filters.minPnL, filters.maxPnL]}
                onValueChange={([min, max]) => {
                  handleFilterChange('minPnL', min);
                  handleFilterChange('maxPnL', max);
                }}
                max={Math.max(dataRanges.pnl.max, 50000)}
                min={Math.min(dataRanges.pnl.min, -50000)}
                step={1000}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>₹{filters.minPnL.toLocaleString()}</span>
              <span>₹{filters.maxPnL.toLocaleString()}</span>
            </div>
          </div>

          {/* Risk:Reward Range */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Risk:Reward Ratio</Label>
            <div className="px-2">
              <Slider
                value={[filters.minRiskReward, filters.maxRiskReward]}
                onValueChange={([min, max]) => {
                  handleFilterChange('minRiskReward', min);
                  handleFilterChange('maxRiskReward', max);
                }}
                max={Math.max(dataRanges.riskReward.max, 5)}
                min={0}
                step={0.1}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1:{filters.minRiskReward.toFixed(1)}</span>
              <span>1:{filters.maxRiskReward.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Applied Filters Summary */}
        {getActiveFilterCount() > 0 && (
          <div className="pt-4 border-t">
            <div className="text-sm font-medium mb-2">Applied Filters:</div>
            <div className="flex flex-wrap gap-2">
              {filters.strategies.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  Strategies: {filters.strategies.join(', ')}
                </Badge>
              )}
              {(filters.minTrades > 0 || filters.maxTrades < 100) && (
                <Badge variant="outline" className="text-xs">
                  Trades: {filters.minTrades}-{filters.maxTrades}
                </Badge>
              )}
              {(filters.minWinRate > 0 || filters.maxWinRate < 100) && (
                <Badge variant="outline" className="text-xs">
                  Win Rate: {filters.minWinRate}%-{filters.maxWinRate}%
                </Badge>
              )}
              {(filters.minPnL > -50000 || filters.maxPnL < 50000) && (
                <Badge variant="outline" className="text-xs">
                  P&L: ₹{filters.minPnL.toLocaleString()}-₹{filters.maxPnL.toLocaleString()}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
