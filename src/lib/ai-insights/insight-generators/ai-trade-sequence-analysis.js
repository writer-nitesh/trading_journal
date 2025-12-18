/**
 * AI-Enhanced Trade Sequence Analysis for TradioHub
 * =================================
 * Analyzes trading performance by trade sequence patterns within each day
 * Uses data tables from trade sequence analysis for AI-powered pattern recognition
 */

// Import AI utilities
const { generateAIInsights, createTradingAnalysisPrompt } = require('../utils/ai-utils.js');

/**
 * Trade sequence categories
 */
const TRADE_SEQUENCE_CATEGORIES = [
  'First Trade',
  'Early Trades (2-3)',
  'Mid Trades (4-5)',
  'Late Trades (6+)'
];

/**
 * Main function to generate AI-enhanced trade sequence analysis
 * @param {Object[]} processedTradingData - Array of processed trading records
 * @param {Object} options - Configuration options
 * @returns {Object} - AI-enhanced analysis results
 */
async function generateTradeSequenceAnalysisAIInsights(processedTradingData, options = {}) {
  const startTime = Date.now();
  
  try {
    console.log('🔄 Starting AI-enhanced Trade Sequence analysis...');
    
    // Extract data tables using the same logic as the updated ai-insights
    const dataTables = extractTradeSequenceAnalysisTables(processedTradingData);
    
    if (!dataTables || !dataTables.sequenceAnalysisTable || dataTables.sequenceAnalysisTable.length === 0) {
      return {
        success: false,
        error: 'No trade sequence data could be extracted from trading records',
        analysisType: 'trade_sequence_analysis',
        data: null,
        metadata: {
          aiEnhanced: false,
          aiProcessingDate: new Date(),
          errorOccurred: true
        }
      };
    }

    console.log('✅ Trade sequence data extraction completed');
    console.log('Sequence categories found:', dataTables.sequenceAnalysisTable.length);

    // Generate AI insights from the data tables
    let aiInsights = {
      success: false,
      insights: [],
      recommendations: [],
      riskWarnings: [],
      metadata: {
        generatedAt: new Date(),
        errorOccurred: true
      }
    };

    try {
      // Create AI prompt with data tables
      const prompt = createTradeSequenceAnalysisPrompt(dataTables);
      
      console.log('🤖 Sending prompt to Gemini AI...');
      console.log('📝 Prompt length:', prompt.length, 'characters');

      const aiResponse = await generateAIInsights(prompt, {
        analysisType: 'trade_sequence_analysis',
        model: options.model || "gemini-1.5-flash",
        maxTokens: options.maxTokens || 200,
        temperature: options.temperature || 0.2,
        provider: options.provider || "google"
      });

      if (aiResponse.success) {
        aiInsights = {
          success: true,
          insights: aiResponse.insights || [],
          recommendations: [], // Empty since we're only providing insights
          riskWarnings: [], // Empty since we're only providing insights  
          metadata: {
            tokensUsed: aiResponse.tokensUsed || estimateTokenUsage(dataTables),
            cost: aiResponse.cost || 0,
            model: options.model || "gemini-1.5-flash",
            promptLength: prompt.length,
            generatedAt: new Date(),
            isMock: aiResponse.isMock || false
          }
        };
      } else {
        throw new Error(aiResponse.error || 'AI API call failed');
      }

    } catch (aiError) {
      console.warn('AI processing failed, providing data tables only:', aiError.message);
      aiInsights = {
        success: false,
        error: `AI API call failed: ${aiError.message}`,
        insights: [],
        recommendations: [],
        riskWarnings: [],
        metadata: {
          generatedAt: new Date(),
          errorOccurred: true
        }
      };
    }

    console.log('AI Trade Sequence Analysis Result:', aiInsights.success ? '✅ Success' : '❌ Failed');

    return {
      success: true,
      analysisType: 'trade_sequence_analysis',
      data: {
        // Include all extracted data tables for backward compatibility
        sequenceTable: dataTables.sequenceAnalysisTable,
        summary: {
          totalTrades: dataTables.metadata.totalTrades,
          totalTradingDays: dataTables.metadata.totalTradingDays,
          totalPnL: dataTables.metadata.totalPnL,
          avgTradesPerDay: dataTables.metadata.avgTradesPerDay,
          bestSequence: dataTables.metadata.bestSequence,
          worstSequence: dataTables.metadata.worstSequence
        },
        // New data tables structure
        dataTables: dataTables,
        // Add AI insights
        aiInsights: aiInsights,
        metadata: {
          tablesGenerated: Object.keys(dataTables).filter(key => key !== 'metadata').length,
          aiInsightsGenerated: aiInsights.success,
          processingDate: new Date(),
          processingTime: Date.now() - startTime,
          tokenEstimate: estimateTokenUsage(dataTables)
        }
      },
      metadata: {
        processedTrades: processedTradingData.length,
        aiEnhanced: aiInsights.success,
        aiProcessingDate: new Date(),
        directTableExtraction: true
      }
    };

  } catch (error) {
    console.error('💥 Trade Sequence analysis threw exception:', error.message);
    return {
      success: false,
      error: error.message,
      analysisType: 'trade_sequence_analysis',
      data: null,
      metadata: {
        aiEnhanced: false,
        aiProcessingDate: new Date(),
        errorOccurred: true
      }
    };
  }
}

/**
 * Extract trade sequence analysis data tables from processed trading data
 * @param {Array} processedTradingData - Array of processed trading records
 * @returns {Object} - Extracted data tables
 */
function extractTradeSequenceAnalysisTables(processedTradingData) {
  if (!Array.isArray(processedTradingData) || processedTradingData.length === 0) {
    console.log('❌ Trade sequence: No data provided or data is not an array');
    throw new Error('Invalid trading data: Expected non-empty array');
  }

  console.log('📊 Trade sequence: Processing', processedTradingData.length, 'trading records');
  
  // Check first few records to understand data structure
  if (processedTradingData.length > 0) {
    const sampleTrade = processedTradingData[0];
    const pnl = sampleTrade.netPL || sampleTrade.originalPnL || sampleTrade.pnl || sampleTrade.PnL;
    console.log('📋 Sample trade structure:', {
      hasDate: !!sampleTrade.date,
      dateType: typeof sampleTrade.date,
      hasNetPL: !!sampleTrade.netPL,
      hasOriginalPnL: !!sampleTrade.originalPnL,
      hasPnL: !!sampleTrade.pnl,
      detectedPnL: pnl,
      keys: Object.keys(sampleTrade).slice(0, 10)
    });
  }

  // Sort trades by date and time to establish proper sequence
  const sortedTrades = processedTradingData
    .filter(trade => {
      // Check for multiple possible P&L field names
      const pnl = trade.netPL || trade.originalPnL || trade.pnl || trade.PnL;
      const hasValidData = trade.date && 
                          typeof pnl !== 'undefined' && 
                          pnl !== null &&
                          !isNaN(parseFloat(pnl));
      return hasValidData;
    })
    .sort((a, b) => {
      // Handle both Date objects and date strings
      const dateA = typeof a.date === 'string' ? new Date(a.date) : a.date;
      const dateB = typeof b.date === 'string' ? new Date(b.date) : b.date;
      const dateCompare = dateA.getTime() - dateB.getTime();
      if (dateCompare !== 0) return dateCompare;
      
      // If same date, sort by entry time if available
      if (a.entryTime && b.entryTime) {
        const aTimeMinutes = (a.entryTime.hour || 0) * 60 + (a.entryTime.minute || 0);
        const bTimeMinutes = (b.entryTime.hour || 0) * 60 + (b.entryTime.minute || 0);
        return aTimeMinutes - bTimeMinutes;
      }
      return 0;
    });

  console.log('✅ Trade sequence: Filtered to', sortedTrades.length, 'valid trades');

  // Group trades by date and assign trade numbers
  const dailyTradeMap = new Map();
  const tradesWithSequence = [];

  sortedTrades.forEach(trade => {
    // Handle both Date objects and date strings
    const tradeDate = typeof trade.date === 'string' ? new Date(trade.date) : trade.date;
    const dateStr = tradeDate.toDateString();
    
    if (!dailyTradeMap.has(dateStr)) {
      dailyTradeMap.set(dateStr, 0);
    }
    
    const tradeNumber = dailyTradeMap.get(dateStr) + 1;
    dailyTradeMap.set(dateStr, tradeNumber);

    const tradeWithSequence = {
      ...trade,
      tradeNumber,
      tradeCategory: categorizeTradeSequence(tradeNumber),
      pnl: trade.netPL || trade.originalPnL || trade.pnl || trade.PnL || 0  // Map P&L fields to pnl for consistency
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
  TRADE_SEQUENCE_CATEGORIES.forEach(category => {
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

  // Create data tables for AI
  const sequenceAnalysisTable = sequenceAnalysis.map(entry => ({
    Trade_Category: entry.category,
    Trade_Count: entry.count,
    Total_PnL: Math.round(entry.netPnL),
    Avg_PnL: Math.round(entry.avgPnL),
    Win_Rate: entry.winRate.toFixed(1)
  }));

  console.log('📈 Sequence analysis results:', sequenceAnalysisTable.length, 'categories');
  console.log('📋 Sample sequence data:', sequenceAnalysisTable[0]);

  const individualTradeTable = individualTradeAnalysis.map(entry => ({
    Trade_Number: entry.tradeNumber,
    Trade_Count: entry.count,
    Total_PnL: Math.round(entry.netPnL),
    Avg_PnL: Math.round(entry.avgPnL),
    Win_Rate: entry.winRate.toFixed(1)
  }));

  console.log('🔢 Individual trade analysis:', individualTradeTable.length, 'trade numbers');

  // Overtrading analysis
  const overtradingAnalysis = analyzeOvertradingPatterns(tradesWithSequence);
  
  const overtradingTable = [{
    High_Volume_Days: overtradingAnalysis.highVolumeDays,
    Low_Volume_Days: overtradingAnalysis.lowVolumeDays,
    High_Vol_Avg_PnL: Math.round(overtradingAnalysis.highVolumePerformance),
    Low_Vol_Avg_PnL: Math.round(overtradingAnalysis.lowVolumePerformance),
    Overtrading_Cost: Math.round(overtradingAnalysis.overtradingCost)
  }];

  // Calculate summary statistics
  const totalTrades = tradesWithSequence.length;
  const totalTradingDays = dailyTradeMap.size;
  const avgTradesPerDay = totalTrades / totalTradingDays;
  const maxTradesPerDay = Math.max(...Array.from(dailyTradeMap.values()));
  const totalPnL = tradesWithSequence.reduce((sum, trade) => sum + trade.pnl, 0);
  const overallWinRate = (tradesWithSequence.filter(t => t.pnl > 0).length / totalTrades) * 100;
  const overallAvgPnL = totalPnL / totalTrades;

  // Find best and worst performing sequences
  const bestSequence = sequenceAnalysis.reduce((best, current) => 
    current.winRate > best.winRate ? current : best, sequenceAnalysis[0]);
  const worstSequence = sequenceAnalysis.reduce((worst, current) => 
    current.winRate < worst.winRate ? current : worst, sequenceAnalysis[0]);

  const metadata = {
    totalTrades: totalTrades,
    totalTradingDays: totalTradingDays,
    avgTradesPerDay: parseFloat(avgTradesPerDay.toFixed(1)),
    maxTradesPerDay: maxTradesPerDay,
    totalPnL: totalPnL,
    overallWinRate: parseFloat(overallWinRate.toFixed(1)),
    overallAvgPnL: Math.round(overallAvgPnL),
    bestSequence: bestSequence ? bestSequence.category : 'N/A',
    worstSequence: worstSequence ? worstSequence.category : 'N/A',
    highVolumeDaysPercent: parseFloat(overtradingAnalysis.highVolumePercentage.toFixed(1)),
    analysisType: 'trade_sequence_analysis',
    dataExtractionDate: new Date(),
    recordsProcessed: processedTradingData.length
  };

  return {
    sequenceAnalysisTable: sequenceAnalysisTable,
    individualTradeTable: individualTradeTable,
    overtradingTable: overtradingTable,
    metadata: metadata
  };
}

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
    // Handle both Date objects and date strings
    const tradeDate = typeof trade.date === 'string' ? new Date(trade.date) : trade.date;
    const dateStr = tradeDate.toDateString();
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
 * Create specialized prompt for trade sequence analysis
 * @param {Object} dataTables - Extracted trade sequence data tables
 * @returns {string} - Formatted prompt for AI analysis
 */
function createTradeSequenceAnalysisPrompt(dataTables) {
  const prompt = `As a professional trading analyst, analyze this trade sequence data :

## Trading Data Summary
- Total Trades: ${dataTables.metadata.totalTrades}
- Trading Days: ${dataTables.metadata.totalTradingDays}
- Total P&L: ₹${dataTables.metadata.totalPnL}
- Average Trades per Day: ${dataTables.metadata.avgTradesPerDay}
- Best Sequence: ${dataTables.metadata.bestSequence}
- Worst Sequence: ${dataTables.metadata.worstSequence}

## Performance by Trade Sequence
${dataTables.sequenceAnalysisTable.map(row => 
  `${row.Trade_Category}: ${row.Trade_Count} trades, ₹${row.Total_PnL} total, ₹${row.Avg_PnL} avg, ${row.Win_Rate}% win rate`
).join('\n')}

## Individual Trade Numbers
${dataTables.individualTradeTable.slice(0, 5).map(row => 
  `Trade #${row.Trade_Number}: ${row.Trade_Count} trades, ₹${row.Avg_PnL} avg, ${row.Win_Rate}% win rate`
).join('\n')}

## Overtrading Analysis
- High-volume days (6+ trades): ${dataTables.overtradingTable[0].High_Volume_Days} days, ₹${dataTables.overtradingTable[0].High_Vol_Avg_PnL} avg per trade
- Low-volume days (<6 trades): ${dataTables.overtradingTable[0].Low_Volume_Days} days, ₹${dataTables.overtradingTable[0].Low_Vol_Avg_PnL} avg per trade
- Overtrading cost: ₹${dataTables.overtradingTable[0].Overtrading_Cost} per trade

Provide 3-4 actionable insights focusing on each not more that 15 words:
1. Optimal trade sequence patterns for maximum profitability
2. Performance degradation in later trades of the day
3. First trade vs subsequent trade performance
4. Overtrading patterns and their impact

Make insights personal and specific to this trader's sequence patterns. give output in 10-15 words.`;

  return prompt;
}

/**
 * Estimate token usage for trade sequence analysis data
 * @param {Object} dataTables - Data tables object
 * @returns {number} - Estimated token count
 */
function estimateTokenUsage(dataTables) {
  const basePromptTokens = 250;
  const sequenceTokens = (dataTables.sequenceAnalysisTable?.length || 0) * 35;
  const individualTokens = (dataTables.individualTradeTable?.length || 0) * 25;
  const overtradingTokens = 50;
  
  return basePromptTokens + sequenceTokens + individualTokens + overtradingTokens;
}

// Export the main function
module.exports = {
  generateTradeSequenceAnalysisAIInsights,
  extractTradeSequenceAnalysisTables,
  createTradeSequenceAnalysisPrompt,
  estimateTokenUsage,
  categorizeTradeSequence,
  calculatePerformanceStats,
  analyzeOvertradingPatterns,
  TRADE_SEQUENCE_CATEGORIES
};
