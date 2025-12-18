/**
 * Duration × Outcome P&L Analysis - JavaScript Implementation
 * Equivalent to Python holding duration analysis from insights10.ipynb
 * 
 * This module analyzes trading performance by holding duration to identify
 * optimal trade durations and patterns based on trade outcomes.
 */

// Import utility modules
const DataProcessor = require('../utils/data-processor.js');
const Calculations = require('../utils/calculations.js');
const { DURATION_CATEGORIES } = require('../types/trading-types.js');

/**
 * Main function to analyze Duration × Outcome P&L
 * @param {Object[]} processedTradingData - Array of processed trading records
 * @param {Object} options - Configuration options
 * @returns {Object} - Analysis results with insights
 */
function analyzeDurationOutcomePnL(processedTradingData, options = {}) {
  try {
    // Validate input
    if (!Array.isArray(processedTradingData) || processedTradingData.length === 0) {
      throw new Error('Invalid trading data: Expected non-empty array');
    }

    // Configuration
    const config = {
      includeOutliers: options.includeOutliers || false,
      minTradesForInsight: options.minTradesForInsight || 3,
      ...options
    };

    // Create duration-outcome analysis table
    const durationOutcomeMap = new Map();
    const validTrades = [];

    // Initialize map for all duration buckets
    DURATION_CATEGORIES.forEach(duration => {
      const key = duration;
      durationOutcomeMap.set(key, {
        duration: duration,
        trades: [],
        totalPnL: 0,
        tradeCount: 0,
        profitTrades: 0,
        lossTrades: 0,
        totalProfit: 0,
        totalLoss: 0,
        avgProfit: 0,
        avgLoss: 0
      });
    });

    // Process each trade
    processedTradingData.forEach((trade, index) => {
      try {
        const duration = trade.durationBucket || trade.durationCategory || trade.duration;
        const pnl = trade.pnl;

        if (!duration || typeof pnl !== 'number') {
          return; // Skip invalid records
        }

        // Map to standard duration if not already mapped
        const standardDuration = mapToStandardDuration(duration);
        
        if (durationOutcomeMap.has(standardDuration)) {
          const entry = durationOutcomeMap.get(standardDuration);
          entry.trades.push(trade);
          entry.totalPnL += pnl;
          entry.tradeCount++;
          
          if (pnl > 0) {
            entry.profitTrades++;
            entry.totalProfit += pnl;
          } else {
            entry.lossTrades++;
            entry.totalLoss += pnl;
          }
        }

        validTrades.push(trade);
        
      } catch (error) {
        console.warn(`Error processing trade at index ${index}:`, error);
      }
    });

    if (validTrades.length === 0) {
      throw new Error('No valid trades found after processing');
    }

    // Create duration analysis table
    const durationTable = [];
    durationOutcomeMap.forEach((data, key) => {
      if (data.tradeCount > 0) {
        const winRate = (data.profitTrades / data.tradeCount) * 100;
        const avgPnL = data.totalPnL / data.tradeCount;
        const avgProfit = data.profitTrades > 0 ? data.totalProfit / data.profitTrades : 0;
        const avgLoss = data.lossTrades > 0 ? data.totalLoss / data.lossTrades : 0;
        const profitFactor = Math.abs(avgLoss) > 0 ? avgProfit / Math.abs(avgLoss) : 0;
        
        durationTable.push({
          duration: data.duration,
          totalPnL: data.totalPnL,
          avgPnL: avgPnL,
          tradeCount: data.tradeCount,
          profitTrades: data.profitTrades,
          lossTrades: data.lossTrades,
          winRate: winRate,
          avgProfit: avgProfit,
          avgLoss: avgLoss,
          profitFactor: profitFactor,
          trades: data.trades
        });
      }
    });

    // Sort by total P&L descending
    durationTable.sort((a, b) => b.totalPnL - a.totalPnL);

    // Generate insights
    const insights = generateDurationInsights(durationTable, config);
    const recommendations = generateDurationRecommendations(durationTable, config);

    // Calculate summary statistics
    const summary = {
      totalTrades: validTrades.length,
      totalPnL: validTrades.reduce((sum, trade) => sum + trade.pnl, 0),
      overallWinRate: (validTrades.filter(trade => trade.pnl > 0).length / validTrades.length) * 100,
      durations: [...new Set(validTrades.map(trade => trade.durationBucket || trade.durationCategory || trade.duration))],
      bestDuration: durationTable.length > 0 ? durationTable[0].duration : 'N/A',
      worstDuration: durationTable.length > 0 ? durationTable[durationTable.length - 1].duration : 'N/A'
    };

    return {
      success: true,
      data: {
        durationTable: durationTable,
        summary: summary,
        insights: insights,
        recommendations: recommendations
      },
      metadata: {
        totalTrades: validTrades.length,
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
        analysisDate: new Date(),
        executionTime: Date.now(),
        inputLength: Array.isArray(processedTradingData) ? processedTradingData.length : 0
      }
    };
  }
}

/**
 * Map duration strings to standard buckets
 * @param {string|number} duration - Duration in various formats
 * @returns {string} - Standard duration bucket
 */
function mapToStandardDuration(duration) {
  if (typeof duration === 'number') {
    // Assume seconds
    if (duration < 60) return '<1m';
    if (duration < 300) return '1-5m';
    if (duration < 900) return '5-15m';
    if (duration < 1800) return '15-30m';
    if (duration < 3600) return '30-60m';
    if (duration < 7200) return '1-2h';
    return '>2h';
  }
  
  if (typeof duration === 'string') {
    const durationStr = duration.toLowerCase().trim();
    
    // Handle various string formats
    if (durationStr.includes('<1m') || durationStr.includes('under 1') || durationStr.includes('less than 1')) return '<1m';
    if (durationStr.includes('1-5m') || (durationStr.includes('1') && durationStr.includes('5') && durationStr.includes('m'))) return '1-5m';
    if (durationStr.includes('5-15m') || (durationStr.includes('5') && durationStr.includes('15') && durationStr.includes('m'))) return '5-15m';
    if (durationStr.includes('15-30m') || (durationStr.includes('15') && durationStr.includes('30') && durationStr.includes('m'))) return '15-30m';
    if (durationStr.includes('30-60m') || (durationStr.includes('30') && durationStr.includes('60') && durationStr.includes('m'))) return '30-60m';
    if (durationStr.includes('1-2h') || (durationStr.includes('1') && durationStr.includes('2') && durationStr.includes('h'))) return '1-2h';
    if (durationStr.includes('>2h') || durationStr.includes('over 2') || durationStr.includes('more than 2')) return '>2h';
    
    // Try to parse as duration string (e.g., "5m30s", "1h15m")
    const parsed = parseDurationString(durationStr);
    if (parsed !== null) {
      return mapToStandardDuration(parsed);
    }
  }
  
  // Return original if can't map
  return duration;
}

/**
 * Parse duration strings like "5m30s", "1h15m", etc.
 * @param {string} durationStr - Duration string to parse
 * @returns {number|null} - Duration in seconds, or null if couldn't parse
 */
function parseDurationString(durationStr) {
  try {
    let totalSeconds = 0;
    
    // Match hours
    const hoursMatch = durationStr.match(/(\d+)h/);
    if (hoursMatch) {
      totalSeconds += parseInt(hoursMatch[1]) * 3600;
    }
    
    // Match minutes
    const minutesMatch = durationStr.match(/(\d+)m/);
    if (minutesMatch) {
      totalSeconds += parseInt(minutesMatch[1]) * 60;
    }
    
    // Match seconds
    const secondsMatch = durationStr.match(/(\d+)s/);
    if (secondsMatch) {
      totalSeconds += parseInt(secondsMatch[1]);
    }
    
    return totalSeconds > 0 ? totalSeconds : null;
  } catch (error) {
    return null;
  }
}

/**
 * Generate insights from duration analysis
 * @param {Object[]} durationTable - Duration analysis data
 * @param {Object} config - Configuration
 * @returns {string[]} - Array of insights
 */
function generateDurationInsights(durationTable, config) {
  const insights = [];

  if (durationTable.length === 0) {
    insights.push('No duration data found');
    return insights;
  }

  // Best and worst durations
  const best = durationTable[0];
  const worst = durationTable[durationTable.length - 1];

  if (best.totalPnL > 0) {
    insights.push(`Best duration: ${best.duration} (₹${best.totalPnL.toLocaleString()} total P&L, ${best.winRate.toFixed(1)}% win rate, ${best.tradeCount} trades)`);
  }

  if (worst.totalPnL < 0) {
    insights.push(`Worst duration: ${worst.duration} (₹${worst.totalPnL.toLocaleString()} total P&L, ${worst.winRate.toFixed(1)}% win rate, ${worst.tradeCount} trades)`);
  }

  // Duration-specific insights
  const highWinRateDurations = durationTable.filter(entry => 
    entry.winRate >= 60 && entry.tradeCount >= config.minTradesForInsight);
  
  if (highWinRateDurations.length > 0) {
    insights.push(`High win rate durations (≥60%): ${highWinRateDurations.map(d => 
      `${d.duration} (${d.winRate.toFixed(1)}%)`).join(', ')}`);
  }

  // Low win rate durations (risk warning)
  const lowWinRateDurations = durationTable.filter(entry => 
    entry.winRate < 40 && entry.tradeCount >= config.minTradesForInsight);
  
  if (lowWinRateDurations.length > 0) {
    insights.push(`Poor win rate durations (<40%): ${lowWinRateDurations.map(d => 
      `${d.duration} (${d.winRate.toFixed(1)}%)`).join(', ')}`);
  }

  // Profit factor analysis
  const highProfitFactorDurations = durationTable.filter(entry => 
    entry.profitFactor >= 2 && entry.tradeCount >= config.minTradesForInsight);
  
  if (highProfitFactorDurations.length > 0) {
    insights.push(`Excellent risk-reward durations (profit factor ≥2): ${highProfitFactorDurations.map(d => 
      `${d.duration} (${d.profitFactor.toFixed(2)})`).join(', ')}`);
  }

  // Average trade analysis
  const topAvgPnLDurations = durationTable
    .filter(entry => entry.tradeCount >= config.minTradesForInsight)
    .sort((a, b) => b.avgPnL - a.avgPnL)
    .slice(0, 2);
  
  if (topAvgPnLDurations.length > 0) {
    insights.push(`Highest avg P&L per trade: ${topAvgPnLDurations.map(d => 
      `${d.duration} (₹${d.avgPnL.toFixed(0)})`).join(', ')}`);
  }

  // Trade frequency analysis
  const totalTrades = durationTable.reduce((sum, entry) => sum + entry.tradeCount, 0);
  const mostFrequentDuration = durationTable.reduce((prev, current) => 
    current.tradeCount > prev.tradeCount ? current : prev);
  
  insights.push(`Most frequent duration: ${mostFrequentDuration.duration} (${mostFrequentDuration.tradeCount} trades, ${(mostFrequentDuration.tradeCount/totalTrades*100).toFixed(1)}% of total)`);

  // Quick vs slow trades comparison
  const quickTrades = durationTable.filter(d => ['<1m', '1-5m'].includes(d.duration));
  const slowTrades = durationTable.filter(d => ['30-60m', '1-2h', '>2h'].includes(d.duration));
  
  if (quickTrades.length > 0 && slowTrades.length > 0) {
    const quickPnL = quickTrades.reduce((sum, d) => sum + d.totalPnL, 0);
    const slowPnL = slowTrades.reduce((sum, d) => sum + d.totalPnL, 0);
    
    if (quickPnL > slowPnL) {
      insights.push(`Quick trades (<5m) outperform slow trades (>30m): ₹${quickPnL.toLocaleString()} vs ₹${slowPnL.toLocaleString()}`);
    } else {
      insights.push(`Slow trades (>30m) outperform quick trades (<5m): ₹${slowPnL.toLocaleString()} vs ₹${quickPnL.toLocaleString()}`);
    }
  }

  return insights;
}

/**
 * Generate recommendations from duration analysis
 * @param {Object[]} durationTable - Duration analysis data
 * @param {Object} config - Configuration
 * @returns {string[]} - Array of recommendations
 */
function generateDurationRecommendations(durationTable, config) {
  const recommendations = [];

  if (durationTable.length === 0) {
    recommendations.push('Collect more trading data for better recommendations');
    return recommendations;
  }

  // Focus on best durations
  const profitableDurations = durationTable
    .filter(entry => entry.totalPnL > 0 && entry.tradeCount >= config.minTradesForInsight)
    .slice(0, 3);
  
  if (profitableDurations.length > 0) {
    recommendations.push(`Focus on profitable durations: ${profitableDurations.map(d => 
      `${d.duration} (₹${d.avgPnL.toFixed(0)} avg)`).join(', ')}`);
  }

  // Avoid worst durations
  const unprofitableDurations = durationTable
    .filter(entry => entry.totalPnL < 0 && entry.tradeCount >= config.minTradesForInsight)
    .slice(-2);
  
  if (unprofitableDurations.length > 0) {
    recommendations.push(`Avoid or review strategy for: ${unprofitableDurations.map(d => 
      `${d.duration} (₹${d.avgPnL.toFixed(0)} avg)`).join(', ')}`);
  }

  // Win rate based recommendations
  const highWinRateDurations = durationTable.filter(entry => 
    entry.winRate >= 65 && entry.tradeCount >= config.minTradesForInsight);
  
  if (highWinRateDurations.length > 0) {
    recommendations.push(`Increase allocation to high win rate durations: ${highWinRateDurations.map(d => 
      `${d.duration} (${d.winRate.toFixed(1)}%)`).join(', ')}`);
  }

  // Risk management recommendations
  const highRiskDurations = durationTable.filter(entry => 
    Math.abs(entry.avgLoss) > Math.abs(entry.avgProfit) * 2 && entry.tradeCount >= config.minTradesForInsight);
  
  if (highRiskDurations.length > 0) {
    recommendations.push(`Implement stricter stop-losses for: ${highRiskDurations.map(d => 
      `${d.duration} (avg loss: ₹${Math.abs(d.avgLoss).toFixed(0)})`).join(', ')}`);
  }

  // Sweet spot recommendations
  const sweetSpotDurations = durationTable.filter(entry => 
    entry.winRate >= 55 && entry.profitFactor >= 1.5 && entry.tradeCount >= config.minTradesForInsight);
  
  if (sweetSpotDurations.length > 0) {
    recommendations.push(`Sweet spot durations (good win rate + profit factor): ${sweetSpotDurations.map(d => 
      `${d.duration}`).join(', ')}`);
  }

  // Efficiency recommendations
  const efficientDurations = durationTable
    .filter(entry => entry.tradeCount >= config.minTradesForInsight)
    .sort((a, b) => b.avgPnL - a.avgPnL)
    .slice(0, 2);
  
  if (efficientDurations.length > 0 && efficientDurations[0].avgPnL > 0) {
    recommendations.push(`Most efficient durations (highest avg P&L): ${efficientDurations.map(d => 
      `${d.duration}`).join(', ')}`);
  }

  return recommendations;
}

// Export the analysis function
module.exports = {
  analyzeDurationOutcomePnL,
  generateDurationInsights,
  generateDurationRecommendations,
  mapToStandardDuration,
  parseDurationString
};
