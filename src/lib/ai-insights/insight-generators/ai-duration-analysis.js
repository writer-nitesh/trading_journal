/**
 * AI-Enhanced Duration Analysis (Next.js Version)
 */

const { analyzeDurationOutcomePnL } = require('../../trading-insights/insight-calculators/duration-analysis.js');
const { generateAIInsights, createTradingAnalysisPrompt } = require('../utils/ai-utils.js');

async function generateDurationAnalysisAIInsights(processedData, options = {}) {
  const startTime = Date.now();
  
  try {
    console.log('⏱️  Starting AI-enhanced Duration analysis...');
    
    const traditionalResult = analyzeDurationOutcomePnL(processedData);
    
    if (!traditionalResult.success) {
      throw new Error(`Traditional analysis failed: ${traditionalResult.error}`);
    }

    const traditionalData = traditionalResult.data;
    console.log('✅ Traditional duration analysis completed');
    console.log('Traditional data structure:', Object.keys(traditionalData));
    console.log('durationTable exists:', !!traditionalData.durationTable);
    console.log('durationTable type:', Array.isArray(traditionalData.durationTable) ? 'array' : typeof traditionalData.durationTable);

    const aiAnalysisData = {
      analysisType: 'Trade Duration Performance',
      totalTrades: traditionalData.summary.totalTrades,
      totalPnL: traditionalData.summary.totalPnL,
      overallWinRate: traditionalData.summary.overallWinRate,
      avgHoldingTime: traditionalData.summary.avgHoldingTime || 'Not available',
      durationPerformance: traditionalData.durationTable.map(duration => ({
        duration: duration.duration,
        totalPnL: duration.totalPnL,
        tradeCount: duration.tradeCount,
        avgPnL: duration.avgPnL,
        winRate: duration.winRate,
        profitability: duration.totalPnL > 0 ? 'profitable' : 'loss'
      })),
      traditionalInsights: traditionalData.insights.slice(0, 5),
      traditionalRecommendations: traditionalData.recommendations.slice(0, 3)
    };

    const prompt = createTradingAnalysisPrompt(aiAnalysisData, 'Trade Duration Performance') + `

Additional Context:
- Analyze how your holding duration affects your trading performance
- Identify your optimal holding times for maximum profitability
- Look for patterns in your quick vs long-term trades
- Consider your timing strategy and patience levels
- Evaluate if you're holding trades too long or cutting them too short

Focus on personalized timing optimization and patience-based insights specific to your trading behavior give in 10-15 words insights.`;

    const aiResult = await generateAIInsights(prompt, {
      temperature: 0.7,
      maxOutputTokens: 1024,
      ...options.aiConfig
    });

    console.log('AI Duration Analysis Result:', aiResult.success ? '✅ Success' : '❌ Failed');

    const combinedResult = {
      success: true,
      analysisType: 'ai_enhanced_duration_analysis',
      data: {
        ...traditionalData,
        aiInsights: aiResult,
        metadata: {
          traditionalAnalysis: {
            insights: traditionalData.insights.length,
            recommendations: traditionalData.recommendations.length
          },
          aiAnalysis: {
            success: aiResult.success,
            tokensUsed: aiResult.metadata.tokensUsed,
            cost: aiResult.metadata.cost,
            processingTimeMs: aiResult.metadata.processingTimeMs
          },
          totalProcessingTimeMs: Date.now() - startTime
        }
      }
    };

    return combinedResult;

  } catch (error) {
    console.error('❌ AI-enhanced duration analysis failed:', error.message);
    
    return {
      success: false,
      error: error.message,
      analysisType: 'ai_enhanced_duration_analysis',
      data: {
        aiInsights: {
          success: false,
          error: error.message,
          insights: [],
          recommendations: [],
          riskWarnings: [],
          metadata: {
            tokensUsed: 0,
            cost: 0,
            processingTimeMs: Date.now() - startTime
          }
        }
      }
    };
  }
}

module.exports = {
  generateDurationAnalysisAIInsights
};
