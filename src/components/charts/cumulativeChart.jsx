"use client"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// 1. Define the chart configuration to match YOUR data structure
const chartConfig = {
  cumulativePnl: { // Changed from "desktop" to match your data key
    label: "Cumulative PnL", // Updated the label for clarity
    color: "#0394fc", // Green color for cumulative PnL
  },
}

export function CumulativeChart({ data }) {


  return (
    <Card className="lg:w-1/2 w-full h-full">
      <CardHeader>
        <CardTitle>Daily Profit & Loss</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center w-full h-full lg:min-h-52 min-h-[400px]">
        {
          !data || data.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p>No data available to display.</p>
            </div>
          ) :
            (
              <ChartContainer config={chartConfig} className="w-full h-full not-last:lg:-ml-6 -ml-8 p-0">
                <LineChart
                  accessibilityLayer
                  data={data}
                  margin={{
                    left: 12,
                    right: 12,
                    top: 12,
                    bottom: 12,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="day"
                    tickLine={true}
                    axisLine={true}
                    tickMargin={8}
                    tickFormatter={(value) => {
                      // This formatter makes dates like '2024-08-07' more readable as 'Aug 7'
                      const date = new Date(value)
                      return date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value.toLocaleString()}`} // Format Y-axis values as currency
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />
                  <Line
                    dataKey="cumulativePnl" // 5. Use the 'cumulativePnl' key for the line's values
                    type="natural"
                    stroke="#0394fc" // 6. This dynamically uses the color from chartConfig
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            )}

      </CardContent>
    </Card>
  )
}