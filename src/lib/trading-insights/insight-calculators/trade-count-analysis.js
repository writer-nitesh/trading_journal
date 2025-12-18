/**
 * Trade Count per Day × P&L Analysis - JavaScript Implementation
 * Equivalent to Python daily trade count frequency analysis from insights10.ipynb
 * 
 * This module analyzes trading performance by daily trade count frequency to identify
 * optimal daily trading volumes, overtrading patterns, and frequency-based performance metrics.
 */

// Import utility modules
const DataProcessor = require('../utils/data-processor.js');
const Calculations = require('../utils/calculations.js');

/**
 * Trade count frequency buckets
 */
const TRADE_COUNT_CATEGORIES = [
  { min: 1, max: 2, label: 'Low (1-2 trades/day)' },
  { min: 3, max: 5, label: 'Moderate (3-5 trades/day)' },
  { min: 6, max: 10, label: 'High (6-10 trades/day)' },
  { min: 11, max: Infinity, label: 'Very High (>10 trades/day)' }
];

/**
 * Main function to analyze Trade Count per Day × P&L
 * @param {Object[]} processedTradingData - Array of processed trading records
 * @param {Object} options - Configuration options
 * @returns {Object} - Analysis results with insights
 */
function analyzeTradeCountPnL(processedTradingData, options = {}) {
  try {
    // Validate input
    if (!Array.isArray(processedTradingData) || processedTradingData.length === 0) {
      throw new Error('Invalid trading data: Expected non-empty array');
    }

    // Configuration
    const config = {
      minDaysForInsight: options.minDaysForInsight || 2,
      customCategories: options.customCategories || TRADE_COUNT_CATEGORIES,
      includeOutliers: options.includeOutliers || false,
      ...options
    };

    // Group trades by date to calculate daily statistics
    const dailyStats = new Map();
    const validTrades = [];

    // Process each trade and group by date
    processedTradingData.forEach((trade, index) => {
      try {
        const pnl = trade.pnl;
        const date = trade.date;

        if (!date || typeof pnl !== 'number') {
          return; // Skip invalid records
        }

        // Use date string as key (YYYY-MM-DD format)
        const dateKey = date.toISOString().split('T')[0];
        
        if (!dailyStats.has(dateKey)) {
          dailyStats.set(dateKey, {
            date: date,
            dateKey: dateKey,
            trades: [],
            totalPnL: 0,
            tradeCount: 0,
            profitTrades: 0,
            lossTrades: 0,
            pnlValues: []
          });
        }

        const dayData = dailyStats.get(dateKey);
        dayData.trades.push(trade);
        dayData.totalPnL += pnl;
        dayData.tradeCount++;
        dayData.pnlValues.push(pnl);
        
        if (pnl > 0) {
          dayData.profitTrades++;
        } else {
          dayData.lossTrades++;
        }

        validTrades.push(trade);
        
      } catch (error) {
        console.warn(`Error processing trade at index ${index}:`, error);
      }
    });

    if (validTrades.length === 0 || dailyStats.size === 0) {
      throw new Error('No valid trades or trading days found after processing');
    }

    // Calculate additional daily metrics
    const dailyStatsArray = Array.from(dailyStats.values()).map(dayData => {
      const winRate = dayData.tradeCount > 0 ? (dayData.profitTrades / dayData.tradeCount) * 100 : 0;
      const avgPnLPerTrade = dayData.tradeCount > 0 ? dayData.totalPnL / dayData.tradeCount : 0;
      const pnlStdDev = Calculations.calculateBasicStats(dayData.pnlValues).stdDev;
      
      return {
        ...dayData,
        winRate: winRate,
        avgPnLPerTrade: avgPnLPerTrade,
        pnlStdDev: pnlStdDev
      };
    });

    // Group daily stats by trade count
    const tradeCountStats = new Map();

    dailyStatsArray.forEach(dayData => {
      const tradeCount = dayData.tradeCount;
      
      if (!tradeCountStats.has(tradeCount)) {
        tradeCountStats.set(tradeCount, {
          tradeCount: tradeCount,
          days: [],
          frequencyDays: 0,
          totalPnL: 0,
          totalTrades: 0,
          sumDailyPnL: 0,
          sumWinRates: 0,
          sumPnLPerTrade: 0,
          sumVolatility: 0,
          dailyPnLValues: []
        });
      }

      const countData = tradeCountStats.get(tradeCount);
      countData.days.push(dayData);
      countData.frequencyDays++;
      countData.totalPnL += dayData.totalPnL;
      countData.totalTrades += dayData.tradeCount;
      countData.sumDailyPnL += dayData.totalPnL;
      countData.sumWinRates += dayData.winRate;
      countData.sumPnLPerTrade += dayData.avgPnLPerTrade;
      countData.sumVolatility += dayData.pnlStdDev;
      countData.dailyPnLValues.push(dayData.totalPnL);
    });

    // Create trade count analysis table
    const tradeCountTable = [];
    tradeCountStats.forEach((data, tradeCount) => {
      const avgDailyPnL = data.sumDailyPnL / data.frequencyDays;
      const avgWinRate = data.sumWinRates / data.frequencyDays;
      const avgPnLPerTrade = data.sumPnLPerTrade / data.frequencyDays;
      const avgVolatility = data.sumVolatility / data.frequencyDays;
      const dailyPnLStdDev = Calculations.calculateBasicStats(data.dailyPnLValues).stdDev;
      const category = findTradeCountCategory(tradeCount, config.customCategories);
      
      tradeCountTable.push({
        tradeCount: tradeCount,
        category: category ? category.label : `${tradeCount} trades/day`,
        frequencyDays: data.frequencyDays,
        totalPnL: data.totalPnL,
        avgDailyPnL: avgDailyPnL,
        avgPnLPerTrade: avgPnLPerTrade,
        avgWinRate: avgWinRate,
        avgVolatility: avgVolatility,
        dailyPnLStdDev: dailyPnLStdDev,
        volumeWeightedPnL: (data.totalPnL * data.frequencyDays) / dailyStatsArray.length,
        days: data.days
      });
    });

    // Sort by trade count ascending
    tradeCountTable.sort((a, b) => a.tradeCount - b.tradeCount);

    // Generate insights and recommendations
    const insights = generateTradeCountInsights(tradeCountTable, dailyStatsArray, config);
    const recommendations = generateTradeCountRecommendations(tradeCountTable, dailyStatsArray, config);

    // Calculate summary statistics
    const totalTradingDays = dailyStatsArray.length;
    const totalTrades = validTrades.length;
    const totalPnL = validTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const overallWinRate = (validTrades.filter(trade => trade.pnl > 0).length / validTrades.length) * 100;
    const avgTradesPerDay = totalTrades / totalTradingDays;

    const bestPerformingCount = tradeCountTable.reduce((best, current) => 
      current.totalPnL > best.totalPnL ? current : best);
    const worstPerformingCount = tradeCountTable.reduce((worst, current) => 
      current.totalPnL < worst.totalPnL ? current : worst);
    const mostFrequentCount = tradeCountTable.reduce((most, current) => 
      current.frequencyDays > most.frequencyDays ? current : most);

    const summary = {
      totalTrades: totalTrades,
      totalTradingDays: totalTradingDays,
      totalPnL: totalPnL,
      overallWinRate: overallWinRate,
      avgTradesPerDay: avgTradesPerDay,
      bestPerformingCount: bestPerformingCount.tradeCount,
      worstPerformingCount: worstPerformingCount.tradeCount,
      mostFrequentCount: mostFrequentCount.tradeCount,
      tradeCountRange: {
        min: Math.min(...tradeCountTable.map(t => t.tradeCount)),
        max: Math.max(...tradeCountTable.map(t => t.tradeCount))
      }
    };

    return {
      success: true,
      data: {
        tradeCountTable: tradeCountTable,
        dailyStats: dailyStatsArray,
        summary: summary,
        insights: insights,
        recommendations: recommendations
      },
      metadata: {
        totalTrades: validTrades.length,
        totalTradingDays: totalTradingDays,
        processedTrades: processedTradingData.length,
        skippedTrades: processedTradingData.length - validTrades.length,
        analysisDate: new Date(),
        executionTime: Date.now(),
        config: config,
        inputLength: Array.isArray(processedTradingData) ? processedTradingData.length : 0
      }
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      data: null,
      metadata: {
        totalTrades: 0,
        totalTradingDays: 0,
        analysisDate: new Date(),
        executionTime: Date.now(),
        inputLength: Array.isArray(processedTradingData) ? processedTradingData.length : 0
      }
    };
  }
}

/**
 * Find the appropriate trade count category for a given count
 * @param {number} tradeCount - Number of trades per day
 * @param {Object[]} categories - Array of category definitions
 * @returns {Object|null} - Matching category or null
 */
function findTradeCountCategory(tradeCount, categories) {
  return categories.find(category => tradeCount >= category.min && tradeCount <= category.max);
}

/**
 * Generate insights from trade count analysis
 * @param {Object[]} tradeCountTable - Trade count analysis data
 * @param {Object[]} dailyStats - Daily statistics
 * @param {Object} config - Configuration
 * @returns {string[]} - Array of insights
 */
function generateTradeCountInsights(tradeCountTable, dailyStats, config) {
  const insights = [];

  if (tradeCountTable.length === 0) {
    insights.push('No trade count data found');
    return insights;
  }

  const totalTradingDays = dailyStats.length;
  const totalTrades = tradeCountTable.reduce((sum, entry) => sum + (entry.tradeCount * entry.frequencyDays), 0);
  const totalPnL = tradeCountTable.reduce((sum, entry) => sum + entry.totalPnL, 0);

  // Overall statistics
  insights.push(`Total trading days: ${totalTradingDays}, Total trades: ${totalTrades}, Total P&L: ₹${totalPnL.toLocaleString()}`);
  insights.push(`Average trades per day: ${(totalTrades / totalTradingDays).toFixed(1)}`);

  // Best and worst performing trade counts
  const bestPerforming = tradeCountTable.reduce((best, current) => 
    current.totalPnL > best.totalPnL ? current : best);
  const worstPerforming = tradeCountTable.reduce((worst, current) => 
    current.totalPnL < worst.totalPnL ? current : worst);

  if (bestPerforming.totalPnL > 0) {
    insights.push(`Best performing frequency: ${bestPerforming.tradeCount} trades/day (₹${bestPerforming.totalPnL.toLocaleString()} total P&L, ${bestPerforming.frequencyDays} days)`);
  }

  if (worstPerforming.totalPnL < 0) {
    insights.push(`Worst performing frequency: ${worstPerforming.tradeCount} trades/day (₹${worstPerforming.totalPnL.toLocaleString()} total P&L, ${worstPerforming.frequencyDays} days)`);
  }

  // Most and least frequent trade counts
  const mostFrequent = tradeCountTable.reduce((most, current) => 
    current.frequencyDays > most.frequencyDays ? current : most);
  const leastFrequent = tradeCountTable.reduce((least, current) => 
    current.frequencyDays < least.frequencyDays ? current : least);

  insights.push(`Most common frequency: ${mostFrequent.tradeCount} trades/day (${mostFrequent.frequencyDays} days, ${(mostFrequent.frequencyDays/totalTradingDays*100).toFixed(1)}%)`);
  
  // Trading efficiency analysis
  const mostEfficient = tradeCountTable.reduce((best, current) => 
    current.avgPnLPerTrade > best.avgPnLPerTrade ? current : best);
  const leastEfficient = tradeCountTable.reduce((worst, current) => 
    current.avgPnLPerTrade < worst.avgPnLPerTrade ? current : worst);

  insights.push(`Most efficient frequency: ${mostEfficient.tradeCount} trades/day (₹${mostEfficient.avgPnLPerTrade.toFixed(0)} per trade)`);
  
  if (leastEfficient.avgPnLPerTrade < 0) {
    insights.push(`Least efficient frequency: ${leastEfficient.tradeCount} trades/day (₹${leastEfficient.avgPnLPerTrade.toFixed(0)} per trade)`);
  }

  // Win rate analysis
  const bestWinRate = tradeCountTable.reduce((best, current) => 
    current.avgWinRate > best.avgWinRate ? current : best);
  const worstWinRate = tradeCountTable.reduce((worst, current) => 
    current.avgWinRate < worst.avgWinRate ? current : worst);

  insights.push(`Best win rate frequency: ${bestWinRate.tradeCount} trades/day (${bestWinRate.avgWinRate.toFixed(1)}%)`);
  
  if (worstWinRate.avgWinRate < 50) {
    insights.push(`Poor win rate frequency: ${worstWinRate.tradeCount} trades/day (${worstWinRate.avgWinRate.toFixed(1)}%)`);
  }

  // Consistency analysis
  const mostConsistent = tradeCountTable.reduce((best, current) => 
    current.dailyPnLStdDev < best.dailyPnLStdDev ? current : best);
  const leastConsistent = tradeCountTable.reduce((worst, current) => 
    current.dailyPnLStdDev > worst.dailyPnLStdDev ? current : worst);

  insights.push(`Most consistent frequency: ${mostConsistent.tradeCount} trades/day (±₹${mostConsistent.dailyPnLStdDev.toFixed(0)} volatility)`);
  
  if (leastConsistent.dailyPnLStdDev > mostConsistent.dailyPnLStdDev * 2) {
    insights.push(`High volatility frequency: ${leastConsistent.tradeCount} trades/day (±₹${leastConsistent.dailyPnLStdDev.toFixed(0)} volatility)`);
  }

  // Volume-weighted performance
  const topVolumeWeighted = tradeCountTable.reduce((best, current) => 
    current.volumeWeightedPnL > best.volumeWeightedPnL ? current : best);
  
  insights.push(`Highest impact frequency: ${topVolumeWeighted.tradeCount} trades/day (volume-weighted P&L: ₹${topVolumeWeighted.volumeWeightedPnL.toFixed(0)})`);

  // Overtrading vs Undertrading analysis
  const profitableFrequencies = tradeCountTable.filter(entry => entry.totalPnL > 0);
  const losingFrequencies = tradeCountTable.filter(entry => entry.totalPnL < 0);

  if (profitableFrequencies.length > 0) {
    const profitableCounts = profitableFrequencies.map(f => f.tradeCount).sort((a, b) => a - b);
    insights.push(`Profitable frequencies: ${profitableCounts.join(', ')} trades/day`);
  }

  if (losingFrequencies.length > 0) {
    const losingCounts = losingFrequencies.map(f => f.tradeCount).sort((a, b) => a - b);
    insights.push(`Loss-making frequencies: ${losingCounts.join(', ')} trades/day`);
  }

  // Sweet spot analysis
  if (profitableFrequencies.length > 0) {
    const sweetSpot = profitableFrequencies.reduce((best, current) => 
      current.avgDailyPnL > best.avgDailyPnL ? current : best);
    
    insights.push(`Optimal frequency (sweet spot): ${sweetSpot.tradeCount} trades/day (₹${sweetSpot.avgDailyPnL.toFixed(0)} avg daily P&L, ${sweetSpot.avgWinRate.toFixed(1)}% win rate)`);
  }

  return insights;
}

/**
 * Generate recommendations from trade count analysis
 * @param {Object[]} tradeCountTable - Trade count analysis data
 * @param {Object[]} dailyStats - Daily statistics
 * @param {Object} config - Configuration
 * @returns {string[]} - Array of recommendations
 */
function generateTradeCountRecommendations(tradeCountTable, dailyStats, config) {
  const recommendations = [];

  if (tradeCountTable.length === 0) {
    recommendations.push('Collect more trading data across different daily volumes for better recommendations');
    return recommendations;
  }

  // Focus on profitable frequencies
  const profitableFrequencies = tradeCountTable
    .filter(entry => entry.totalPnL > 0 && entry.frequencyDays >= config.minDaysForInsight)
    .sort((a, b) => b.avgDailyPnL - a.avgDailyPnL)
    .slice(0, 3);
  
  if (profitableFrequencies.length > 0) {
    const freqList = profitableFrequencies.map(f => 
      `${f.tradeCount} trades/day (₹${f.avgDailyPnL.toFixed(0)} avg daily)`).join(', ');
    recommendations.push(`Focus on profitable frequencies: ${freqList}`);
  }

  // Avoid loss-making frequencies
  const losingFrequencies = tradeCountTable
    .filter(entry => entry.totalPnL < 0 && entry.frequencyDays >= config.minDaysForInsight)
    .sort((a, b) => a.avgDailyPnL - b.avgDailyPnL)
    .slice(0, 2);
  
  if (losingFrequencies.length > 0) {
    const freqList = losingFrequencies.map(f => 
      `${f.tradeCount} trades/day (₹${f.avgDailyPnL.toFixed(0)} avg daily)`).join(', ');
    recommendations.push(`Avoid or review strategy for: ${freqList}`);
  }

  // Sweet spot recommendation
  const sweetSpot = profitableFrequencies.length > 0 ? profitableFrequencies[0] : null;
  if (sweetSpot) {
    const currentFrequency = (dailyStats.reduce((sum, day) => sum + day.tradeCount, 0) / dailyStats.length).toFixed(1);
    
    if (sweetSpot.tradeCount !== parseFloat(currentFrequency)) {
      recommendations.push(`Target ${sweetSpot.tradeCount} trades per day - your optimal frequency (current avg: ${currentFrequency})`);
    }
  }

  // Overtrading warning
  const highVolumeFreqs = tradeCountTable.filter(entry => 
    entry.tradeCount >= 10 && entry.avgPnLPerTrade < 0);
  
  if (highVolumeFreqs.length > 0) {
    recommendations.push('High-volume trading (≥10 trades/day) showing poor per-trade results - possible overtrading');
  }

  // Undertrading opportunity
  const lowVolumeProfit = tradeCountTable.filter(entry => 
    entry.tradeCount <= 3 && entry.totalPnL > 0 && entry.avgPnLPerTrade > 0);
  
  if (lowVolumeProfit.length > 0 && profitableFrequencies.length > 0) {
    const bestLowVol = lowVolumeProfit.reduce((best, current) => 
      current.avgPnLPerTrade > best.avgPnLPerTrade ? current : best);
    
    if (bestLowVol.avgPnLPerTrade > 500) { // Significant per-trade profit
      recommendations.push(`Consider selective trading - ${bestLowVol.tradeCount} trades/day shows high per-trade efficiency (₹${bestLowVol.avgPnLPerTrade.toFixed(0)})`);
    }
  }

  // Consistency recommendations
  const consistentFreqs = tradeCountTable.filter(entry => 
    entry.totalPnL > 0 && entry.dailyPnLStdDev < 1000); // Low volatility threshold
  
  if (consistentFreqs.length > 0) {
    const mostConsistent = consistentFreqs.reduce((best, current) => 
      current.dailyPnLStdDev < best.dailyPnLStdDev ? current : best);
    
    recommendations.push(`${mostConsistent.tradeCount} trades/day offers good consistency (low volatility: ±₹${mostConsistent.dailyPnLStdDev.toFixed(0)})`);
  }

  // Win rate based recommendations
  const highWinRateFreqs = tradeCountTable.filter(entry => 
    entry.avgWinRate >= 60 && entry.frequencyDays >= config.minDaysForInsight);
  
  if (highWinRateFreqs.length > 0) {
    const freqList = highWinRateFreqs.map(f => 
      `${f.tradeCount} trades/day (${f.avgWinRate.toFixed(1)}%)`).join(', ');
    recommendations.push(`High win rate frequencies: ${freqList}`);
  }

  // Volume distribution recommendation
  const totalDays = dailyStats.length;
  const mostFrequent = tradeCountTable.reduce((most, current) => 
    current.frequencyDays > most.frequencyDays ? current : most);
  
  if (mostFrequent.frequencyDays / totalDays > 0.5 && mostFrequent.totalPnL > 0) {
    recommendations.push(`Your most frequent pattern (${mostFrequent.tradeCount} trades/day) is profitable - maintain this consistency`);
  } else if (mostFrequent.totalPnL < 0) {
    recommendations.push(`Your most frequent pattern (${mostFrequent.tradeCount} trades/day) is losing - consider changing default trading volume`);
  }

  return recommendations;
}

/**
 * Format results for display
 * @param {Object} analysisResult - Result from analyzeTradeCountPnL
 * @returns {string} - Formatted text output
 */
function formatTradeCountAnalysisResults(analysisResult) {
  if (!analysisResult.success) {
    return `Error: ${analysisResult.error}`;
  }

  const { data, metadata } = analysisResult;
  let output = [];

  output.push('TRADE COUNT PER DAY × P&L ANALYSIS');
  output.push('='.repeat(60));
  output.push('');

  // Summary
  output.push('SUMMARY:');
  output.push(`Total Trading Days: ${data.summary.totalTradingDays.toLocaleString()}`);
  output.push(`Total Trades: ${data.summary.totalTrades.toLocaleString()}`);
  output.push(`Total P&L: ${Calculations.formatCurrency(data.summary.totalPnL)}`);
  output.push(`Overall Win Rate: ${data.summary.overallWinRate.toFixed(1)}%`);
  output.push(`Average Trades per Day: ${data.summary.avgTradesPerDay.toFixed(1)}`);
  output.push(`Trade Count Range: ${data.summary.tradeCountRange.min}-${data.summary.tradeCountRange.max} trades/day`);
  output.push(`Best Performing Frequency: ${data.summary.bestPerformingCount} trades/day`);
  output.push(`Most Common Frequency: ${data.summary.mostFrequentCount} trades/day`);
  output.push('');

  // Trade count frequency table
  output.push('TRADE COUNT FREQUENCY ANALYSIS:');
  output.push('-'.repeat(120));
  output.push('Trades/Day | Days | Total P&L    | Avg Daily P&L | P&L/Trade | Win Rate | Volatility | Vol-Weighted P&L');
  output.push('-'.repeat(120));
  
  data.tradeCountTable.forEach(entry => {
    const trades = entry.tradeCount.toString().padStart(10);
    const days = entry.frequencyDays.toString().padStart(4);
    const totalPnL = Calculations.formatCurrency(entry.totalPnL).padStart(12);
    const avgDaily = Calculations.formatCurrency(entry.avgDailyPnL).padStart(13);
    const avgTrade = Calculations.formatCurrency(entry.avgPnLPerTrade).padStart(9);
    const winRate = `${entry.avgWinRate.toFixed(1)}%`.padStart(8);
    const volatility = Calculations.formatCurrency(entry.avgVolatility).padStart(10);
    const volWeighted = Calculations.formatCurrency(entry.volumeWeightedPnL).padStart(16);
    output.push(`${trades} | ${days} | ${totalPnL} | ${avgDaily} | ${avgTrade} | ${winRate} | ${volatility} | ${volWeighted}`);
  });
  output.push('-'.repeat(120));
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
  output.push(`Processed Trades: ${metadata.totalTrades}`);
  output.push(`Trading Days: ${metadata.totalTradingDays}`);
  output.push(`Skipped Trades: ${metadata.skippedTrades}`);
  output.push(`Analysis Date: ${metadata.analysisDate.toISOString()}`);

  return output.join('\n');
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  module.exports = {
    analyzeTradeCountPnL,
    formatTradeCountAnalysisResults,
    generateTradeCountInsights,
    generateTradeCountRecommendations,
    findTradeCountCategory,
    TRADE_COUNT_CATEGORIES
  };
} else {
  // Browser environment
  window.TradingInsights = window.TradingInsights || {};
  window.TradingInsights.TradeCountAnalysis = {
    analyzeTradeCountPnL,
    formatTradeCountAnalysisResults,
    generateTradeCountInsights,
    generateTradeCountRecommendations,
    findTradeCountCategory,
    TRADE_COUNT_CATEGORIES
  };
}
