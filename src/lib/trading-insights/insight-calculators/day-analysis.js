/**
 * Day of s - JavaScript Implementation
 * Equivalent to Python insight #1 from insights10.ipynb
 * 
 * This module analyzes trading performance by day of the week to identify
 * the best and worst trading days, volatility patterns, and consistency.
 */

// Import utility modules
const DataProcessor = require('../utils/data-processor.js');
const Calculations = require('../utils/calculations.js');
const { DAY_NAMES, TRADING_DAY_NAMES } = require('../types/trading-types.js');







/**
 * Calculate standard deviation for an array of numbers
 * @param {number[]} values - Array of numeric values
 * @returns {number} - Standard deviation
 */
function calculateStandardDeviation(values) {
  if (!values || values.length === 0) return 0;
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  
  return Math.sqrt(variance);
}

/**
 * Main function to analyze Day of Week vs P&L
 * @param {Object[]} processedTradingData - Array of processed trading records
 * @param {Object} options - Configuration options
 * @returns {Object} - Analysis results with insights
 */
function analyzeDayOfWeekPnL(processedTradingData, options = {}) {
  try {
    // Validate input
    if (!Array.isArray(processedTradingData) || processedTradingData.length === 0) {
      throw new Error('Invalid trading data: Expected non-empty array');
    }

    // Configuration
    const config = {
      dayOrder: TRADING_DAY_NAMES,
      includeWeekends: options.includeWeekends || false,
      ...options
    };

    // Process data: Group by day of week and sum P&L
    const dayPnLMap = new Map();
    const dayTradeCount = new Map();
    const validTrades = [];

    // Initialize day maps
    config.dayOrder.forEach(day => {
      dayPnLMap.set(day, 0);
      dayTradeCount.set(day, 0);
    });

    // Process each trade (data is already processed)
    processedTradingData.forEach((trade, index) => {
      try {
        // Use processed data fields
        const dayOfWeek = trade.dayOfWeek;
        const pnl = trade.pnl;

        if (!dayOfWeek || typeof pnl !== 'number') {
          return; // Skip invalid records
        }
        
        if (!dayOfWeek || typeof pnl !== 'number') {
          return; // Skip invalid records
        }
        
        // Skip weekends if not included
        if (!config.includeWeekends && !config.dayOrder.includes(dayOfWeek)) {
          return;
        }

        // Add to day maps
        dayPnLMap.set(dayOfWeek, (dayPnLMap.get(dayOfWeek) || 0) + pnl);
        dayTradeCount.set(dayOfWeek, (dayTradeCount.get(dayOfWeek) || 0) + 1);
        
        validTrades.push({
          date: trade.date,
          dayName: dayOfWeek,
          pnl,
          originalData: trade
        });
      } catch (error) {
        console.warn(`Error processing trade at index ${index}:`, error);
      }
    });

    if (validTrades.length === 0) {
      throw new Error('No valid trades found after processing');
    }

    // Convert to arrays for easier processing
    const dayPnLData = [];
    config.dayOrder.forEach(day => {
      const pnl = dayPnLMap.get(day) || 0;
      const trades = dayTradeCount.get(day) || 0;
      if (trades > 0) { // Only include days with trades
        dayPnLData.push({
          day,
          totalPnL: pnl,
          tradeCount: trades,
          avgPnL: trades > 0 ? pnl / trades : 0
        });
      }
    });

    // Calculate insights
    const insights = generateDayOfWeekInsights(dayPnLData);

    // Return structured results
    return {
      success: true,
      data: {
        dayPnLTable: dayPnLData,
        summary: {
          totalTrades: validTrades.length,
          totalPnL: dayPnLData.reduce((sum, day) => sum + day.totalPnL, 0),
          avgPnLPerTrade: validTrades.reduce((sum, trade) => sum + trade.pnl, 0) / validTrades.length,
          tradingDays: dayPnLData.length,
          dateRange: {
            from: new Date(Math.min(...validTrades.map(t => t.date.getTime()))),
            to: new Date(Math.max(...validTrades.map(t => t.date.getTime())))
          }
        },
        insights: insights.insights,
        recommendations: insights.recommendations
      },
      metadata: {
        processedTrades: validTrades.length,
        skippedTrades: processedTradingData.length - validTrades.length,
        analysisDate: new Date(),
        config
      }
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      data: null,
      metadata: {
        analysisDate: new Date(),
        inputLength: Array.isArray(processedTradingData) ? processedTradingData.length : 0
      }
    };
  }
}

/**
 * Generate dynamic insights from day-wise P&L data
 * @param {Object[]} dayPnLData - Day-wise P&L summary
 * @returns {Object} - Generated insights and recommendations
 */
function generateDayOfWeekInsights(dayPnLData) {
  const insights = [];
  const recommendations = [];

  if (!dayPnLData || dayPnLData.length === 0) {
    return { insights: ['No data available for analysis.'], recommendations: [] };
  }

  // Sort by P&L for best/worst analysis
  const sortedByPnL = [...dayPnLData].sort((a, b) => b.totalPnL - a.totalPnL);
  
  // Best and worst days
  const bestDay = sortedByPnL[0];
  const worstDay = sortedByPnL[sortedByPnL.length - 1];

  if (bestDay.totalPnL > 0) {
    insights.push(`Best day: ${bestDay.day} (Total P&L: ${Calculations.formatCurrency(bestDay.totalPnL)})`);
    recommendations.push(`Focus trading activities on ${bestDay.day} - historically your strongest day`);
  }

  if (worstDay.totalPnL < 0) {
    insights.push(`Worst day: ${worstDay.day} (Total P&L: ${Calculations.formatCurrency(worstDay.totalPnL)})`);
    recommendations.push(`Review ${worstDay.day} trading strategy - consider reducing position sizes or avoiding complex strategies`);
  }

  // Count profitable vs loss days
  const profitableDays = dayPnLData.filter(day => day.totalPnL > 0);
  const lossDays = dayPnLData.filter(day => day.totalPnL < 0);

  insights.push(`Number of profitable days: ${profitableDays.length}`);
  insights.push(`Number of loss days: ${lossDays.length}`);

  // Consistency analysis
  if (profitableDays.length === dayPnLData.length) {
    insights.push('All days are profitable!');
    recommendations.push('Maintain your current strategy - excellent consistency across all trading days');
  } else if (lossDays.length === dayPnLData.length) {
    insights.push('All days are loss-making. Consider reviewing your strategy.');
    recommendations.push('URGENT: Complete strategy overhaul needed - all days showing losses');
  } else {
    const profitRatio = (profitableDays.length / dayPnLData.length * 100).toFixed(1);
    insights.push(`Win rate by days: ${profitRatio}% (${profitableDays.length} out of ${dayPnLData.length} days profitable)`);
    
    if (profitRatio >= 80) {
      recommendations.push('Excellent day-wise consistency - maintain current approach');
    } else if (profitRatio >= 60) {
      recommendations.push('Good day-wise performance - focus on improving weaker days');
    } else {
      recommendations.push('Day-wise performance needs improvement - analyze losing day patterns');
    }
  }

  // Volatility analysis
  const pnlValues = dayPnLData.map(day => day.totalPnL);
  const volatility = calculateStandardDeviation(pnlValues);
  insights.push(`P&L volatility across days (std dev): ₹${volatility.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`);

  // Volatility-based recommendations
  const avgPnL = pnlValues.reduce((sum, val) => sum + val, 0) / pnlValues.length;
  const volatilityRatio = volatility / Math.abs(avgPnL);
  
  if (volatilityRatio > 2) {
    recommendations.push('High volatility detected - consider risk management strategies to reduce day-to-day swings');
  } else if (volatilityRatio < 0.5) {
    recommendations.push('Low volatility shows good consistency - consider gradually increasing position sizes');
  }

  // Swing analysis
  if (dayPnLData.length > 1) {
    const maxPnL = Math.max(...pnlValues);
    const minPnL = Math.min(...pnlValues);
    const swing = Math.abs(maxPnL - minPnL);
    insights.push(`Largest swing between best and worst day: ₹${swing.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`);
    
    if (swing > avgPnL * 5) {
      recommendations.push('Large day-to-day swings detected - implement daily stop-loss limits');
    }
  }

  // Trade frequency analysis
  const avgTradesPerDay = dayPnLData.reduce((sum, day) => sum + day.tradeCount, 0) / dayPnLData.length;
  const bestDayTrades = bestDay.tradeCount;
  const worstDayTrades = worstDay.tradeCount;

  insights.push(`Average trades per day: ${avgTradesPerDay.toFixed(1)}`);
  insights.push(`Best day (${bestDay.day}) had ${bestDayTrades} trades`);
  insights.push(`Worst day (${worstDay.day}) had ${worstDayTrades} trades`);

  // Trade frequency recommendations
  if (bestDayTrades > avgTradesPerDay * 1.5) {
    recommendations.push(`${bestDay.day} performs well with higher trade volume (${bestDayTrades} trades) - consider more active trading`);
  }
  
  if (worstDayTrades > avgTradesPerDay * 1.5) {
    recommendations.push(`${worstDay.day} underperforms despite high volume (${worstDayTrades} trades) - avoid overtrading`);
  }

  // Efficiency analysis (P&L per trade)
  const sortedByEfficiency = [...dayPnLData].sort((a, b) => b.avgPnL - a.avgPnL);
  const mostEfficientDay = sortedByEfficiency[0];
  const leastEfficientDay = sortedByEfficiency[sortedByEfficiency.length - 1];

  insights.push(`Most efficient day: ${mostEfficientDay.day} (₹${mostEfficientDay.avgPnL.toLocaleString('en-IN', { maximumFractionDigits: 0 })} per trade)`);
  recommendations.push(`Study ${mostEfficientDay.day} patterns - highest profit per trade efficiency`);

  if (leastEfficientDay.avgPnL < 0) {
    recommendations.push(`${leastEfficientDay.day} needs attention - negative average per trade (₹${leastEfficientDay.avgPnL.toLocaleString('en-IN', { maximumFractionDigits: 0 })})`);
  }

  return {
    insights,
    recommendations: [...new Set(recommendations)] // Remove duplicates
  };
}

/**
 * Format results for display
 * @param {Object} analysisResult - Result from analyzeDayOfWeekPnL
 * @returns {string} - Formatted text output
 */
function formatDayAnalysisResults(analysisResult) {
  if (!analysisResult.success) {
    return `Error: ${analysisResult.error}`;
  }

  const { data, metadata } = analysisResult;
  let output = [];

  output.push('DAY OF WEEK vs P&L ANALYSIS');
  output.push('=' .repeat(50));
  output.push('');

  // Summary
  output.push('SUMMARY:');
  output.push(`Total Trades: ${data.summary.totalTrades.toLocaleString()}`);
  output.push(`Total P&L: ₹${data.summary.totalPnL.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`);
  output.push(`Average P&L per Trade: ₹${data.summary.avgPnLPerTrade.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`);
  output.push(`Trading Days: ${data.summary.tradingDays}`);
  output.push(`Date Range: ${data.summary.dateRange.from.toDateString()} to ${data.summary.dateRange.to.toDateString()}`);
  output.push('');

  // Day-wise table
  output.push('DAY-WISE P&L TABLE:');
  output.push('-'.repeat(70));
  output.push('Day         | Trades | Total P&L    | Avg P&L/Trade');
  output.push('-'.repeat(70));
  
  data.dayPnLTable.forEach(day => {
    const dayName = day.day.padEnd(11);
    const trades = day.tradeCount.toString().padStart(6);
    const totalPnL = `₹${day.totalPnL.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`.padStart(12);
    const avgPnL = `₹${day.avgPnL.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`.padStart(13);
    output.push(`${dayName} | ${trades} | ${totalPnL} | ${avgPnL}`);
  });
  output.push('-'.repeat(70));
  output.push('');

  // Insights
  output.push('INSIGHTS:');
  data.insights.forEach(insight => {
    output.push(`• ${insight}`);
  });
  output.push('');

  // Recommendations
  if (data.recommendations.length > 0) {
    output.push('RECOMMENDATIONS:');
    data.recommendations.forEach(recommendation => {
      output.push(`→ ${recommendation}`);
    });
    output.push('');
  }

  // Metadata
  output.push('ANALYSIS METADATA:');
  output.push(`Processed Trades: ${metadata.processedTrades}`);
  output.push(`Skipped Trades: ${metadata.skippedTrades}`);
  output.push(`Analysis Date: ${metadata.analysisDate.toISOString()}`);

  return output.join('\n');
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  module.exports = {
    analyzeDayOfWeekPnL,
    formatDayAnalysisResults
  };
} else {
  // Browser environment
  window.TradingInsights = window.TradingInsights || {};
  window.TradingInsights.DayAnalysis = {
    analyzeDayOfWeekPnL,
    formatDayAnalysisResults
  };
}

/* 
USAGE EXAMPLE:

// Sample trading data (CSV/JSON format)
const tradingData = [
  { Date: '01/01/2024', 'P&L': '₹1,500', Symbol: 'BANKNIFTY24JAN50000CE' },
  { Date: '02/01/2024', 'P&L': '-₹800', Symbol: 'NIFTY24JAN18000PE' },
  // ... more trades
];

// Analyze day-wise performance
const result = analyzeDayOfWeekPnL(tradingData, {
  dateColumn: 'Date',
  pnlColumn: 'P&L'
});

if (result.success) {
  console.log(formatDayAnalysisResults(result));
  
  // Access specific data
  console.log('Best day:', result.data.dayPnLTable.reduce((best, day) => 
    day.totalPnL > best.totalPnL ? day : best
  ));
} else {
  console.error('Analysis failed:', result.error);
}
*/
