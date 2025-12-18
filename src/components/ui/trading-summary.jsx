'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity, Clock } from 'lucide-react';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(value);
};

export function TradingSummary({ data = {} }) {
  const [currentDate, setCurrentDate] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setCurrentDate(new Date().toLocaleDateString('en-IN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }));
  }, []);

  const {
    todayPnL = 0,
    todayTrades = 0,
    todayWinRate = 0,
    todayVolume = 0,
    isMarketOpen = false,
    lastTradeTime = null,
  } = data;

  const isProfitable = todayPnL > 0;

  return (
    <Card className="border-2 border-dashed border-muted-foreground/25">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Today's Trading Summary</CardTitle>
            <CardDescription className="text-sm">
              {isClient ? currentDate : 'Loading...'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isMarketOpen ? 'default' : 'secondary'} className="text-xs">
              <Activity className="mr-1 h-3 w-3" />
              {isMarketOpen ? 'Market Open' : 'Market Closed'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center space-x-1">
              {isProfitable ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm font-medium text-muted-foreground">P&L</span>
            </div>
            <div className={`text-2xl font-bold ${
              isProfitable ? 'text-green-600' : todayPnL < 0 ? 'text-red-600' : 'text-gray-600'
            }`}>
              {formatCurrency(todayPnL)}
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-muted-foreground">Trades</span>
            <div className="text-2xl font-bold">
              {todayTrades}
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-muted-foreground">Win Rate</span>
            <div className="text-2xl font-bold">
              {todayWinRate.toFixed(1)}%
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-muted-foreground">Volume</span>
            <div className="text-2xl font-bold">
              {formatCurrency(todayVolume)}
            </div>
          </div>
        </div>

        {lastTradeTime && (
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Last trade:</span>
            </div>
            <span className="text-sm font-medium">
              {lastTradeTime && isClient ? new Date(lastTradeTime).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
              }) : '--:--'}
            </span>
          </div>
        )}

        {todayTrades === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">No trades yet today</p>
            <p className="text-xs text-muted-foreground mt-1">
              {isMarketOpen ? 'Market is open - good luck!' : 'Market is closed'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
