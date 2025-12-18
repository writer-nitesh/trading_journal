"use client";

import { useEffect, useState } from "react";
import { Route, Upload } from "lucide-react";
import Link from "next/link";

export default function TradingInsightsPanel({ tradingData }) {
  const [insights, setInsights] = useState([null]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [useAI, setUseAI] = useState(true);
  const [aiError, setAiError] = useState(null);

  // Transform processed trading data back to the format expected by trading-insights
  const transformDataForInsights = (processedData) => {
    if (!processedData || processedData.length === 0) return [];

    return processedData.map((trade) => {
      // Ensure we have valid data before transforming
      const transformedTrade = {
        Date:
          trade.entry_date ||
          trade.exit_date ||
          trade.date ||
          new Date().toISOString().slice(0, 10),
        Symbol: trade.symbol || "",
        "P&L": typeof trade.pnl === "number" ? trade.pnl : 0,
        Duration: "",
        Quantity: trade.quantity || 0,
        "Entry Price": trade.entry_price || 0,
        "Exit Price": trade.exit_price || 0,
        Side: trade.side || "Unknown",
        Strategy: trade.strategy || "",
        Emotion: trade.feelings || trade.emotion || "",
        "Return %": trade.return_pct || 0,
      };

      // Handle entry and exit times
      if (trade.entry_timestamp) {
        try {
          const entryTime = new Date(trade.entry_timestamp);

          transformedTrade["Entry Time"] = entryTime.toLocaleTimeString(
            "en-US",
            {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }
          );
        } catch (e) {
          transformedTrade["Entry Time"] = "";
        }
      }

      if (trade.exit_timestamp) {
        try {
          const exitTime = new Date(trade.exit_timestamp);
          transformedTrade["Exit Time"] = exitTime.toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });
        } catch (e) {
          transformedTrade["Exit Time"] = "";
        }
      }

      // Handle duration (convert from minutes to duration string)
      if (trade.duration && typeof trade.duration === "number") {
        const durationMinutes = Math.floor(trade.duration);
        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;

        if (hours > 0) {
          transformedTrade.Duration = `${hours}h ${minutes}m`;
        } else {
          transformedTrade.Duration = `${minutes}m`;
        }
      } else if (trade.entry_timestamp && trade.exit_timestamp) {
        try {
          const durationMs =
            new Date(trade.exit_timestamp) - new Date(trade.entry_timestamp);
          const durationMinutes = Math.floor(durationMs / 60000);
          const hours = Math.floor(durationMinutes / 60);
          const minutes = durationMinutes % 60;

          if (hours > 0) {
            transformedTrade.Duration = `${hours}h ${minutes}m`;
          } else {
            transformedTrade.Duration = `${minutes}m`;
          }
        } catch (e) {
          transformedTrade.Duration = "";
        }
      }

      return transformedTrade;
    });
  };

  useEffect(() => {
    if (!tradingData || tradingData.length < 3) {
      setInsights(null);
      return;
    }

    setLoading(true);
    setError(null);
    setAiError(null);

    // Transform the data before sending
    const transformedData = transformDataForInsights(tradingData);

    // Determine which endpoint to use
    // const endpoint = useAI && tradingData.length >= 5 ? "/api/ai-insights" : "/api/trading-insights";
    const endpoint = "/api/trading-insights";
    console.log(
      `Using ${
        useAI && tradingData.length >= 5 ? "AI" : "traditional"
      } insights for ${transformedData.length} trades`
    );

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: transformedData, useAI: useAI }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setInsights(data);
        } else {
          // If AI insights failed, try traditional insights as fallback
          if (useAI && data.fallbackAvailable) {
            console.log(
              "AI insights failed, falling back to traditional insights"
            );
            setAiError(data.error);
            return fetch("/api/trading-insights", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ data: transformedData }),
            })
              .then((res) => res.json())
              .then((fallbackData) => {
                if (fallbackData.success) {
                  setInsights({
                    ...fallbackData,
                    type: "traditional",
                    aiFallback: true,
                  });
                } else {
                  setError(
                    `Both AI and traditional insights failed: ${data.error}`
                  );
                }
              });
          } else {
            setError(data.error || "Failed to fetch insights");
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Insights fetch error:", err);
        setError("Failed to fetch insights");
        setLoading(false);
      });
  }, [tradingData, useAI]);

  return (
    <aside className="w-full lg:w-10/10 h-full border-l border-neutral-200 dark:border-neutral-700 flex flex-col">
      <div className="p-5 lg:p-6 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center dark:text-neutral-200">
            {insights?.type === "ai_insights" ? "🤖" : "💡"}
            <span className="ml-2">
              {insights?.type === "ai_insights"
                ? "AI Insights"
                : "Trading Insights"}
            </span>
          </h3>

          {/* AI Toggle Switch */}
          {/* {tradingData && tradingData.length >= 5 && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-neutral-600 dark:text-neutral-400">
                Traditional
              </span>
              <button
                onClick={() => setUseAI(!useAI)}
                className={`relative inline-flex items-center h-5 w-9 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  useAI 
                    ? 'bg-blue-600 dark:bg-blue-500' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block w-3 h-3 rounded-full bg-white transition-transform duration-200 ${
                    useAI ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-xs text-neutral-600 dark:text-neutral-400">
                AI
              </span>
            </div>
          )} */}
        </div>

        {/* AI Error Warning */}
        {aiError && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start">
              <div className="text-yellow-600 dark:text-yellow-400 mr-2">
                ⚠️
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  AI Analysis Unavailable
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  {aiError}. Showing traditional insights instead.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* AI Metadata */}
        {insights?.type === "ai_insights" && insights?.aiMetadata && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-center text-xs text-blue-700 dark:text-blue-300">
              <span>
                Confidence Score: {insights.aiMetadata.confidenceScore}/100
              </span>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-neutral-600 dark:text-neutral-400">
              {useAI ? "Generating AI insights..." : "Analyzing data..."}
            </span>
          </div>
        )}

        {error && (
          <div className="text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-start">
              <div className="text-red-500 mr-2">❌</div>
              <div>
                <p className="font-medium">Analysis Failed</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {insights && insights.success && (
          <div className="space-y-4">
            {/* AI Consolidated Insights */}
            {insights.type === "ai_insights" &&
              insights.consolidatedInsights && (
                <div className="space-y-3">
                  {/* Key Findings - REMOVED TO AVOID DUPLICATION */}
                  {false &&
                    insights.consolidatedInsights.keyFindings &&
                    insights.consolidatedInsights.keyFindings.length > 0 && (
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-3 text-sm flex items-center">
                          � Key AI Insights
                        </h4>
                        <div className="space-y-2">
                          {insights.consolidatedInsights.keyFindings
                            .slice(0, 3)
                            .map((finding, index) => (
                              <div
                                key={index}
                                className="text-sm text-purple-700 dark:text-purple-300 leading-relaxed"
                              >
                                <span className="font-medium text-xs text-purple-600 dark:text-purple-400">
                                  [{finding.source}]
                                </span>{" "}
                                {finding.insight}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                  {/* Priority Recommendations */}
                  {insights.consolidatedInsights.priorityRecommendations &&
                    insights.consolidatedInsights.priorityRecommendations
                      .length > 0 && (
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3 text-sm flex items-center">
                          🚀 AI Recommendations for Your Trading
                        </h4>
                        <div className="space-y-2">
                          {insights.consolidatedInsights.priorityRecommendations
                            .slice(0, 3)
                            .map((rec, index) => (
                              <div
                                key={index}
                                className="text-sm text-green-700 dark:text-green-300 leading-relaxed"
                              >
                                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                {rec.recommendation}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                  {/* Risk Warnings */}
                  {insights.consolidatedInsights.criticalRiskWarnings &&
                    insights.consolidatedInsights.criticalRiskWarnings.length >
                      0 && (
                      <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                        <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-3 text-sm flex items-center">
                          ⚠️ Areas to Improve
                        </h4>
                        <div className="space-y-2">
                          {insights.consolidatedInsights.criticalRiskWarnings
                            .slice(0, 2)
                            .map((warning, index) => (
                              <div
                                key={index}
                                className="text-sm text-orange-700 dark:text-orange-300 leading-relaxed"
                              >
                                <span className="inline-block w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                                {warning.warning}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                </div>
              )}

            {/* Show AI summaries if available */}
            {insights.summaries && (
              <div className="space-y-3">
                {insights.summaries.dayOfWeekAnalysis && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 text-sm flex items-center">
                      📅 Your Best Trading Days
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                      {insights.summaries.dayOfWeekAnalysis}
                    </p>
                  </div>
                )}
                {insights.summaries.lotSizeAnalysis && (
                  <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2 text-sm flex items-center">
                      💰 Your Optimal Position Sizes
                    </h4>
                    <p className="text-sm text-orange-700 dark:text-orange-300 leading-relaxed">
                      {insights.summaries.lotSizeAnalysis}
                    </p>
                  </div>
                )}
                {insights.summaries.tradeCountAnalysis && (
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2 text-sm flex items-center">
                      📊 Your Daily Trade Volume
                    </h4>
                    <p className="text-sm text-purple-700 dark:text-purple-300 leading-relaxed">
                      {insights.summaries.tradeCountAnalysis}
                    </p>
                  </div>
                )}
                {insights.summaries.durationAnalysis && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2 text-sm flex items-center">
                      ⏱️ Your Optimal Hold Duration
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300 leading-relaxed">
                      {insights.summaries.durationAnalysis}
                    </p>
                  </div>
                )}
                {insights.summaries.tradeSequenceAnalysis && (
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                    <h4 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-2 text-sm flex items-center">
                      🎯 Trade Sequence Performance
                    </h4>
                    <p className="text-sm text-indigo-700 dark:text-indigo-300 leading-relaxed">
                      {insights.summaries.tradeSequenceAnalysis}
                    </p>
                  </div>
                )}
                {insights.summaries.timeInstrumentAnalysis && (
                  <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800">
                    <h4 className="font-semibold text-teal-800 dark:text-teal-200 mb-2 text-sm flex items-center">
                      🕐 Your Optimal Trading Times
                    </h4>
                    <p className="text-sm text-teal-700 dark:text-teal-300 leading-relaxed">
                      {insights.summaries.timeInstrumentAnalysis}
                    </p>
                  </div>
                )}
                {insights.summaries.directionAnalysis && (
                  <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
                    <h4 className="font-semibold text-pink-800 dark:text-pink-200 mb-2 text-sm flex items-center">
                      📈 Your Direction Performance
                    </h4>
                    <p className="text-sm text-pink-700 dark:text-pink-300 leading-relaxed">
                      {insights.summaries.directionAnalysis}
                    </p>
                  </div>
                )}
                {insights.summaries.directionSymbolAnalysis && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-200 dark:border-rose-800">
                    <h4 className="font-semibold text-rose-800 dark:text-rose-200 mb-2 text-sm flex items-center">
                      📈 Direction-Symbol Analysis
                    </h4>
                    <p className="text-sm text-rose-700 dark:text-rose-300 leading-relaxed">
                      {insights.summaries.directionSymbolAnalysis}
                    </p>
                  </div>
                )}
                {insights.summaries.directionCEPEAnalysis && (
                  <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
                    <h4 className="font-semibold text-cyan-800 dark:text-cyan-200 mb-2 text-sm flex items-center">
                      📊 Direction-Options Analysis
                    </h4>
                    <p className="text-sm text-cyan-700 dark:text-cyan-300 leading-relaxed">
                      {insights.summaries.directionCEPEAnalysis}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Fallback to original detailed view if no summaries */}
            {!insights.summaries && insights.results?.insights && (
              <>
                {insights.results?.insights?.dayOfWeekAnalysis && (
                  <div>
                    <h4 className="font-semibold mb-2">Day of Week Analysis</h4>
                    <ul className="list-disc ml-5 text-sm">
                      {insights.results.insights.dayOfWeekAnalysis.data.insights
                        .slice(0, 2)
                        .map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                    </ul>
                  </div>
                )}
                {insights.results?.insights?.durationAnalysis && (
                  <div>
                    <h4 className="font-semibold mb-2">Duration Analysis</h4>
                    <ul className="list-disc ml-5 text-sm">
                      {insights.results.insights.durationAnalysis.data.insights
                        .slice(0, 2)
                        .map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                    </ul>
                  </div>
                )}
                {insights.results?.insights?.lotSizeAnalysis && (
                  <div>
                    <h4 className="font-semibold mb-2">
                      Position Size Analysis
                    </h4>
                    <ul className="list-disc ml-5 text-sm">
                      {insights.results.insights.lotSizeAnalysis.data.insights
                        .slice(0, 2)
                        .map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                    </ul>
                  </div>
                )}
                {insights.results?.insights?.tradeCountAnalysis && (
                  <div>
                    <h4 className="font-semibold mb-2">Trade Count Analysis</h4>
                    <ul className="list-disc ml-5 text-sm">
                      {insights.results.insights.tradeCountAnalysis.data.insights
                        .slice(0, 2)
                        .map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                    </ul>
                  </div>
                )}
                {insights.results?.insights?.tradeSequenceAnalysis && (
                  <div>
                    <h4 className="font-semibold mb-2">
                      Trade Sequence Analysis
                    </h4>
                    <ul className="list-disc ml-5 text-sm">
                      {insights.results.insights.tradeSequenceAnalysis.data.insights
                        .slice(0, 2)
                        .map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                    </ul>
                  </div>
                )}
                {insights.results?.insights?.timeInstrumentAnalysis && (
                  <div>
                    <h4 className="font-semibold mb-2">
                      Time-Instrument Analysis
                    </h4>
                    <ul className="list-disc ml-5 text-sm">
                      {insights.results.insights.timeInstrumentAnalysis.data.insights
                        .slice(0, 2)
                        .map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                    </ul>
                  </div>
                )}
                {insights.results?.insights?.tradeSequenceAnalysis && (
                  <div>
                    <h4 className="font-semibold mb-2">
                      Trade Sequence Analysis
                    </h4>
                    <ul className="list-disc ml-5 text-sm">
                      {insights.results.insights.tradeSequenceAnalysis.data.aiInsights.insights
                        .slice(0, 2)
                        .map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                    </ul>
                  </div>
                )}
                {insights.results?.insights?.directionAnalysis && (
                  <div>
                    <h4 className="font-semibold mb-2">Direction Analysis</h4>
                    <ul className="list-disc ml-5 text-sm">
                      {insights.results.insights.directionAnalysis.data.aiInsights.insights
                        .slice(0, 2)
                        .map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                    </ul>
                  </div>
                )}
                {insights.results?.insights?.directionSymbolAnalysis && (
                  <div>
                    <h4 className="font-semibold mb-2">
                      Direction-Symbol Analysis
                    </h4>
                    <ul className="list-disc ml-5 text-sm">
                      {insights.results.insights.directionSymbolAnalysis.data.insights
                        .slice(0, 2)
                        .map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                    </ul>
                  </div>
                )}
                {insights.results?.insights?.directionCEPEAnalysis && (
                  <div>
                    <h4 className="font-semibold mb-2">
                      Direction-Options Analysis
                    </h4>
                    <ul className="list-disc ml-5 text-sm">
                      {insights.results.insights.directionCEPEAnalysis.data.insights
                        .slice(0, 2)
                        .map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {insights.results &&
              insights.results.errors &&
              insights.results.errors.length > 0 && (
                <div className="text-red-500 mt-2 text-sm">
                  {insights.results.errors.slice(0, 1).map((err, i) => (
                    <div key={i}>{err}</div>
                  ))}
                </div>
              )}

            {/* Footer with data requirements info */}
            {tradingData && tradingData.length < 5 && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  💡 Add {5 - tradingData.length} more trades to unlock
                  AI-powered insights with personalized recommendations.
                </p>
              </div>
            )}
          </div>
        )}

        {insights && !insights.success && (
          <div className="text-red-500">
            Analysis failed: {insights.error || "Unknown error"}
          </div>
        )}

        {!loading &&
          !error &&
          (!insights || (insights && !insights.success)) && (
            <div className="flex flex-col items-center justify-center h-full space-y-6">
              <div className="text-center  max-w-4xl">
                <p className="text-sm  text-slate-500 dark:text-neutral-400 px-4">
                  Choose how you'd like to connect your trading data for
                  powerful analytics
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <Link
                  href="/dashboard/addtrades"
                  className="bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center gap-4 rounded-lg p-3 w w-fit mx-auto"
                >
                  <Route
                    className="h-6 w-6 text-orange-600 dark:text-orange-400"
                    strokeWidth={2.5}
                  />
                  <span> Broker API</span>
                </Link>

                <Link
                  href="/dashboard/addtrades"
                  className="bg-blue-100 dark:bg-blue-900/30  flex items-center justify-center gap-4 rounded-lg p-3 w w-fit mx-auto"
                >
                  <Upload
                    className="h-6 w-6 text-blue-600 dark:text-blue-400"
                    strokeWidth={2.5}
                  />
                  <span> Broker API</span>
                </Link>
              </div>
            </div>
          )}
      </div>
    </aside>
  );
}
