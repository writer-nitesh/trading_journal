'use client'

import { TrendingUp, TrendingDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function TradingMetricsCards({ metricsData = {} }) {
  const {
    netPnl = 0,
    winRate = 0,
    numWinTrades = 0,
    numLosingTrades = 0,
    avgWinSize = 0,
    avgLossSize = 0,
    riskReward = 0,
    avgDuration = 0,
    avgTradesPerDay = 0
  } = metricsData

  const metrics = [
    {
      title: "Net P&L",
      value: `₹${netPnl.toLocaleString()}`,
      description: "Total profit/loss",
      trend: netPnl >= 0 ? "up" : "down",
      percentage: Math.abs((netPnl / 100000) * 100).toFixed(1)
    },
    {
      title: "Win Rate",
      value: `${winRate.toFixed(1)}%`,
      description: "Percentage of winning trades",
      trend: winRate >= 50 ? "up" : "down",
      percentage: winRate.toFixed(1)
    },
    {
      title: "Winning Trades",
      value: numWinTrades.toString(),
      description: "Number of profitable trades",
      trend: "neutral",
      percentage: ""
    },
    {
      title: "Losing Trades",
      value: numLosingTrades.toString(),
      description: "Number of loss trades",
      trend: "neutral",
      percentage: ""
    },
    {
      title: "Avg Win Size",
      value: `₹${avgWinSize.toLocaleString()}`,
      description: "Average profit per winning trade",
      trend: "up",
      percentage: ""
    },
    {
      title: "Avg Loss Size",
      value: `₹${Math.abs(avgLossSize).toLocaleString()}`,
      description: "Average loss per losing trade",
      trend: "down",
      percentage: ""
    },
    {
      title: "Risk:Reward",
      value: `1:${riskReward.toFixed(2)}`,
      description: "Risk to reward ratio",
      trend: riskReward >= 1.5 ? "up" : "down",
      percentage: ""
    },
    {
      title: "Avg Duration",
      value: `${avgDuration.toFixed(1)}h`,
      description: "Average trade duration",
      trend: "neutral",
      percentage: ""
    },
    {
      title: "Trades/Day",
      value: avgTradesPerDay.toFixed(1),
      description: "Average trades per day",
      trend: "neutral",
      percentage: ""
    }
  ]

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
      {metrics.map((metric, index) => (
        <Card key={index} className="relative">
          <CardHeader className="pb-2">
            <CardDescription>{metric.description}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {metric.value}
            </CardTitle>
            {metric.trend !== "neutral" && metric.percentage && (
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="gap-1">
                  {metric.trend === "up" ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {metric.percentage}%
                </Badge>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">{metric.title}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
