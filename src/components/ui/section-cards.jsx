"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, TrendingDownIcon } from "lucide-react";

export function SectionCards({ metrics }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercentage = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0.00%';
    }
    return `${Number(value).toFixed(2)}%`;
  };

  const getChangeIcon = (value, isPositive = true) => {
    if (isPositive) {
      return value >= 0 ? (
        <ArrowUpIcon className="h-4 w-4 text-green-600" />
      ) : (
        <ArrowDownIcon className="h-4 w-4 text-red-600" />
      );
    }
    return value >= 0 ? (
      <TrendingUpIcon className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDownIcon className="h-4 w-4 text-red-600" />
    );
  };

  const cards = [
    {
      title: "Net P&L",
      value: metrics.netPnL || 0,
      change: metrics.netPnLChange || 0,
      description: "Total profit and loss",
      format: "currency",
    },
    {
      title: "Win Rate",
      value: metrics.winRate || 0,
      change: metrics.winRateChange || 0,
      description: "Percentage of winning trades",
      format: "percentage",
    },
    {
      title: "Total Trades",
      value: metrics.totalTrades || 0,
      change: metrics.totalTradesChange || 0,
      description: `${metrics.winTrades || 0} wins / ${metrics.lossTrades || 0} losses`,
      format: "number",
    },
    {
      title: "Risk Reward",
      value: metrics.riskReward || 0,
      change: metrics.riskRewardChange || 0,
      description: "Average risk to reward ratio",
      format: "number",
    },
    {
      title: "Avg Win Size",
      value: metrics.avgWinSize || 0,
      change: metrics.avgWinSizeChange || 0,
      description: "Average winning trade amount",
      format: "currency",
    },
    {
      title: "Avg Loss Size",
      value: metrics.avgLossSize || 0,
      change: metrics.avgLossSizeChange || 0,
      description: "Average losing trade amount",
      format: "currency",
    },
    {
      title: "Avg Duration",
      value: metrics.avgDuration || 0,
      change: metrics.avgDurationChange || 0,
      description: "Average trade duration (hours)",
      format: "number",
    },
    {
      title: "Trades/Day",
      value: metrics.tradesPerDay || 0,
      change: metrics.tradesPerDayChange || 0,
      description: "Average trades per day",
      format: "number",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {card.title}
            </CardTitle>
            {getChangeIcon(card.change)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {card.format === "currency" && formatCurrency(card.value)}
              {card.format === "percentage" && formatPercentage(card.value)}
              {card.format === "number" && card.value.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {card.description}
            </p>
            {card.change !== 0 && (
              <p className={`text-xs ${card.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {card.change >= 0 ? '+' : ''}{card.format === "percentage" ? formatPercentage(card.change) : card.change.toFixed(2)}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
