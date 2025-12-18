/**
 * AI-Enhanced Lot Size Analysis (Next.js Version)
 */

const { analyzeLotSizePnL } = require('../../trading-insights/insight-calculators/lot-size-analysis.js');
const { generateAIInsights, createTradingAnalysisPrompt } = require('../utils/ai-utils.js');

async function generateLotSizeAnalysisAIInsights(processedData, options = {}) {
  const startTime = Date.now();
  
  try {
    console.log('📊 Starting AI-enhanced Lot Size analysis...');
    
    const traditionalResult = analyzeLotSizePnL(processedData);
    
    if (!traditionalResult.success) {
      throw new Error(`Traditional analysis failed: ${traditionalResult.error}`);
    }

    const traditionalData = traditionalResult.data;
    console.log('✅ Traditional lot size analysis completed');
    console.log('Traditional data structure:', Object.keys(traditionalData));
    console.log('lotSizeTable exists:', !!traditionalData.lotSizeTable);
    console.log('lotSizeTable type:', Array.isArray(traditionalData.lotSizeTable) ? 'array' : typeof traditionalData.lotSizeTable);

    const aiAnalysisData = {
      analysisType: 'Lot Size Trading Performance',
      totalTrades: traditionalData.summary.totalTrades,
      totalPnL: traditionalData.summary.totalPnL,
      avgPnLPerTrade: traditionalData.summary.totalPnL / traditionalData.summary.totalTrades,
      lotSizePerformance: traditionalData.lotSizeTable.map(lot => ({
        lotSize: lot.sizeCategory,
        totalPnL: lot.totalPnL,
        tradeCount: lot.tradeCount,
        avgPnL: lot.avgPnL,
        profitability: lot.totalPnL > 0 ? 'profitable' : 'loss'
      })),
      traditionalInsights: traditionalData.insights.slice(0, 5),
      traditionalRecommendations: traditionalData.recommendations.slice(0, 3)
    };

    const prompt = createTradingAnalysisPrompt(aiAnalysisData, 'Lot Size Trading Performance') + `

Additional Context:
- Analyze how lot size affects trading performance
- Identify optimal lot sizes for maximum profitability
- Look for risk vs reward patterns across different lot sizes
- Consider position sizing strategy recommendations
- Evaluate if larger positions lead to better or worse performance

Focus on position sizing optimization and risk management insights. give output in 10-15 words only.`;

    const aiResult = await generateAIInsights(prompt, {
      temperature: 0.7,
      maxOutputTokens: 1024,
      ...options.aiConfig
    });

    console.log('AI Lot Size Analysis Result:', aiResult.success ? '✅ Success' : '❌ Failed');

    const combinedResult = {
      success: true,
      analysisType: 'ai_enhanced_lot_size_analysis',
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
    console.error('❌ AI-enhanced lot size analysis failed:', error.message);
    
    return {
      success: false,
      error: error.message,
      analysisType: 'ai_enhanced_lot_size_analysis',
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
  generateLotSizeAnalysisAIInsights
};
