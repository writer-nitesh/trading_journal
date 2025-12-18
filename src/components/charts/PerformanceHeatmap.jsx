"use client";
import React, { useMemo, useRef, useEffect, useState } from "react";
import _ from "lodash";
import { Card } from "../ui/card";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

function getTimeBucket(timestamp) {
  const hour = new Date(timestamp).getUTCHours();
  if (hour >= 3 && hour < 6) return "Early Morning";
  if (hour >= 6 && hour < 9) return "Morning";
  if (hour >= 9 && hour < 12) return "Afternoon";
  if (hour >= 12 && hour < 16) return "Late Afternoon";
  return "Others";
}

function getInstrumentCategory(symbol) {
  const upperSymbol = String(symbol).toUpperCase();
  if (upperSymbol.includes("BANKNIFTY")) return "BANKNIFTY";
  if (upperSymbol.includes("SENSEX")) return "SENSEX";
  if (upperSymbol.includes("NIFTY")) return "NIFTY";
  return upperSymbol;
}

export const PerformanceHeatmap = ({ data = [] }) => {
  const { theme } = useTheme();
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  // Handle responsive dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        setDimensions({
          width: Math.max(containerWidth - 32, 300), // Account for padding and minimum width
          height: Math.max(300, Math.min(500, containerWidth * 0.5)), // Responsive height
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // unique symbols & time buckets
  const symbols = [
    ...new Set(data.map((t) => getInstrumentCategory(t.symbol))),
  ].sort();
  const timeBuckets = [
    ...new Set(data.map((t) => getTimeBucket(t.entry_timestamp))),
  ];

  const timeOrder = [
    "Early Morning",
    "Morning",
    "Afternoon",
    "Late Afternoon",
    "Others",
  ];
  const sortedTimeBuckets = timeBuckets.sort(
    (a, b) => timeOrder.indexOf(a) - timeOrder.indexOf(b)
  );

  // Group & sum P&L
  const groupedData = _.groupBy(
    data,
    (trade) =>
      `${getTimeBucket(trade.entry_timestamp)}_${getInstrumentCategory(
        trade.symbol
      )}`
  );

  const zMatrix = sortedTimeBuckets.map((timeBucket) =>
    symbols.map((category) => {
      // Filter trades by time bucket and instrument category
      const relevantTrades = data.filter(
        (trade) =>
          getTimeBucket(trade.entry_timestamp) === timeBucket &&
          getInstrumentCategory(trade.symbol) === category
      );

      // Sum P&L for all trades in this time bucket + instrument category combination
      const totalPnl = _.sumBy(relevantTrades, "pnl");
      return relevantTrades.length > 0 ? parseFloat(totalPnl.toFixed(2)) : 0;
    })
  );

  const layout = useMemo(() => {
    const isDark = theme === "dark";
    return {
      xaxis: {
        title: {
          font: {
            size: Math.max(10, Math.min(14, dimensions.width / 60)),
          },
        },
        side: "bottom",
        color: isDark ? "white" : "#374151",
        tickfont: {
          size: Math.max(9, Math.min(12, dimensions.width / 80)),
        },
      },
      yaxis: {
        title: {
          font: {
            size: Math.max(10, Math.min(14, dimensions.width / 60)),
          },
        },
        autorange: "reversed",
        color: isDark ? "white" : "#374151",
        tickfont: {
          size: Math.max(9, Math.min(12, dimensions.width / 80)),
        },
      },
      width: dimensions.width,
      height: dimensions.height,
      margin: {
        t: 20,
        b: Math.max(50, dimensions.width / 16),
        l: Math.max(80, dimensions.width / 10),
        r: 60,
      },
      showlegend: false,
      paper_bgcolor: isDark ? "#171717" : "white",
      plot_bgcolor: isDark ? "#171717" : "white",
      font: {
        color: isDark ? "white" : "#374151",
      },
    };
  }, [theme, dimensions]);

  return (
    <div
      ref={containerRef}
      className="w-full p-4 rounded-lg border dark:border-neutral-600 shadow-sm overflow-hidden"
    >
      <h2 className="text-md font-medium mb-4">Performance Heatmap</h2>
      <div className="w-full overflow-hidden">
        {!data || data.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">No data available</p>
          </div>
        ) : (
          <div className="w-full" style={{ minHeight: dimensions.height }}>
            <Plot
              data={[
                {
                  z: zMatrix,
                  x: symbols,
                  y: sortedTimeBuckets,
                  type: "heatmap",
                  hoverongaps: false,
                  colorscale: [
                    [0, "rgb(255, 128, 0)"],
                    [0.5, "rgb(255, 255, 200)"],
                    [1, "rgb(65, 130, 81)"],
                  ],
                  zmid: 0,
                  text: zMatrix.map((row) => row.map((v) => v.toFixed(2))),
                  texttemplate: "%{text}",
                  textfont: {
                    size: Math.max(8, Math.min(12, dimensions.width / 100)),
                  },
                  hovertemplate:
                    "<b>%{y}</b><br>" +
                    "<b>%{x}</b><br>" +
                    "P&L: %{z}<br>" +
                    "<extra></extra>",
                  showscale: true,
                  colorbar: {
                    title: {
                      side: "right",
                      font: {
                        size: Math.max(10, Math.min(12, dimensions.width / 80)),
                      },
                    },
                    thickness: Math.max(
                      10,
                      Math.min(20, dimensions.width / 40)
                    ),
                    len: 0.7,
                    tickfont: {
                      size: Math.max(8, Math.min(10, dimensions.width / 100)),
                    },
                  },
                },
              ]}
              layout={layout}
              config={{
                responsive: false, 
                scrollZoom: false,
                displayModeBar: false,
                displaylogo: false,
                staticPlot: false,
              }}
              style={{ width: "100%", height: "100%" }}
              useResizeHandler={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};
