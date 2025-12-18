/**
 * AI-Enhanced Trading Insights - Main Module (Next.js Version)
 * Orchestrates all AI-powered trading analysis modules for TradioHub
 */

// Import existing trading insights data processor
const { processRawTradingData, validateTradingData } = require('../trading-insights/utils/data-processor.js');

// Import AI-powered insight generators
const { generateDayAnalysisAIInsights } = require('./insight-generators/ai-day-analysis.js');
const { generateLotSizeAnalysisAIInsights } = require('./insight-generators/ai-lot-size-analysis.js');
const { generateTradeCountAnalysisAIInsights } = require('./insight-generators/ai-trade-count-analysis.js');
const { generateDurationAnalysisAIInsights } = require('./insight-generators/ai-duration-analysis.js');
const { generateTimeInstrumentAnalysisAIInsights } = require('./insight-generators/ai-time-instrument-analysis.js');
const { generateTradeSequenceAnalysisAIInsights } = require('./insight-generators/ai-trade-sequence-analysis.js');
const { generateDirectionAnalysisAIInsights } = require('./insight-generators/ai-direction-analysis.js');

// Import utilities
const { validateAIConfig, calculateCost } = require('./utils/ai-utils.js');

/**
 * Main function to generate AI-enhanced trading insights
 * @param {Object[]} rawTradingData - Raw trading data from user
 * @param {Object} options - Configuration options
 * @returns {Object} - Complete AI-enhanced analysis results
 */
async function generateAITradingInsights(rawTradingData, options = {}) {
  const startTime = Date.now();
  
  try {
    console.log('🔍 Validating trading data...');
    const validation = validateTradingData(rawTradingData);
    
    if (!validation.isValid) {
      throw new Error(`Data validation failed: ${validation.errors.join(', ')}`);
    }
    
    if (validation.warnings.length > 0) {
      console.warn('⚠️  Data validation warnings:', validation.warnings);
    }

    // Process raw data into standardized format
    console.log('⚙️  Processing trading data...');
    const processedData = processRawTradingData(rawTradingData);
    
    if (processedData.length === 0) {
      throw new Error('No valid trades found after processing');
    }

    // Validate AI configuration
    const aiValidation = validateAIConfig(options);
    if (!aiValidation.isValid) {
      console.warn('AI configuration issues:', aiValidation.errors);
      // Continue with defaults
    }

    // Initialize results object
    const results = {
      success: true,
      analysisType: 'ai_enhanced_trading_insights',
      insights: {},
      errors: [],
      metadata: {
        totalTrades: processedData.length,
        originalDataCount: rawTradingData.length,
        analysisDate: new Date(),
        processingTimeMs: 0,
        completedInsights: [],
        failedInsights: [],
        totalAICost: 0,
        totalTokensUsed: 0
      }
    };

    // Generate Day of Week Analysis
    try {
      console.log('📅 Running AI-enhanced Day of Week analysis...');
      const dayAnalysisResult = await generateDayAnalysisAIInsights(processedData, options);
      
      if (dayAnalysisResult.success) {
        results.insights.dayOfWeekAnalysis = dayAnalysisResult;
        results.metadata.completedInsights.push('Day of Week Analysis (AI)');
        
        // Track AI usage
        if (dayAnalysisResult.data.aiInsights.metadata) {
          const aiMeta = dayAnalysisResult.data.aiInsights.metadata;
          results.metadata.totalTokensUsed += aiMeta.tokensUsed || 0;
          results.metadata.totalAICost += aiMeta.cost || 0;
        }
        
        console.log('✅ Day of Week analysis completed successfully');
      } else {
        results.errors.push(`Day Analysis Error: ${dayAnalysisResult.error}`);
        results.metadata.failedInsights.push('Day of Week Analysis (AI)');
        console.log('❌ Day of Week analysis failed');
      }
    } catch (error) {
      results.errors.push(`Day Analysis Exception: ${error.message}`);
      results.metadata.failedInsights.push('Day of Week Analysis (AI)');
      console.log('💥 Day of Week analysis threw exception:', error.message);
    }

    // Generate Lot Size Analysis
    try {
      console.log('📊 Running AI-enhanced Lot Size analysis...');
      const lotSizeAnalysisResult = await generateLotSizeAnalysisAIInsights(processedData, options);
      
      if (lotSizeAnalysisResult.success) {
        results.insights.lotSizeAnalysis = lotSizeAnalysisResult;
        results.metadata.completedInsights.push('Lot Size Analysis (AI)');
        
        // Track AI usage
        if (lotSizeAnalysisResult.data.aiInsights.metadata) {
          const aiMeta = lotSizeAnalysisResult.data.aiInsights.metadata;
          results.metadata.totalTokensUsed += aiMeta.tokensUsed || 0;
          results.metadata.totalAICost += aiMeta.cost || 0;
        }
        
        console.log('✅ Lot Size analysis completed successfully');
      } else {
        results.errors.push(`Lot Size Analysis Error: ${lotSizeAnalysisResult.error}`);
        results.metadata.failedInsights.push('Lot Size Analysis (AI)');
        console.log('❌ Lot Size analysis failed');
      }
    } catch (error) {
      results.errors.push(`Lot Size Analysis Exception: ${error.message}`);
      results.metadata.failedInsights.push('Lot Size Analysis (AI)');
      console.log('💥 Lot Size analysis threw exception:', error.message);
    }

    // Generate Trade Count Analysis
    try {
      console.log('🔢 Running AI-enhanced Trade Count analysis...');
      const tradeCountAnalysisResult = await generateTradeCountAnalysisAIInsights(processedData, options);
      
      if (tradeCountAnalysisResult.success) {
        results.insights.tradeCountAnalysis = tradeCountAnalysisResult;
        results.metadata.completedInsights.push('Trade Count Analysis (AI)');
        
        // Track AI usage
        if (tradeCountAnalysisResult.data.aiInsights.metadata) {
          const aiMeta = tradeCountAnalysisResult.data.aiInsights.metadata;
          results.metadata.totalTokensUsed += aiMeta.tokensUsed || 0;
          results.metadata.totalAICost += aiMeta.cost || 0;
        }
        
        console.log('✅ Trade Count analysis completed successfully');
      } else {
        results.errors.push(`Trade Count Analysis Error: ${tradeCountAnalysisResult.error}`);
        results.metadata.failedInsights.push('Trade Count Analysis (AI)');
        console.log('❌ Trade Count analysis failed');
      }
    } catch (error) {
      results.errors.push(`Trade Count Analysis Exception: ${error.message}`);
      results.metadata.failedInsights.push('Trade Count Analysis (AI)');
      console.log('💥 Trade Count analysis threw exception:', error.message);
    }

    // Generate Duration Analysis
    try {
      console.log('⏱️  Running AI-enhanced Duration analysis...');
      const durationAnalysisResult = await generateDurationAnalysisAIInsights(processedData, options);
      
      if (durationAnalysisResult.success) {
        results.insights.durationAnalysis = durationAnalysisResult;
        results.metadata.completedInsights.push('Duration Analysis (AI)');
        
        // Track AI usage
        if (durationAnalysisResult.data.aiInsights.metadata) {
          const aiMeta = durationAnalysisResult.data.aiInsights.metadata;
          results.metadata.totalTokensUsed += aiMeta.tokensUsed || 0;
          results.metadata.totalAICost += aiMeta.cost || 0;
        }
        
        console.log('✅ Duration analysis completed successfully');
      } else {
        results.errors.push(`Duration Analysis Error: ${durationAnalysisResult.error}`);
        results.metadata.failedInsights.push('Duration Analysis (AI)');
        console.log('❌ Duration analysis failed');
      }
    } catch (error) {
      results.errors.push(`Duration Analysis Exception: ${error.message}`);
      results.metadata.failedInsights.push('Duration Analysis (AI)');
      console.log('💥 Duration analysis threw exception:', error.message);
    }

    // Generate Time-Instrument Analysis
    try {
      console.log('🕐 Running AI-enhanced Time-Instrument analysis...');
      const timeInstrumentAnalysisResult = await generateTimeInstrumentAnalysisAIInsights(processedData, options);
      
      if (timeInstrumentAnalysisResult.success) {
        results.insights.timeInstrumentAnalysis = timeInstrumentAnalysisResult;
        results.metadata.completedInsights.push('Time-Instrument Analysis (AI)');
        
        // Track AI usage
        if (timeInstrumentAnalysisResult.data.aiInsights.metadata) {
          const aiMeta = timeInstrumentAnalysisResult.data.aiInsights.metadata;
          results.metadata.totalTokensUsed += aiMeta.tokensUsed || 0;
          results.metadata.totalAICost += aiMeta.cost || 0;
        }
        
        console.log('✅ Time-Instrument analysis completed successfully');
      } else {
        results.errors.push(`Time-Instrument Analysis Error: ${timeInstrumentAnalysisResult.error}`);
        results.metadata.failedInsights.push('Time-Instrument Analysis (AI)');
        console.log('❌ Time-Instrument analysis failed');
      }
    } catch (error) {
      results.errors.push(`Time-Instrument Analysis Exception: ${error.message}`);
      results.metadata.failedInsights.push('Time-Instrument Analysis (AI)');
      console.log('💥 Time-Instrument analysis threw exception:', error.message);
    }

    // Generate Trade Sequence Analysis
    try {
      console.log('🔄 Running AI-enhanced Trade Sequence analysis...');
      const tradeSequenceAnalysisResult = await generateTradeSequenceAnalysisAIInsights(processedData, options);
      
      if (tradeSequenceAnalysisResult.success) {
        results.insights.tradeSequenceAnalysis = tradeSequenceAnalysisResult;
        results.metadata.completedInsights.push('Trade Sequence Analysis (AI)');
        
        // Track AI usage
        if (tradeSequenceAnalysisResult.data.aiInsights.metadata) {
          const aiMeta = tradeSequenceAnalysisResult.data.aiInsights.metadata;
          results.metadata.totalTokensUsed += aiMeta.tokensUsed || 0;
          results.metadata.totalAICost += aiMeta.cost || 0;
        }
        
        console.log('✅ Trade Sequence analysis completed successfully');
      } else {
        results.errors.push(`Trade Sequence Analysis Error: ${tradeSequenceAnalysisResult.error}`);
        results.metadata.failedInsights.push('Trade Sequence Analysis (AI)');
        console.log('❌ Trade Sequence analysis failed');
      }
    } catch (error) {
      results.errors.push(`Trade Sequence Analysis Exception: ${error.message}`);
      results.metadata.failedInsights.push('Trade Sequence Analysis (AI)');
      console.log('💥 Trade Sequence analysis threw exception:', error.message);
    }

    // 7. Direction Analysis (AI-Enhanced)
    try {
      console.log('📈 Running AI-enhanced Direction analysis...');
      const directionAnalysisResult = await generateDirectionAnalysisAIInsights(processedData, options);
      
      if (directionAnalysisResult.success) {
        results.insights.directionAnalysis = directionAnalysisResult;
        results.metadata.completedInsights.push('Direction Analysis (AI)');
        
        // Track AI usage
        if (directionAnalysisResult.data.aiInsights.metadata) {
          const aiMeta = directionAnalysisResult.data.aiInsights.metadata;
          results.metadata.totalTokensUsed += aiMeta.tokensUsed || 0;
          results.metadata.totalAICost += aiMeta.cost || 0;
        }
        
        console.log('✅ Direction analysis completed successfully');
      } else {
        results.errors.push(`Direction Analysis Error: ${directionAnalysisResult.error}`);
        results.metadata.failedInsights.push('Direction Analysis (AI)');
        console.log('❌ Direction analysis failed');
      }
    } catch (error) {
      results.errors.push(`Direction Analysis Exception: ${error.message}`);
      results.metadata.failedInsights.push('Direction Analysis (AI)');
      console.log('💥 Direction analysis threw exception:', error.message);
    }

    // Generate consolidated AI insights
    const consolidatedInsights = generateConsolidatedAIInsights(results);
    results.consolidatedInsights = consolidatedInsights;

    // Calculate final metadata
    results.metadata.processingTimeMs = Date.now() - startTime;
    // Consider it successful if at least one analysis succeeded
    results.success = results.metadata.completedInsights.length > 0;

    console.log(`🎉 AI-enhanced analysis completed in ${results.metadata.processingTimeMs}ms`);
    console.log(`💰 Total AI cost: $${results.metadata.totalAICost.toFixed(6)}`);
    console.log(`🔢 Total tokens used: ${results.metadata.totalTokensUsed}`);
    console.log(`✅ Completed insights: ${results.metadata.completedInsights.join(', ')}`);

    if (results.errors.length > 0) {
      console.log(`⚠️  ${results.errors.length} analysis(es) failed:`, results.errors);
    }

    return results;

  } catch (error) {
    return {
      success: false,
      error: error.message,
      analysisType: 'ai_enhanced_trading_insights',
      insights: {},
      metadata: {
        totalTrades: 0,
        originalDataCount: Array.isArray(rawTradingData) ? rawTradingData.length : 0,
        analysisDate: new Date(),
        processingTimeMs: Date.now() - startTime,
        errorOccurred: true
      }
    };
  }
}

/**
 * Generate consolidated insights from all AI analyses
 * @param {Object} results - Results from all AI analyses
 * @returns {Object} - Consolidated AI insights
 */
function generateConsolidatedAIInsights(results) {
  const consolidated = {
    overallSummary: '',
    keyFindings: [],
    priorityRecommendations: [],
    criticalRiskWarnings: [],
    confidenceScore: 0,
    aiMetadata: {
      insightsGenerated: results.metadata.completedInsights.length,
      totalCost: results.metadata.totalAICost,
      totalTokens: results.metadata.totalTokensUsed,
      consolidatedAt: new Date().toISOString()
    }
  };

  try {
    // Extract insights from Day of Week Analysis
    if (results.insights.dayOfWeekAnalysis?.data?.aiInsights?.success) {
      const dayAI = results.insights.dayOfWeekAnalysis.data.aiInsights;
      
      consolidated.keyFindings.push(...(dayAI.insights || []).map(insight => ({
        source: 'Day Analysis',
        insight: insight,
        confidence: dayAI.confidence || 'medium'
      })));
      
      consolidated.priorityRecommendations.push(...(dayAI.recommendations || []).map(rec => ({
        source: 'Day Analysis',
        recommendation: rec,
        priority: 'Medium'
      })));
      
      consolidated.criticalRiskWarnings.push(...(dayAI.riskWarnings || []).map(warning => ({
        source: 'Day Analysis',
        warning: warning,
        severity: 'Medium'
      })));
    }

    // Extract insights from Lot Size Analysis
    if (results.insights.lotSizeAnalysis?.data?.aiInsights?.success) {
      const lotSizeAI = results.insights.lotSizeAnalysis.data.aiInsights;
      
      consolidated.keyFindings.push(...(lotSizeAI.insights || []).map(insight => ({
        source: 'Lot Size Analysis',
        insight: insight,
        confidence: lotSizeAI.confidence || 'medium'
      })));
      
      consolidated.priorityRecommendations.push(...(lotSizeAI.recommendations || []).map(rec => ({
        source: 'Lot Size Analysis',
        recommendation: rec,
        priority: 'High'
      })));
      
      consolidated.criticalRiskWarnings.push(...(lotSizeAI.riskWarnings || []).map(warning => ({
        source: 'Lot Size Analysis',
        warning: warning,
        severity: 'High'
      })));
    }

    // Extract insights from Trade Count Analysis
    if (results.insights.tradeCountAnalysis?.data?.aiInsights?.success) {
      const tradeCountAI = results.insights.tradeCountAnalysis.data.aiInsights;
      
      consolidated.keyFindings.push(...(tradeCountAI.insights || []).map(insight => ({
        source: 'Trade Count Analysis',
        insight: insight,
        confidence: tradeCountAI.confidence || 'medium'
      })));
      
      consolidated.priorityRecommendations.push(...(tradeCountAI.recommendations || []).map(rec => ({
        source: 'Trade Count Analysis',
        recommendation: rec,
        priority: 'Medium'
      })));
      
      consolidated.criticalRiskWarnings.push(...(tradeCountAI.riskWarnings || []).map(warning => ({
        source: 'Trade Count Analysis',
        warning: warning,
        severity: 'Medium'
      })));
    }

    // Extract insights from Duration Analysis
    if (results.insights.durationAnalysis?.data?.aiInsights?.success) {
      const durationAI = results.insights.durationAnalysis.data.aiInsights;
      
      consolidated.keyFindings.push(...(durationAI.insights || []).map(insight => ({
        source: 'Duration Analysis',
        insight: insight,
        confidence: durationAI.confidence || 'medium'
      })));
      
      consolidated.priorityRecommendations.push(...(durationAI.recommendations || []).map(rec => ({
        source: 'Duration Analysis',
        recommendation: rec,
        priority: 'Medium'
      })));
      
      consolidated.criticalRiskWarnings.push(...(durationAI.riskWarnings || []).map(warning => ({
        source: 'Duration Analysis',
        warning: warning,
        severity: 'Medium'
      })));
    }

    // Extract insights from Time-Instrument Analysis
    if (results.insights.timeInstrumentAnalysis?.data?.aiInsights?.success) {
      const timeInstrumentAI = results.insights.timeInstrumentAnalysis.data.aiInsights;
      
      consolidated.keyFindings.push(...(timeInstrumentAI.insights || []).map(insight => ({
        source: 'Time-Instrument Analysis',
        insight: insight,
        confidence: timeInstrumentAI.confidence || 'medium'
      })));
      
      consolidated.priorityRecommendations.push(...(timeInstrumentAI.recommendations || []).map(rec => ({
        source: 'Time-Instrument Analysis',
        recommendation: rec,
        priority: 'High'
      })));
      
      consolidated.criticalRiskWarnings.push(...(timeInstrumentAI.riskWarnings || []).map(warning => ({
        source: 'Time-Instrument Analysis',
        warning: warning,
        severity: 'Medium'
      })));
    }

    // Extract insights from Trade Sequence Analysis
    if (results.insights.tradeSequenceAnalysis?.data?.aiInsights?.success) {
      const tradeSequenceAI = results.insights.tradeSequenceAnalysis.data.aiInsights;
      
      consolidated.keyFindings.push(...(tradeSequenceAI.insights || []).map(insight => ({
        source: 'Trade Sequence Analysis',
        insight: insight,
        confidence: tradeSequenceAI.confidence || 'medium'
      })));
      
      consolidated.priorityRecommendations.push(...(tradeSequenceAI.recommendations || []).map(rec => ({
        source: 'Trade Sequence Analysis',
        recommendation: rec,
        priority: 'Medium'
      })));
      
      consolidated.criticalRiskWarnings.push(...(tradeSequenceAI.riskWarnings || []).map(warning => ({
        source: 'Trade Sequence Analysis',
        warning: warning,
        severity: 'Medium'
      })));
    }

    // Extract insights from Direction Analysis
    if (results.insights.directionAnalysis?.data?.aiInsights?.success) {
      const directionAI = results.insights.directionAnalysis.data.aiInsights;
      
      consolidated.keyFindings.push(...(directionAI.insights || []).map(insight => ({
        source: 'Direction Analysis',
        insight: insight,
        confidence: directionAI.confidence || 'medium'
      })));
      
      consolidated.priorityRecommendations.push(...(directionAI.recommendations || []).map(rec => ({
        source: 'Direction Analysis',
        recommendation: rec,
        priority: 'High'
      })));
      
      consolidated.criticalRiskWarnings.push(...(directionAI.riskWarnings || []).map(warning => ({
        source: 'Direction Analysis',
        warning: warning,
        severity: 'Medium'
      })));
    }

    // Generate overall summary
    const totalInsights = consolidated.keyFindings.length;
    const totalRecommendations = consolidated.priorityRecommendations.length;
    const totalWarnings = consolidated.criticalRiskWarnings.length;

    consolidated.overallSummary = `AI analysis generated ${totalInsights} key insights, ` +
      `${totalRecommendations} recommendations, and ${totalWarnings} risk warnings ` +
      `from ${results.metadata.totalTrades} trades using ${results.metadata.totalTokensUsed} tokens ` +
      `(cost: $${results.metadata.totalAICost.toFixed(6)}).`;

    // Calculate confidence score
    consolidated.confidenceScore = calculateConfidenceScore(results);

  } catch (error) {
    console.error('Error generating consolidated insights:', error);
    consolidated.overallSummary = `Error generating consolidated insights: ${error.message}`;
    consolidated.keyFindings = [];
    consolidated.priorityRecommendations = [];
    consolidated.criticalRiskWarnings = [];
  }

  return consolidated;
}

/**
 * Calculate confidence score for AI insights
 * @param {Object} results - Analysis results
 * @returns {number} - Confidence score (0-100)
 */
function calculateConfidenceScore(results) {
  let score = 50; // Base score
  
  // Add points for data quality
  if (results.metadata.totalTrades >= 50) score += 20;
  else if (results.metadata.totalTrades >= 20) score += 15;
  else if (results.metadata.totalTrades >= 10) score += 10;
  else score -= 20; // Penalty for low data
  
  // Add points for successful AI analyses
  const totalAnalyses = results.metadata.completedInsights.length + results.metadata.failedInsights.length;
  if (totalAnalyses > 0) {
    const successRate = results.metadata.completedInsights.length / totalAnalyses;
    score += successRate * 20;
  }
  
  // Penalty for processing errors
  score -= results.errors.length * 5;
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Generate concise summaries for frontend display
 * @param {Object} results - AI analysis results
 * @returns {Object} - Concise summaries for each analysis
 */
/**
 * Clean insight text to remove JSON fragments, formatting issues, and limit length
 */
function cleanInsightText(text) {
  if (!text || typeof text !== 'string') return '';
  
  return text
    // Remove JSON fragments
    .replace(/\{[^}]*\}/g, '')
    // Remove markdown bold/italic
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    // Remove quotes
    .replace(/["']/g, '')
    // Trim and limit length to approximately 2 lines (150 characters)
    .trim()
    .substring(0, 150)
    // Add ellipsis if truncated
    + (text.length > 150 ? '...' : '');
}

function generateAISummaries(results) {
  const summaries = {};

  try {
    // Day of Week Analysis Summary
    if (results.insights.dayOfWeekAnalysis?.data?.aiInsights?.success) {
      const dayAI = results.insights.dayOfWeekAnalysis.data.aiInsights;
      const topInsight = dayAI.insights && dayAI.insights.length > 0 ? dayAI.insights[0] : '';
      summaries.dayOfWeekAnalysis = cleanInsightText(topInsight);
    }

    // Lot Size Analysis Summary  
    if (results.insights.lotSizeAnalysis?.data?.aiInsights?.success) {
      const lotSizeAI = results.insights.lotSizeAnalysis.data.aiInsights;
      const topInsight = lotSizeAI.insights && lotSizeAI.insights.length > 0 ? lotSizeAI.insights[0] : '';
      summaries.lotSizeAnalysis = cleanInsightText(topInsight);
    }

    // Trade Count Analysis Summary
    if (results.insights.tradeCountAnalysis?.data?.aiInsights?.success) {
      const tradeCountAI = results.insights.tradeCountAnalysis.data.aiInsights;
      const topInsight = tradeCountAI.insights && tradeCountAI.insights.length > 0 ? tradeCountAI.insights[0] : '';
      summaries.tradeCountAnalysis = cleanInsightText(topInsight);
    }

    // Duration Analysis Summary
    if (results.insights.durationAnalysis?.data?.aiInsights?.success) {
      const durationAI = results.insights.durationAnalysis.data.aiInsights;
      const topInsight = durationAI.insights && durationAI.insights.length > 0 ? durationAI.insights[0] : '';
      summaries.durationAnalysis = cleanInsightText(topInsight);
    }

    // Time-Instrument Analysis Summary
    if (results.insights.timeInstrumentAnalysis?.data?.aiInsights?.success) {
      const timeInstrumentAI = results.insights.timeInstrumentAnalysis.data.aiInsights;
      const topInsight = timeInstrumentAI.insights && timeInstrumentAI.insights.length > 0 ? timeInstrumentAI.insights[0] : '';
      summaries.timeInstrumentAnalysis = cleanInsightText(topInsight);
    }

    // Trade Sequence Analysis Summary
    if (results.insights.tradeSequenceAnalysis?.data?.aiInsights?.success) {
      const tradeSequenceAI = results.insights.tradeSequenceAnalysis.data.aiInsights;
      const topInsight = tradeSequenceAI.insights && tradeSequenceAI.insights.length > 0 ? tradeSequenceAI.insights[0] : '';
      summaries.tradeSequenceAnalysis = cleanInsightText(topInsight);
    }

    // Direction Analysis Summary
    if (results.insights.directionAnalysis?.data?.aiInsights?.success) {
      const directionAI = results.insights.directionAnalysis.data.aiInsights;
      const topInsight = directionAI.insights && directionAI.insights.length > 0 ? directionAI.insights[0] : '';
      summaries.directionAnalysis = cleanInsightText(topInsight);
    }

  } catch (error) {
    console.error('Error generating AI summaries:', error);
  }

  return summaries;
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateAITradingInsights,
    generateConsolidatedAIInsights,
    calculateConfidenceScore,
    generateAISummaries
  };
} else {
  // Browser environment
  window.AIInsights = window.AIInsights || {};
  window.AIInsights.Main = {
    generateAITradingInsights,
    generateAISummaries
  };
}
