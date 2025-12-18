/**
 * AI-Enhanced Trade Count Analysis for TradioHub
 * =================================
 * Analyzes daily trading frequency patterns and generates AI insights
 * Uses data tables from trade count analysis for AI-powered pattern recognition
 */

// Import AI utilities
const { generateAIInsights, createTradingAnalysisPrompt } = require('../utils/ai-utils.js');

/**
 * Trade count frequency categories
 */
const TRADE_COUNT_CATEGORIES = [
  { min: 1, max: 2, label: 'Low (1-2 trades/day)' },
  { min: 3, max: 5, label: 'Moderate (3-5 trades/day)' },
  { min: 6, max: 10, label: 'High (6-10 trades/day)' },
  { min: 11, max: Infinity, label: 'Very High (>10 trades/day)' }
];

/**
 * Extract trade count analysis data tables from processed trading data
 * @param {Array} processedTradingData - Array of processed trading records
 * @returns {Object} - Extracted data tables
 */
function extractTradeCountAnalysisTables(processedTradingData) {
  if (!processedTradingData || processedTradingData.length === 0) {
    return null;
  }

  // Group trades by date to analyze daily trading patterns
  const tradesByDate = {};
  
  processedTradingData.forEach(trade => {
    if (!trade.date) return;
    
    const dateKey = trade.date;
    if (!tradesByDate[dateKey]) {
      tradesByDate[dateKey] = [];
    }
    tradesByDate[dateKey].push(trade);
  });

  // Analyze trade count performance by frequency
  const tradeCountStats = {};
  let totalPnL = 0;
  let totalTrades = 0;

  Object.entries(tradesByDate).forEach(([date, trades]) => {
    const dayTradeCount = trades.length;
    const dayPnL = trades.reduce((sum, trade) => sum + (trade.netPL || 0), 0);
    
    totalPnL += dayPnL;
    totalTrades += dayTradeCount;

    if (!tradeCountStats[dayTradeCount]) {
      tradeCountStats[dayTradeCount] = {
        tradeCount: dayTradeCount,
        dayCount: 0,
        totalPnL: 0,
        profitableDays: 0,
        lossDays: 0,
        breakEvenDays: 0
      };
    }

    const stats = tradeCountStats[dayTradeCount];
    stats.dayCount++;
    stats.totalPnL += dayPnL;
    
    if (dayPnL > 0) {
      stats.profitableDays++;
    } else if (dayPnL < 0) {
      stats.lossDays++;
    } else {
      stats.breakEvenDays++;
    }
  });

  // Create trade count frequency table
  const tradeCountFrequencyTable = Object.values(tradeCountStats)
    .sort((a, b) => a.tradeCount - b.tradeCount)
    .map(stat => ({
      tradeCount: stat.tradeCount,
      dayCount: stat.dayCount,
      frequency: ((stat.dayCount / Object.keys(tradesByDate).length) * 100).toFixed(1)
    }));

  // Create trade count PnL table
  const tradeCountPnLTable = Object.values(tradeCountStats)
    .sort((a, b) => a.tradeCount - b.tradeCount)
    .map(stat => ({
      tradeCount: stat.tradeCount,
      totalPnL: stat.totalPnL,
      avgPnLPerDay: stat.dayCount > 0 ? (stat.totalPnL / stat.dayCount).toFixed(2) : 0,
      profitableDays: stat.profitableDays,
      lossDays: stat.lossDays
    }));

  // Create trade count efficiency table
  const tradeCountEfficiencyTable = Object.values(tradeCountStats)
    .sort((a, b) => a.tradeCount - b.tradeCount)
    .map(stat => ({
      tradeCount: stat.tradeCount,
      profitabilityRate: stat.dayCount > 0 ? ((stat.profitableDays / stat.dayCount) * 100).toFixed(1) : 0,
      avgPnLPerTrade: stat.tradeCount > 0 && stat.dayCount > 0 ? 
        (stat.totalPnL / (stat.tradeCount * stat.dayCount)).toFixed(2) : 0,
      riskRewardRatio: calculateRiskRewardRatio(stat)
    }));

  // Create comprehensive analysis table
  const tradeCountAnalysisTable = Object.values(tradeCountStats)
    .sort((a, b) => a.tradeCount - b.tradeCount)
    .map(stat => {
      const category = TRADE_COUNT_CATEGORIES.find(cat => 
        stat.tradeCount >= cat.min && stat.tradeCount <= cat.max
      );
      
      return {
        tradeCount: stat.tradeCount,
        category: category ? category.label : 'Unknown',
        dayCount: stat.dayCount,
        totalPnL: stat.totalPnL,
        avgPnLPerDay: stat.dayCount > 0 ? (stat.totalPnL / stat.dayCount).toFixed(2) : 0,
        profitableDays: stat.profitableDays,
        profitabilityRate: stat.dayCount > 0 ? ((stat.profitableDays / stat.dayCount) * 100).toFixed(1) : 0,
        avgPnLPerTrade: stat.tradeCount > 0 && stat.dayCount > 0 ? 
          (stat.totalPnL / (stat.tradeCount * stat.dayCount)).toFixed(2) : 0
      };
    });

  const metadata = {
    totalTrades,
    totalTradingDays: Object.keys(tradesByDate).length,
    totalPnL,
    avgTradesPerDay: totalTrades > 0 ? (totalTrades / Object.keys(tradesByDate).length).toFixed(2) : 0,
    dataExtractionDate: new Date(),
    recordsProcessed: processedTradingData.length
  };

  return {
    tradeCountFrequencyTable,
    tradeCountPnLTable,
    tradeCountEfficiencyTable,
    tradeCountAnalysisTable,
    metadata
  };
}

/**
 * Calculate risk-reward ratio for trade count statistics
 * @param {Object} stat - Trade count statistics
 * @returns {string} - Risk-reward ratio
 */
function calculateRiskRewardRatio(stat) {
  if (stat.lossDays === 0) return 'No losses recorded';
  if (stat.profitableDays === 0) return 'No profits recorded';
  
  const avgProfit = stat.totalPnL > 0 ? stat.totalPnL / stat.profitableDays : 0;
  const avgLoss = Math.abs(stat.totalPnL < 0 ? stat.totalPnL / stat.lossDays : 0);
  
  if (avgLoss === 0) return 'No losses';
  
  const ratio = (avgProfit / avgLoss).toFixed(2);
  return `1:${ratio}`;
}

/**
 * Create specialized prompt for trade count analysis
 * @param {Object} dataTables - Extracted trade count data tables
 * @returns {string} - Formatted prompt for AI analysis
 */
function createTradeCountAnalysisPrompt(dataTables) {
  const prompt = `As a professional trading analyst, analyze this trade count data and provide insights:

## Trading Data Summary
- Total Trades: ${dataTables.metadata.totalTrades}
- Trading Days: ${dataTables.metadata.totalTradingDays}
- Total P&L: ₹${dataTables.metadata.totalPnL}
- Average Trades per Day: ${dataTables.metadata.avgTradesPerDay}

## Trade Count Analysis Data
${dataTables.tradeCountAnalysisTable.map(row => 
  `${row.tradeCount} trades/day: ${row.dayCount} days, ₹${row.totalPnL} P&L, ${row.profitabilityRate}% profitable`
).join('\n')}

## Trade Count Frequency
${dataTables.tradeCountFrequencyTable.map(row => 
  `${row.tradeCount} trades: ${row.frequency}% of trading days`
).join('\n')}

Provide 3-4 actionable insights focusing on:
1. Optimal trade frequency for maximum profitability
2. Overtrading vs undertrading patterns
3. Quality vs quantity trade-offs
4. Risk management based on trading frequency

Make insights personal and specific to this trader's patterns. give output in 10-15 words.`;

  return prompt;
}

/**
 * Estimate token usage for trade count analysis data
 * @param {Object} dataTables - Data tables object
 * @returns {number} - Estimated token count
 */
function estimateTokenUsage(dataTables) {
  const basePromptTokens = 200;
  const tableTokens = (dataTables.tradeCountAnalysisTable?.length || 0) * 30;
  const frequencyTokens = (dataTables.tradeCountFrequencyTable?.length || 0) * 15;
  
  return basePromptTokens + tableTokens + frequencyTokens;
}

/**
 * Main function to generate AI-enhanced trade count analysis
 * @param {Object[]} processedTradingData - Array of processed trading records
 * @param {Object} options - Configuration options
 * @returns {Object} - AI-enhanced analysis results
 */
async function generateTradeCountAnalysisAIInsights(processedTradingData, options = {}) {
  const startTime = Date.now();
  
  try {
    console.log('🔢 Starting AI-enhanced Trade Count analysis...');
    
    // Extract data tables using the same logic as the updated ai-insights
    const dataTables = extractTradeCountAnalysisTables(processedTradingData);
    
    if (!dataTables || !dataTables.tradeCountAnalysisTable || dataTables.tradeCountAnalysisTable.length === 0) {
      return {
        success: false,
        error: 'No trade count data could be extracted from trading records',
        analysisType: 'trade_count_analysis',
        data: null,
        metadata: {
          aiEnhanced: false,
          aiProcessingDate: new Date(),
          errorOccurred: true
        }
      };
    }

    console.log('✅ Trade count data extraction completed');
    console.log('Trade count categories found:', dataTables.tradeCountAnalysisTable.length);

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
      const prompt = createTradeCountAnalysisPrompt(dataTables);
      
      console.log('🤖 Sending prompt to Gemini AI...');
      console.log('📝 Prompt length:', prompt.length, 'characters');

      const aiResponse = await generateAIInsights(prompt, {
        analysisType: 'trade_count_analysis',
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

    console.log('AI Trade Count Analysis Result:', aiInsights.success ? '✅ Success' : '❌ Failed');

    return {
      success: true,
      analysisType: 'trade_count_analysis',
      data: {
        // Include all extracted data tables for backward compatibility
        tradeCountTable: dataTables.tradeCountAnalysisTable,
        summary: {
          totalTrades: dataTables.metadata.totalTrades,
          totalTradingDays: dataTables.metadata.totalTradingDays,
          totalPnL: dataTables.metadata.totalPnL,
          avgTradesPerDay: dataTables.metadata.avgTradesPerDay
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
    console.error('💥 Trade Count analysis threw exception:', error.message);
    return {
      success: false,
      error: error.message,
      analysisType: 'trade_count_analysis',
      data: null,
      metadata: {
        aiEnhanced: false,
        aiProcessingDate: new Date(),
        errorOccurred: true
      }
    };
  }
}

module.exports = {
  generateTradeCountAnalysisAIInsights
};
