/**
 * AI-Enhanced Day of Week Analysis (Next.js Version)
 * Generates intelligent insights about day-wise trading performance
 */

// Import traditional analysis
const { analyzeDayOfWeekPnL } = require('../../trading-insights/insight-calculators/day-analysis.js');

// Import AI utilities
const { generateAIInsights, createTradingAnalysisPrompt } = require('../utils/ai-utils.js');

/**
 * Generate AI-enhanced day of week analysis
 * @param {Object[]} processedData - Processed trading data
 * @param {Object} options - Configuration options
 * @returns {Object} - Analysis results with AI insights
 */
async function generateDayAnalysisAIInsights(processedData, options = {}) {
  const startTime = Date.now();
  
  try {
    console.log('📅 Starting AI-enhanced Day of Week analysis...');
    
    // First, generate traditional analysis
    const traditionalResult = analyzeDayOfWeekPnL(processedData);
    
    if (!traditionalResult.success) {
      throw new Error(`Traditional analysis failed: ${traditionalResult.error}`);
    }

    const traditionalData = traditionalResult.data;
    console.log('✅ Traditional day analysis completed');

    // Prepare data for AI analysis
    const aiAnalysisData = {
      analysisType: 'Day of Week Trading Performance',
      totalTrades: traditionalData.summary.totalTrades,
      totalPnL: traditionalData.summary.totalPnL,
      avgPnLPerTrade: traditionalData.summary.avgPnLPerTrade,
      tradingDays: traditionalData.summary.tradingDays,
      dateRange: traditionalData.summary.dateRange,
      dayPerformance: traditionalData.dayPnLTable.map(day => ({
        day: day.day,
        totalPnL: day.totalPnL,
        tradeCount: day.tradeCount,
        avgPnL: day.avgPnL,
        profitability: day.totalPnL > 0 ? 'profitable' : 'loss'
      })),
      traditionalInsights: traditionalData.insights.slice(0, 5), // Top 5 traditional insights
      traditionalRecommendations: traditionalData.recommendations.slice(0, 3) // Top 3 recommendations
    };

    // Create AI prompt
    const prompt = createTradingAnalysisPrompt(aiAnalysisData, 'Day of Week Trading Performance') + `

Additional Context:
- Analyze the day-wise performance patterns
- Identify the most and least profitable days
- Look for consistency vs volatility across days
- Consider potential reasons for day-specific performance (market behavior, trader psychology, etc.)
- Provide actionable insights to optimize day-selection strategy

Focus on practical, data-driven insights that can help improve trading performance and give output in 10-15 words only.`;

    console.log('🤖 Generating AI insights for day analysis...');
    
    // Generate AI insights
    const aiResult = await generateAIInsights(prompt, {
      temperature: 0.7,
      maxOutputTokens: 1024,
      ...options.aiConfig
    });

    console.log('AI Day Analysis Result:', aiResult.success ? '✅ Success' : '❌ Failed');
    
    // Combine traditional and AI results
    const combinedResult = {
      success: true,
      analysisType: 'ai_enhanced_day_analysis',
      data: {
        // Traditional analysis data
        ...traditionalData,
        // AI insights
        aiInsights: aiResult,
        // Combined metadata
        metadata: {
          traditionalAnalysis: {
            insights: traditionalData.insights.length,
            recommendations: traditionalData.recommendations.length,
            processingTimeMs: traditionalResult.metadata?.processingTimeMs || 0
          },
          aiAnalysis: {
            success: aiResult.success,
            tokensUsed: aiResult.metadata.tokensUsed,
            cost: aiResult.metadata.cost,
            processingTimeMs: aiResult.metadata.processingTimeMs,
            model: aiResult.metadata.model
          },
          totalProcessingTimeMs: Date.now() - startTime,
          combinedAt: new Date().toISOString()
        }
      }
    };

    console.log(`✅ AI-enhanced day analysis completed in ${Date.now() - startTime}ms`);
    return combinedResult;

  } catch (error) {
    console.error('❌ AI-enhanced day analysis failed:', error.message);
    
    // Fallback to traditional analysis
    try {
      const traditionalResult = analyzeDayOfWeekPnL(processedData);
      if (traditionalResult.success) {
        return {
          success: false,
          error: `AI analysis failed: ${error.message}. Traditional analysis available.`,
          analysisType: 'day_analysis_fallback',
          data: {
            ...traditionalResult.data,
            aiInsights: {
              success: false,
              error: error.message,
              insights: [],
              recommendations: [],
              riskWarnings: [],
              metadata: {
                model: 'gemini-1.5-flash',
                tokensUsed: 0,
                cost: 0,
                processingTimeMs: Date.now() - startTime,
                fallbackUsed: true
              }
            }
          }
        };
      }
    } catch (fallbackError) {
      console.error('❌ Fallback analysis also failed:', fallbackError.message);
    }

    return {
      success: false,
      error: error.message,
      analysisType: 'ai_enhanced_day_analysis',
      data: {
        aiInsights: {
          success: false,
          error: error.message,
          insights: [],
          recommendations: [],
          riskWarnings: [],
          metadata: {
            model: 'gemini-1.5-flash',
            tokensUsed: 0,
            cost: 0,
            processingTimeMs: Date.now() - startTime
          }
        }
      }
    };
  }
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateDayAnalysisAIInsights
  };
} else {
  // Browser environment
  window.AIInsights = window.AIInsights || {};
  window.AIInsights.DayAnalysis = {
    generateDayAnalysisAIInsights
  };
}
