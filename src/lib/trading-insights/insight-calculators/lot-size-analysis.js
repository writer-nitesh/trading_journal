/**
 * Lot Size × P&L Analysis - JavaScript Implementation
 * Equivalent to Python trade size analysis from insights10.ipynb
 * 
 * This module analyzes trading performance by lot size (trade size) to identify
 * optimal trade sizes, risk patterns, and size-based performance metrics.
 * Trade Size = Entry Price × Quantity
 */

// Import utility modules
const DataProcessor = require('../utils/data-processor.js');
const Calculations = require('../utils/calculations.js');

/**
 * Trade size buckets based on Indian market standards
 */
const TRADE_SIZE_BUCKETS = [
  { min: 0, max: 50000, label: 'Small (<₹50K)' },
  { min: 50000, max: 100000, label: 'Medium (₹50K-1L)' },
  { min: 100000, max: 200000, label: 'Large (₹1L-2L)' },
  { min: 200000, max: Infinity, label: 'Very Large (>₹2L)' }
];

/**
 * Main function to analyze Lot Size × P&L
 * @param {Object[]} processedTradingData - Array of processed trading records
 * @param {Object} options - Configuration options
 * @returns {Object} - Analysis results with insights
 */
function analyzeLotSizePnL(processedTradingData, options = {}) {
  try {
    // Validate input
    if (!Array.isArray(processedTradingData) || processedTradingData.length === 0) {
      throw new Error('Invalid trading data: Expected non-empty array');
    }

    // Configuration
    const config = {
      minTradesForInsight: options.minTradesForInsight || 3,
      customBuckets: options.customBuckets || TRADE_SIZE_BUCKETS,
      includeOutliers: options.includeOutliers || false,
      ...options
    };

    // Create lot size analysis table
    const lotSizeMap = new Map();
    const validTrades = [];

    // Initialize map for all lot size buckets
    config.customBuckets.forEach(bucket => {
      lotSizeMap.set(bucket.label, {
        label: bucket.label,
        minSize: bucket.min,
        maxSize: bucket.max,
        trades: [],
        totalPnL: 0,
        tradeCount: 0,
        profitTrades: 0,
        lossTrades: 0,
        totalProfit: 0,
        totalLoss: 0
      });
    });

    // Process each trade
    processedTradingData.forEach((trade, index) => {
      try {
        const pnl = trade.pnl;
        const entryPrice = trade.entryPrice || 0;
        const quantity = trade.quantity || 0;
        
        // Calculate trade size (lot size)
        const tradeSize = entryPrice * Math.abs(quantity);

        if (typeof pnl !== 'number' || typeof tradeSize !== 'number' || tradeSize <= 0) {
          return; // Skip invalid records
        }

        // Find appropriate bucket
        const bucket = findTradeSizeBucket(tradeSize, config.customBuckets);
        
        if (bucket && lotSizeMap.has(bucket.label)) {
          const entry = lotSizeMap.get(bucket.label);
          entry.trades.push({...trade, tradeSize});
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

        validTrades.push({...trade, tradeSize});
        
      } catch (error) {
        console.warn(`Error processing trade at index ${index}:`, error);
      }
    });

    if (validTrades.length === 0) {
      throw new Error('No valid trades found after processing');
    }

    // Create lot size analysis table
    const lotSizeTable = [];
    lotSizeMap.forEach((data, label) => {
      if (data.tradeCount > 0) {
        const winRate = (data.profitTrades / data.tradeCount) * 100;
        const avgPnL = data.totalPnL / data.tradeCount;
        const avgProfit = data.profitTrades > 0 ? data.totalProfit / data.profitTrades : 0;
        const avgLoss = data.lossTrades > 0 ? data.totalLoss / data.lossTrades : 0;
        const profitFactor = Math.abs(avgLoss) > 0 ? avgProfit / Math.abs(avgLoss) : 0;
        const avgTradeSize = data.trades.reduce((sum, trade) => sum + trade.tradeSize, 0) / data.tradeCount;
        
        lotSizeTable.push({
          sizeCategory: data.label,
          minSize: data.minSize,
          maxSize: data.maxSize,
          totalPnL: data.totalPnL,
          avgPnL: avgPnL,
          avgTradeSize: avgTradeSize,
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
    lotSizeTable.sort((a, b) => b.totalPnL - a.totalPnL);

    // Generate insights and recommendations
    const insights = generateLotSizeInsights(lotSizeTable, validTrades, config);
    const recommendations = generateLotSizeRecommendations(lotSizeTable, validTrades, config);

    // Calculate summary statistics
    const summary = {
      totalTrades: validTrades.length,
      totalPnL: validTrades.reduce((sum, trade) => sum + trade.pnl, 0),
      overallWinRate: (validTrades.filter(trade => trade.pnl > 0).length / validTrades.length) * 100,
      avgTradeSize: validTrades.reduce((sum, trade) => sum + trade.tradeSize, 0) / validTrades.length,
      minTradeSize: Math.min(...validTrades.map(trade => trade.tradeSize)),
      maxTradeSize: Math.max(...validTrades.map(trade => trade.tradeSize)),
      bestSizeCategory: lotSizeTable.length > 0 ? lotSizeTable[0].sizeCategory : 'N/A',
      worstSizeCategory: lotSizeTable.length > 0 ? lotSizeTable[lotSizeTable.length - 1].sizeCategory : 'N/A'
    };

    return {
      success: true,
      data: {
        lotSizeTable: lotSizeTable,
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
 * Find the appropriate trade size bucket for a given trade size
 * @param {number} tradeSize - Trade size in currency units
 * @param {Object[]} buckets - Array of bucket definitions
 * @returns {Object|null} - Matching bucket or null
 */
function findTradeSizeBucket(tradeSize, buckets) {
  return buckets.find(bucket => tradeSize >= bucket.min && tradeSize < bucket.max);
}

/**
 * Generate insights from lot size analysis
 * @param {Object[]} lotSizeTable - Lot size analysis data
 * @param {Object[]} validTrades - All valid trades
 * @param {Object} config - Configuration
 * @returns {string[]} - Array of insights
 */
function generateLotSizeInsights(lotSizeTable, validTrades, config) {
  const insights = [];

  if (lotSizeTable.length === 0) {
    insights.push('No lot size data found');
    return insights;
  }

  // Best and worst size categories
  const best = lotSizeTable[0];
  const worst = lotSizeTable[lotSizeTable.length - 1];

  if (best.totalPnL > 0) {
    insights.push(`Best size category: ${best.sizeCategory} (₹${best.totalPnL.toLocaleString()} total P&L, ${best.winRate.toFixed(1)}% win rate, ${best.tradeCount} trades)`);
  }

  if (worst.totalPnL < 0) {
    insights.push(`Worst size category: ${worst.sizeCategory} (₹${worst.totalPnL.toLocaleString()} total P&L, ${worst.winRate.toFixed(1)}% win rate, ${worst.tradeCount} trades)`);
  }

  // High win rate categories
  const highWinRateCategories = lotSizeTable.filter(entry => 
    entry.winRate >= 60 && entry.tradeCount >= config.minTradesForInsight);
  
  if (highWinRateCategories.length > 0) {
    insights.push(`High win rate categories (≥60%): ${highWinRateCategories.map(c => 
      `${c.sizeCategory} (${c.winRate.toFixed(1)}%)`).join(', ')}`);
  }

  // Low win rate categories (risk warning)
  const lowWinRateCategories = lotSizeTable.filter(entry => 
    entry.winRate < 40 && entry.tradeCount >= config.minTradesForInsight);
  
  if (lowWinRateCategories.length > 0) {
    insights.push(`Poor win rate categories (<40%): ${lowWinRateCategories.map(c => 
      `${c.sizeCategory} (${c.winRate.toFixed(1)}%)`).join(', ')}`);
  }

  // Profit factor analysis
  const highProfitFactorCategories = lotSizeTable.filter(entry => 
    entry.profitFactor >= 2 && entry.tradeCount >= config.minTradesForInsight);
  
  if (highProfitFactorCategories.length > 0) {
    insights.push(`Excellent risk-reward categories (profit factor ≥2): ${highProfitFactorCategories.map(c => 
      `${c.sizeCategory} (${c.profitFactor.toFixed(2)})`).join(', ')}`);
  }

  // Average P&L analysis
  const topAvgPnLCategories = lotSizeTable
    .filter(entry => entry.tradeCount >= config.minTradesForInsight)
    .sort((a, b) => b.avgPnL - a.avgPnL)
    .slice(0, 2);
  
  if (topAvgPnLCategories.length > 0) {
    insights.push(`Highest avg P&L per trade: ${topAvgPnLCategories.map(c => 
      `${c.sizeCategory} (₹${c.avgPnL.toFixed(0)})`).join(', ')}`);
  }

  // Trade frequency analysis
  const totalTrades = lotSizeTable.reduce((sum, entry) => sum + entry.tradeCount, 0);
  const mostFrequentCategory = lotSizeTable.reduce((prev, current) => 
    current.tradeCount > prev.tradeCount ? current : prev);
  
  insights.push(`Most frequent category: ${mostFrequentCategory.sizeCategory} (${mostFrequentCategory.tradeCount} trades, ${(mostFrequentCategory.tradeCount/totalTrades*100).toFixed(1)}% of total)`);

  // Small vs Large trades comparison
  const smallTrades = lotSizeTable.filter(c => c.sizeCategory.includes('Small'));
  const largeTrades = lotSizeTable.filter(c => c.sizeCategory.includes('Large') || c.sizeCategory.includes('Very Large'));
  
  if (smallTrades.length > 0 && largeTrades.length > 0) {
    const smallPnL = smallTrades.reduce((sum, c) => sum + c.totalPnL, 0);
    const largePnL = largeTrades.reduce((sum, c) => sum + c.totalPnL, 0);
    
    if (smallPnL > largePnL) {
      insights.push(`Small trades outperform large trades: ₹${smallPnL.toLocaleString()} vs ₹${largePnL.toLocaleString()}`);
    } else {
      insights.push(`Large trades outperform small trades: ₹${largePnL.toLocaleString()} vs ₹${smallPnL.toLocaleString()}`);
    }
  }

  // Trade size distribution
  const avgTradeSize = validTrades.reduce((sum, trade) => sum + trade.tradeSize, 0) / validTrades.length;
  const medianTradeSize = Calculations.calculatePercentile(validTrades.map(t => t.tradeSize), 50);
  
  insights.push(`Average trade size: ₹${avgTradeSize.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`);
  insights.push(`Median trade size: ₹${medianTradeSize.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`);

  // Correlation analysis
  if (validTrades.length > 1) {
    const tradeSizes = validTrades.map(trade => trade.tradeSize);
    const pnls = validTrades.map(trade => trade.pnl);
    const correlation = Calculations.calculateCorrelation(tradeSizes, pnls);
    
    insights.push(`Trade size vs P&L correlation: ${correlation.toFixed(3)}`);
    if (correlation > 0.1) {
      insights.push('→ Positive correlation: Larger trades tend to be more profitable');
    } else if (correlation < -0.1) {
      insights.push('→ Negative correlation: Smaller trades tend to be more profitable');
    } else {
      insights.push('→ Weak correlation: Trade size has little impact on profitability');
    }
  }

  return insights;
}

/**
 * Generate recommendations from lot size analysis
 * @param {Object[]} lotSizeTable - Lot size analysis data
 * @param {Object[]} validTrades - All valid trades
 * @param {Object} config - Configuration
 * @returns {string[]} - Array of recommendations
 */
function generateLotSizeRecommendations(lotSizeTable, validTrades, config) {
  const recommendations = [];

  if (lotSizeTable.length === 0) {
    recommendations.push('Collect more trading data with entry price and quantity for better recommendations');
    return recommendations;
  }

  // Focus on best size categories
  const profitableCategories = lotSizeTable
    .filter(entry => entry.totalPnL > 0 && entry.tradeCount >= config.minTradesForInsight)
    .slice(0, 2);
  
  if (profitableCategories.length > 0) {
    recommendations.push(`Focus on profitable size categories: ${profitableCategories.map(c => 
      `${c.sizeCategory} (₹${c.avgPnL.toFixed(0)} avg)`).join(', ')}`);
  }

  // Avoid worst categories
  const unprofitableCategories = lotSizeTable
    .filter(entry => entry.totalPnL < 0 && entry.tradeCount >= config.minTradesForInsight)
    .slice(-2);
  
  if (unprofitableCategories.length > 0) {
    recommendations.push(`Avoid or review strategy for: ${unprofitableCategories.map(c => 
      `${c.sizeCategory} (₹${c.avgPnL.toFixed(0)} avg)`).join(', ')}`);
  }

  // Win rate based recommendations
  const highWinRateCategories = lotSizeTable.filter(entry => 
    entry.winRate >= 65 && entry.tradeCount >= config.minTradesForInsight);
  
  if (highWinRateCategories.length > 0) {
    recommendations.push(`Increase allocation to high win rate categories: ${highWinRateCategories.map(c => 
      `${c.sizeCategory} (${c.winRate.toFixed(1)}%)`).join(', ')}`);
  }

  // Risk management recommendations
  const highRiskCategories = lotSizeTable.filter(entry => 
    Math.abs(entry.avgLoss) > Math.abs(entry.avgProfit) * 2 && entry.tradeCount >= config.minTradesForInsight);
  
  if (highRiskCategories.length > 0) {
    recommendations.push(`Implement stricter risk management for: ${highRiskCategories.map(c => 
      `${c.sizeCategory} (avg loss: ₹${Math.abs(c.avgLoss).toFixed(0)})`).join(', ')}`);
  }

  // Position sizing recommendations
  const bestCategory = lotSizeTable.length > 0 ? lotSizeTable[0] : null;
  if (bestCategory && bestCategory.totalPnL > 0) {
    if (bestCategory.sizeCategory.includes('Small')) {
      recommendations.push('Your best performance is with small position sizes - consider this for risk management');
    } else if (bestCategory.sizeCategory.includes('Large')) {
      recommendations.push('Large position sizes work well for you - but ensure proper risk management');
    }
  }

  // Efficiency recommendations
  const efficientCategories = lotSizeTable
    .filter(entry => entry.tradeCount >= config.minTradesForInsight)
    .sort((a, b) => b.avgPnL - a.avgPnL)
    .slice(0, 2);
  
  if (efficientCategories.length > 0 && efficientCategories[0].avgPnL > 0) {
    recommendations.push(`Most efficient size categories (highest avg P&L): ${efficientCategories.map(c => 
      `${c.sizeCategory}`).join(', ')}`);
  }

  // Diversification recommendations
  const profitableCategoriesCount = lotSizeTable.filter(entry => entry.totalPnL > 0).length;
  if (profitableCategoriesCount <= 1) {
    recommendations.push('Consider diversifying across different position sizes to reduce concentration risk');
  }

  // Correlation-based recommendations
  if (validTrades.length > 10) {
    const tradeSizes = validTrades.map(trade => trade.tradeSize);
    const pnls = validTrades.map(trade => trade.pnl);
    const correlation = Calculations.calculateCorrelation(tradeSizes, pnls);
    
    if (correlation > 0.2) {
      recommendations.push('Strong positive correlation detected - consider gradually increasing position sizes');
    } else if (correlation < -0.2) {
      recommendations.push('Negative correlation detected - smaller positions may be more suitable for your strategy');
    }
  }

  return recommendations;
}

/**
 * Format results for display
 * @param {Object} analysisResult - Result from analyzeLotSizePnL
 * @returns {string} - Formatted text output
 */
function formatLotSizeAnalysisResults(analysisResult) {
  if (!analysisResult.success) {
    return `Error: ${analysisResult.error}`;
  }

  const { data, metadata } = analysisResult;
  let output = [];

  output.push('LOT SIZE × P&L ANALYSIS');
  output.push('='.repeat(50));
  output.push('');

  // Summary
  output.push('SUMMARY:');
  output.push(`Total Trades: ${data.summary.totalTrades.toLocaleString()}`);
  output.push(`Total P&L: ${Calculations.formatCurrency(data.summary.totalPnL)}`);
  output.push(`Overall Win Rate: ${data.summary.overallWinRate.toFixed(1)}%`);
  output.push(`Average Trade Size: ${Calculations.formatCurrency(data.summary.avgTradeSize)}`);
  output.push(`Trade Size Range: ${Calculations.formatCurrency(data.summary.minTradeSize)} to ${Calculations.formatCurrency(data.summary.maxTradeSize)}`);
  output.push(`Best Size Category: ${data.summary.bestSizeCategory}`);
  output.push(`Worst Size Category: ${data.summary.worstSizeCategory}`);
  output.push('');

  // Lot size table
  output.push('LOT SIZE ANALYSIS TABLE:');
  output.push('-'.repeat(100));
  output.push('Size Category    | Trades | Total P&L    | Avg P&L  | Win Rate | Avg Size     | Profit Factor');
  output.push('-'.repeat(100));
  
  data.lotSizeTable.forEach(entry => {
    const category = entry.sizeCategory.padEnd(15);
    const trades = entry.tradeCount.toString().padStart(6);
    const totalPnL = Calculations.formatCurrency(entry.totalPnL).padStart(12);
    const avgPnL = Calculations.formatCurrency(entry.avgPnL).padStart(8);
    const winRate = `${entry.winRate.toFixed(1)}%`.padStart(8);
    const avgSize = Calculations.formatCurrency(entry.avgTradeSize).padStart(12);
    const profitFactor = entry.profitFactor.toFixed(2).padStart(13);
    output.push(`${category} | ${trades} | ${totalPnL} | ${avgPnL} | ${winRate} | ${avgSize} | ${profitFactor}`);
  });
  output.push('-'.repeat(100));
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
  output.push(`Skipped Trades: ${metadata.skippedTrades}`);
  output.push(`Analysis Date: ${metadata.analysisDate.toISOString()}`);

  return output.join('\n');
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  module.exports = {
    analyzeLotSizePnL,
    formatLotSizeAnalysisResults,
    generateLotSizeInsights,
    generateLotSizeRecommendations,
    findTradeSizeBucket,
    TRADE_SIZE_BUCKETS
  };
} else {
  // Browser environment
  window.TradingInsights = window.TradingInsights || {};
  window.TradingInsights.LotSizeAnalysis = {
    analyzeLotSizePnL,
    formatLotSizeAnalysisResults,
    generateLotSizeInsights,
    generateLotSizeRecommendations,
    findTradeSizeBucket,
    TRADE_SIZE_BUCKETS
  };
}
