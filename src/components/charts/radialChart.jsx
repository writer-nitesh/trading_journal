"use client";

import { TrendingUp } from "lucide-react";
import { PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";

import {
  ChartContainer,
} from "@/components/ui/chart";

export const description = "A radial chart with stacked sections";

const chartConfig = {
  winningTrades: {
    label: "Winning Trades",
    color: "#22c55e",
  },
  loosingTrades: {
    label: "Losing Trades",
    color: "#ef4444",
  },
};

export function ChartRadialStacked({ win, loss }) {
  const winningTrades = parseInt(win, 10) || 0;
  const lossingTrades = parseInt(loss, 10) || 0;

  const total = winningTrades + lossingTrades;
  const winPercentage = total > 0 ? (winningTrades / total) * 100 : 0;
  const lossPercentage = total > 0 ? (lossingTrades / total) * 100 : 0;

  const chartData = [
    {
      winningTrades: winningTrades,
      loosingTrades: lossingTrades,
      winPercentage: winPercentage,
      lossPercentage: lossPercentage,
      total: total,
    },
  ];

  console.log("Chart Data:", chartData);

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto w-full max-w-[100px]"
    >
      <RadialBarChart
        data={chartData}
        barSize={4}
        innerRadius="50%"
        outerRadius="100%"
        startAngle={180}
        endAngle={0}
      >
        <PolarRadiusAxis
          tick={false}
          tickLine={false}
          axisLine={false}
          domain={[0, total]}
        />

        <RadialBar
          dataKey="winningTrades"
          background={{ fill: chartConfig.loosingTrades.color }} 
          cornerRadius={5}
          fill={chartConfig.winningTrades.color} 
          stroke="transparent"
          strokeWidth={2}
        />
      </RadialBarChart>
    </ChartContainer>
  );
}
