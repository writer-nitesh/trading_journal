/**
 * First Trade vs Later Trades Analysis - JavaScript Implementation
 * Equivalent to Python insight #9 from insights10.ipynb
 * 
 * This module analyzes trading performance by trade sequence within each day
 * to identify performance degradation patterns, first trade advantages,
 * and psychological trading patterns. Focus on data-driven insights only.
 */

// Import utility modules
const DataProcessor = require('../utils/data-processor.js');
const Calculations = require('../utils/calculations.js');

/**
 * Categorize trade sequence based on trade number within the day
 * @param {number} tradeNum - Trade number within the day (1-based)
 * @returns {string} - Trade category
 */
function categorizeTradeSequence(tradeNum) {
  if (tradeNum === 1) {
    return 'First Trade';
  } else if (tradeNum <= 3) {
    return 'Early Trades (2-3)';
  } else if (tradeNum <= 5) {
    return 'Mid Trades (4-5)';
  } else {
    return 'Late Trades (6+)';
  }
}

/**
 * Calculate performance statistics for a group of trades
 * @param {Object[]} trades - Array of trade objects
 * @returns {Object} - Performance statistics
 */
function calculatePerformanceStats(trades) {
  if (!trades || trades.length === 0) {
    return {
      count: 0,
      netPnL: 0,
      avgPnL: 0,
      winRate: 0,
      lossRate: 0,
      stdDev: 0
    };
  }

  const pnlValues = trades.map(t => t.pnl);
  const totalPnL = pnlValues.reduce((sum, pnl) => sum + pnl, 0);
  const wins = pnlValues.filter(pnl => pnl > 0).length;
  const losses = pnlValues.filter(pnl => pnl < 0).length;
  
  // Calculate standard deviation
  const mean = totalPnL / trades.length;
  const squaredDiffs = pnlValues.map(pnl => Math.pow(pnl - mean, 2));
  const variance = squaredDiffs.reduce((sum, sq) => sum + sq, 0) / trades.length;
  const stdDev = Math.sqrt(variance);

  return {
    count: trades.length,
    netPnL: totalPnL,
    avgPnL: totalPnL / trades.length,
    winRate: (wins / trades.length) * 100,
    lossRate: (losses / trades.length) * 100,
    stdDev: stdDev
  };
}

/**
 * Analyze daily overtrading patterns
 * @param {Object[]} processedData - Processed trading data with trade numbers
 * @returns {Object} - Overtrading analysis
 */
function analyzeOvertradingPatterns(processedData) {
  // Group trades by date to find daily trade counts
  const dailyTradeMap = new Map();
  
  processedData.forEach(trade => {
    const dateStr = trade.date.toDateString();
    if (!dailyTradeMap.has(dateStr)) {
      dailyTradeMap.set(dateStr, []);
    }
    dailyTradeMap.get(dateStr).push(trade);
  });

  // Analyze high-volume vs low-volume days
  const dailyStats = Array.from(dailyTradeMap.entries()).map(([date, trades]) => {
    const maxTradeNum = Math.max(...trades.map(t => t.tradeNumber));
    const dailyPnL = trades.reduce((sum, t) => sum + t.pnl, 0);
    const avgPnLPerTrade = dailyPnL / trades.length;
    
    return {
      date,
      tradeCount: trades.length,
      maxTradeNumber: maxTradeNum,
      dailyPnL,
      avgPnLPerTrade,
      isHighVolume: maxTradeNum >= 6
    };
  });

  const highVolumeDays = dailyStats.filter(day => day.isHighVolume);
  const lowVolumeDays = dailyStats.filter(day => !day.isHighVolume);

  const highVolumePerformance = highVolumeDays.length > 0 
    ? highVolumeDays.reduce((sum, day) => sum + day.avgPnLPerTrade, 0) / highVolumeDays.length 
    : 0;
  
  const lowVolumePerformance = lowVolumeDays.length > 0 
    ? lowVolumeDays.reduce((sum, day) => sum + day.avgPnLPerTrade, 0) / lowVolumeDays.length 
    : 0;

  return {
    totalTradingDays: dailyStats.length,
    highVolumeDays: highVolumeDays.length,
    lowVolumeDays: lowVolumeDays.length,
    highVolumePerformance,
    lowVolumePerformance,
    overtradingCost: lowVolumePerformance - highVolumePerformance,
    highVolumePercentage: (highVolumeDays.length / dailyStats.length) * 100
  };
}

/**
 * Generate insights based on trade sequence analysis
 * @param {Object} analysisData - Results from the trade sequence analysis
 * @returns {string[]} - Array of insight strings
 */
function generateTradeSequenceInsights(analysisData) {
  const insights = [];
  const { sequenceAnalysis, individualTradeAnalysis, summary, overtradingAnalysis } = analysisData;

  // First trade performance insights
  const firstTradeStats = sequenceAnalysis.find(cat => cat.category === 'First Trade');
  if (firstTradeStats) {
    const winRateDiff = firstTradeStats.winRate - summary.overallWinRate;
    const pnlDiff = firstTradeStats.avgPnL - summary.overallAvgPnL;

    if (winRateDiff > 5) {
      insights.push(`First trades significantly outperform with ${firstTradeStats.winRate.toFixed(1)}% win rate (${winRateDiff.toFixed(1)}% points above average)`);
    } else if (winRateDiff < -5) {
      insights.push(`First trades underperform with ${firstTradeStats.winRate.toFixed(1)}% win rate (${Math.abs(winRateDiff).toFixed(1)}% points below average)`);
    }

    if (pnlDiff > 100) {
      insights.push(`First trades earn ₹${pnlDiff.toFixed(0)} more per trade than average - capitalize on strong morning setups`);
    }
  }

  // Performance degradation insights
  const lateTradeStats = sequenceAnalysis.find(cat => cat.category === 'Late Trades (6+)');
  if (firstTradeStats && lateTradeStats) {
    const degradation = firstTradeStats.winRate - lateTradeStats.winRate;
    if (degradation > 10) {
      insights.push(`SIGNIFICANT performance degradation: ${degradation.toFixed(1)}% point drop from first to late trades`);
    } else if (degradation > 5) {
      insights.push(`Moderate performance degradation: ${degradation.toFixed(1)}% point drop from first to late trades`);
    }

    if (lateTradeStats.winRate < 45) {
      insights.push(`Late trades (6+) show poor performance at ${lateTradeStats.winRate.toFixed(1)}% win rate - consider daily trade limits`);
    }
  }

  // Individual trade number insights
  if (individualTradeAnalysis.length > 3) {
    const bestTrade = individualTradeAnalysis.reduce((best, trade) => trade.winRate > best.winRate ? trade : best);
    const worstTrade = individualTradeAnalysis.reduce((worst, trade) => trade.winRate < worst.winRate ? trade : worst);
    
    insights.push(`Trade #${bestTrade.tradeNumber} performs best (${bestTrade.winRate.toFixed(1)}% win rate)`);
    insights.push(`Trade #${worstTrade.tradeNumber} performs worst (${worstTrade.winRate.toFixed(1)}% win rate)`);

    // Check for significant drops
    const trade1 = individualTradeAnalysis.find(t => t.tradeNumber === 1);
    if (trade1) {
      const significantDrops = individualTradeAnalysis.filter(t => 
        t.tradeNumber > 1 && (trade1.winRate - t.winRate) >= 15
      );
      
      if (significantDrops.length > 0) {
        const firstDrop = significantDrops[0];
        insights.push(`ALERT: Win rate drops ${(trade1.winRate - firstDrop.winRate).toFixed(1)}% by trade #${firstDrop.tradeNumber}`);
      }
    }
  }

  // Overtrading insights
  if (overtradingAnalysis.highVolumeDays > 0) {
    insights.push(`${overtradingAnalysis.highVolumePercentage.toFixed(1)}% of trading days have 6+ trades`);
    
    if (overtradingAnalysis.overtradingCost > 100) {
      insights.push(`Overtrading costs ₹${overtradingAnalysis.overtradingCost.toFixed(0)} per trade on high-volume days`);
    } else if (overtradingAnalysis.overtradingCost < -100) {
      insights.push(`High-volume trading actually adds ₹${Math.abs(overtradingAnalysis.overtradingCost).toFixed(0)} per trade`);
    }
  }

  // Trading pattern insights
  if (summary.avgTradesPerDay > 8) {
    insights.push(`High trading frequency detected: ${summary.avgTradesPerDay.toFixed(1)} trades per day average`);
  }

  const maxTradesPerDay = Math.max(...individualTradeAnalysis.map(t => t.tradeNumber));
  if (maxTradesPerDay > 15) {
    insights.push(`Extreme trading detected: Up to ${maxTradesPerDay} trades in a single day`);
  }

  return insights;
}

/**
 * Generate recommendations based on trade sequence analysis
 * @param {Object} analysisData - Results from the trade sequence analysis
 * @returns {string[]} - Array of recommendation strings
 */
function generateTradeSequenceRecommendations(analysisData) {
  const recommendations = [];
  const { sequenceAnalysis, individualTradeAnalysis, summary, overtradingAnalysis } = analysisData;

  // First trade recommendations
  const firstTradeStats = sequenceAnalysis.find(cat => cat.category === 'First Trade');
  if (firstTradeStats && firstTradeStats.winRate > summary.overallWinRate + 5) {
    recommendations.push('CAPITALIZE ON STRONG STARTS: Focus maximum effort and larger position sizes on first trades');
    recommendations.push('Enhance morning preparation routine and pre-market analysis');
  }

  // Late trade recommendations
  const lateTradeStats = sequenceAnalysis.find(cat => cat.category === 'Late Trades (6+)');
  if (lateTradeStats && lateTradeStats.winRate < 45) {
    recommendations.push('IMPLEMENT DAILY TRADE LIMITS: Stop trading after 5 trades per day');
    recommendations.push('Set up automated alerts when approaching daily trade limits');
  }

  // Early trades optimization
  const earlyTrades = individualTradeAnalysis.filter(t => t.tradeNumber <= 3);
  if (earlyTrades.length > 0) {
    const avgEarlyWinRate = earlyTrades.reduce((sum, t) => sum + t.winRate, 0) / earlyTrades.length;
    if (avgEarlyWinRate > 55) {
      recommendations.push('OPTIMIZE EARLY TRADING: First 3 trades show strong performance - focus energy here');
    }
  }

  // Overtrading recommendations
  if (overtradingAnalysis.overtradingCost > 100) {
    recommendations.push('AVOID OVERTRADING: High-volume days underperform - implement stricter entry criteria');
    recommendations.push('Consider position sizing reduction after 5 trades in a day');
  }

  // Performance degradation recommendations
  if (sequenceAnalysis.length > 1) {
    const performance = sequenceAnalysis.map(cat => cat.winRate);
    const isDecreasing = performance.every((rate, i) => i === 0 || rate <= performance[i - 1]);
    
    if (isDecreasing) {
      recommendations.push('MANAGE TRADING FATIGUE: Performance degrades throughout the day - take breaks');
      recommendations.push('Consider splitting trading sessions with rest periods');
    }
  }

  // Individual trade number recommendations
  if (individualTradeAnalysis.length >= 5) {
    const bestPerformers = individualTradeAnalysis
      .filter(t => t.winRate > summary.overallWinRate + 10)
      .map(t => t.tradeNumber);
    
    if (bestPerformers.length > 0) {
      recommendations.push(`TARGET OPTIMAL TRADE NUMBERS: Focus on trades #${bestPerformers.join(', ')} which consistently outperform`);
    }
  }

  // Risk management recommendations
  if (summary.maxTradesPerDay > 10) {
    recommendations.push('IMPLEMENT RISK CONTROLS: Maximum daily trades should be capped to prevent emotional trading');
  }

  // General strategic recommendations
  recommendations.push('TRACK INTRADAY PERFORMANCE: Monitor real-time win rate degradation during trading');
  recommendations.push('REVIEW TRADE SEQUENCING: Analyze what changes between early and late trades');

  return recommendations;
}

/**
 * Main function to analyze First Trade vs Later Trades performance
 * @param {Object[]} processedTradingData - Array of processed trading records
 * @param {Object} options - Configuration options
 * @returns {Object} - Analysis results with insights
 */
function analyzeTradeSequencePnL(processedTradingData, options = {}) {
  try {
    // Validate input
    if (!Array.isArray(processedTradingData) || processedTradingData.length === 0) {
      throw new Error('Invalid trading data: Expected non-empty array');
    }

    // Sort trades by date and time to establish proper sequence
    const sortedTrades = processedTradingData
      .filter(trade => trade.date && typeof trade.pnl === 'number')
      .sort((a, b) => {
        const dateCompare = a.date.getTime() - b.date.getTime();
        if (dateCompare !== 0) return dateCompare;
        
        // If same date, sort by entry time if available
        if (a.entryTime && b.entryTime) {
          const aTimeMinutes = (a.entryTime.hour || 0) * 60 + (a.entryTime.minute || 0);
          const bTimeMinutes = (b.entryTime.hour || 0) * 60 + (b.entryTime.minute || 0);
          return aTimeMinutes - bTimeMinutes;
        }
        return 0;
      });

    // Group trades by date and assign trade numbers
    const dailyTradeMap = new Map();
    const tradesWithSequence = [];

    sortedTrades.forEach(trade => {
      const dateStr = trade.date.toDateString();
      if (!dailyTradeMap.has(dateStr)) {
        dailyTradeMap.set(dateStr, 0);
      }
      
      const tradeNumber = dailyTradeMap.get(dateStr) + 1;
      dailyTradeMap.set(dateStr, tradeNumber);

      const tradeWithSequence = {
        ...trade,
        tradeNumber,
        tradeCategory: categorizeTradeSequence(tradeNumber)
      };

      tradesWithSequence.push(tradeWithSequence);
    });

    // Analysis by trade sequence categories
    const categoryMap = new Map();
    tradesWithSequence.forEach(trade => {
      const category = trade.tradeCategory;
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category).push(trade);
    });

    const sequenceAnalysis = [];
    const categoryOrder = ['First Trade', 'Early Trades (2-3)', 'Mid Trades (4-5)', 'Late Trades (6+)'];
    
    categoryOrder.forEach(category => {
      if (categoryMap.has(category)) {
        const trades = categoryMap.get(category);
        const stats = calculatePerformanceStats(trades);
        sequenceAnalysis.push({
          category,
          ...stats
        });
      }
    });

    // Analysis by individual trade numbers (1-10)
    const tradeNumberMap = new Map();
    tradesWithSequence
      .filter(trade => trade.tradeNumber <= 10)
      .forEach(trade => {
        const tradeNum = trade.tradeNumber;
        if (!tradeNumberMap.has(tradeNum)) {
          tradeNumberMap.set(tradeNum, []);
        }
        tradeNumberMap.get(tradeNum).push(trade);
      });

    const individualTradeAnalysis = [];
    for (let i = 1; i <= 10; i++) {
      if (tradeNumberMap.has(i)) {
        const trades = tradeNumberMap.get(i);
        const stats = calculatePerformanceStats(trades);
        individualTradeAnalysis.push({
          tradeNumber: i,
          ...stats
        });
      }
    }

    // Overall summary statistics
    const totalTrades = tradesWithSequence.length;
    const totalTradingDays = dailyTradeMap.size;
    const avgTradesPerDay = totalTrades / totalTradingDays;
    const maxTradesPerDay = Math.max(...Array.from(dailyTradeMap.values()));
    const totalPnL = tradesWithSequence.reduce((sum, trade) => sum + trade.pnl, 0);
    const overallWinRate = (tradesWithSequence.filter(t => t.pnl > 0).length / totalTrades) * 100;
    const overallAvgPnL = totalPnL / totalTrades;

    // Overtrading pattern analysis
    const overtradingAnalysis = analyzeOvertradingPatterns(tradesWithSequence);

    const summary = {
      totalTrades,
      totalTradingDays,
      avgTradesPerDay,
      maxTradesPerDay,
      totalPnL,
      overallWinRate,
      overallAvgPnL
    };

    const analysisData = {
      sequenceAnalysis,
      individualTradeAnalysis,
      summary,
      overtradingAnalysis
    };

    // Generate insights and recommendations
    const insights = generateTradeSequenceInsights(analysisData);
    const recommendations = generateTradeSequenceRecommendations(analysisData);

    return {
      success: true,
      data: {
        summary,
        sequenceAnalysis,
        individualTradeAnalysis,
        overtradingAnalysis,
        insights,
        recommendations,
        rawData: tradesWithSequence
      }
    };

  } catch (error) {
    console.error('Trade Sequence Analysis Error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

// Export the main analysis function
if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  module.exports = {
    analyzeTradeSequencePnL,
    categorizeTradeSequence,
    calculatePerformanceStats,
    analyzeOvertradingPatterns,
    generateTradeSequenceInsights,
    generateTradeSequenceRecommendations
  };
} else {
  // Browser environment
  window.TradingInsights = window.TradingInsights || {};
  window.TradingInsights.TradeSequenceAnalysis = {
    analyzeTradeSequencePnL,
    categorizeTradeSequence,
    calculatePerformanceStats
  };
}
