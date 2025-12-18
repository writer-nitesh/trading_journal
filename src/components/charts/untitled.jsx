"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useMemo } from "react";

const chartConfig = {
  pnl: {
    label: "P&L",
    color: "#0093fc",
  },
};

const formatNumber = (value) => {
  if (value === 0) return "0";
  const abs = Math.abs(value);
  if (abs >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (abs >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toFixed(0);
};

export function ChartBarDefault({ data }) {
  const getDayName = (dateString) => {
    const date = new Date(dateString);
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[date.getDay()];
  };

  const getDayOrder = (dayName) => {
    const dayOrder = {
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
      Sunday: 7,
    };
    return dayOrder[dayName] || 8;
  };

  // Calculate day-wise P&L
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const pnlByDate = {};

    data.forEach((trade) => {
      const exitDate = trade.exit_date;
      const dayName = getDayName(exitDate);

      if (!pnlByDate[dayName]) {
        pnlByDate[dayName] = {
          day: dayName,
          pnl: 0,
        };
      }

      pnlByDate[dayName].pnl += trade.pnl;
    });

    // Sort by day order (Monday to Sunday)
    return Object.values(pnlByDate).sort(
      (a, b) => getDayOrder(a.day) - getDayOrder(b.day)
    );
  }, [data]);

  return (
    <Card className="lg:w-1/2 w-full">
      <CardHeader>
        <CardTitle>Day-wise P&L</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center w-full h-full lg:min-h-52 min-h-[400px]">
        {data && data.length > 0 ? (
          <ChartContainer config={chartConfig} className={"w-full h-full p-4"}>
            <BarChart
              accessibilityLayer
              data={chartData}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${formatNumber(value)}`}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="pnl" maxBarSize={60}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.pnl >= 0 ? "#10B981" : "#EF4444"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-52 ">
            No trade data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
