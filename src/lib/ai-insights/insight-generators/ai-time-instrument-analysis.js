/**
 * AI-Enhanced Time-Instrument Analysis for TradioHub
 * ==================================================
 * Analyzes trading performance by time of day and instrument patterns
 * Uses traditional time-instrument analysis enhanced with AI insights
 */

// Import traditional analysis
const { analyzeTimeInstrumentPnL } = require('../../trading-insights/insight-calculators/time-instrument-analysis.js');

// Import AI utilities  
const { generateAIInsights, createTradingAnalysisPrompt } = require('../utils/ai-utils.js');

/**
 * Main function to generate AI-enhanced time-instrument analysis
 * @param {Object[]} processedTradingData - Array of processed trading records
 * @param {Object} options - Configuration options
 * @returns {Object} - AI-enhanced analysis results
 */
async function generateTimeInstrumentAnalysisAIInsights(processedTradingData, options = {}) {
  const startTime = Date.now();
  
  try {
    console.log('🕐 Starting AI-enhanced Time-Instrument analysis...');
    
    const traditionalResult = analyzeTimeInstrumentPnL(processedTradingData);
    
    if (!traditionalResult.success) {
      return {
        success: false,
        error: `Traditional analysis failed: ${traditionalResult.error}`,
        analysisType: 'time_instrument_analysis',
        data: null,
        metadata: {
          aiEnhanced: false,
          processingTime: Date.now() - startTime,
          errorOccurred: true
        }
      };
    }

    console.log('✅ Traditional time-instrument analysis completed');
    console.log('Traditional data structure:', Object.keys(traditionalResult.data));
    console.log('timeInstrumentMatrix exists:', !!traditionalResult.data.timeInstrumentMatrix);
    console.log('timeInstrumentMatrix type:', Array.isArray(traditionalResult.data.timeInstrumentMatrix) ? 'array' : typeof traditionalResult.data.timeInstrumentMatrix);
    console.log('timeInstrumentMatrix sample:', traditionalResult.data.timeInstrumentMatrix ? traditionalResult.data.timeInstrumentMatrix.slice(0, 2) : 'null');

    // Generate AI insights using the traditional analysis data
    const aiPrompt = createTimeInstrumentAnalysisPrompt(traditionalResult.data);
    
    console.log('🤖 Sending prompt to Gemini AI...');
    console.log('📝 Prompt length:', aiPrompt.length, 'characters');

    const aiResponse = await generateAIInsights(aiPrompt, {
      analysisType: 'time_instrument_analysis',
      model: options.model || "gemini-1.5-flash",
      maxTokens: options.maxTokens || 200,
      temperature: options.temperature || 0.2,
      provider: options.provider || "google"
    });

    console.log('AI Time-Instrument Analysis Result:', aiResponse.success ? '✅ Success' : '❌ Failed');

    return {
      success: true,
      analysisType: 'time_instrument_analysis',
      data: {
        // Include all traditional analysis data
        ...traditionalResult.data,
        // Add AI insights
        aiInsights: aiResponse,
        metadata: {
          traditionalAnalysisSuccess: traditionalResult.success,
          aiAnalysisSuccess: aiResponse.success,
          processingTime: Date.now() - startTime,
          dataTablesGenerated: Object.keys(traditionalResult.data).filter(key => key !== 'metadata').length,
          aiInsightsGenerated: aiResponse.success
        }
      },
      metadata: {
        processedTrades: processedTradingData.length,
        aiEnhanced: aiResponse.success,
        aiProcessingDate: new Date(),
        traditionalAnalysisIncluded: true
      }
    };

  } catch (error) {
    console.error('💥 Time-Instrument analysis threw exception:', error.message);
    return {
      success: false,
      error: error.message,
      analysisType: 'time_instrument_analysis',
      data: null,
      metadata: {
        aiEnhanced: false,
        processingTime: Date.now() - startTime,
        errorOccurred: true
      }
    };
  }
}

/**
 * Create AI prompt with time-instrument analysis data tables
 * @param {Object} traditionalData - Traditional analysis data from trading-insights
 * @returns {string} - AI prompt
 */
function createTimeInstrumentAnalysisPrompt(traditionalData) {
  const { timeInstrumentMatrix, timeSlotAnalysis, instrumentAnalysis, summary } = traditionalData;
  
  return `Time-Instrument Analysis:

Best Combinations:
${timeInstrumentMatrix.slice(0, 3).map(row => 
  `${row.timeSlot} × ${row.instrument}: ₹${row.totalPnL} (${row.tradeCount} trades, ${row.winRate}% win rate)`
).join(', ')}

Time Slot Performance:
${timeSlotAnalysis.map(row => 
  `${row.timeSlot}: ₹${row.totalPnL} total, ${row.tradeCount} trades, ${row.winRate}% win rate`
).join(', ')}

Instrument Performance:
${instrumentAnalysis.map(row => 
  `${row.instrument}: ₹${row.totalPnL} total, ${row.tradeCount} trades, ${row.winRate}% win rate`
).join(', ')}

Summary: ${summary.totalTrades} trades across ${summary.activeCombinations}/${summary.totalPossibleCombinations} time-instrument combinations. Overall: ₹${summary.totalPnL} P&L, ${summary.overallWinRate}% win rate

Give insights in format: "Pattern → Explanation with numbers." Provide concise insights.give Output in 10-15 words only.`;
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateTimeInstrumentAnalysisAIInsights
  };
} else {
  // Browser environment
  window.AIInsights = window.AIInsights || {};
  window.AIInsights.TimeInstrumentAnalysis = {
    generateTimeInstrumentAnalysisAIInsights
  };
}
