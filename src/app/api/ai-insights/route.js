import { NextResponse } from 'next/server';

// Import the AI insights main module
const { generateAITradingInsights, generateAISummaries } = require('../../../lib/ai-insights/ai-insights-main.js');

export async function POST(request) {
  try {
    console.log('🔍 AI Insights API: Starting request processing...');
    
    const { data: dashboardData, useAI = true } = await request.json();
    console.log('📊 AI Insights API: Received data for', dashboardData?.length || 0, 'trades');

    if (!Array.isArray(dashboardData) || dashboardData.length === 0) {
      console.log('❌ AI Insights API: No trading data provided');
      return NextResponse.json({
        success: false,
        error: 'No trading data provided'
      }, { status: 400 });
    }

    // Check if we have enough data for meaningful AI analysis
    if (dashboardData.length < 5) {
      console.log('❌ AI Insights API: Insufficient data -', dashboardData.length, 'trades');
      return NextResponse.json({
        success: false,
        error: 'At least 5 trades required for AI insights',
        message: 'AI insights require more trading data for meaningful analysis'
      }, { status: 400 });
    }

    console.log('🔄 AI Insights API: Transforming trading data...');
    
    // Transform dashboard data to raw format expected by AI insights
    const transformedData = dashboardData.map(trade => ({
      Symbol: trade.symbol || trade.Symbol || 'Unknown',
      Strategy: trade.strategy || 'Not Selected',
      Side: trade.side || trade.Side || 'LONG',
      Quantity: trade.quantity || trade.Quantity || 0,
      'Entry Price': typeof trade.entryPrice === 'number' ? `₹${trade.entryPrice}` : (trade['Entry Price'] || '₹0'),
      'Exit Price': typeof trade.exitPrice === 'number' ? `₹${trade.exitPrice}` : (trade['Exit Price'] || '₹0'),
      'P&L': typeof trade.pnl === 'number' ? `₹${trade.pnl}` : (trade['P&L'] || '₹0'),
      'Return %': trade.returnPercentage || trade['Return %'] || '0%',
      Emotion: trade.emotion || trade.feelings || 'Not Selected',
      Date: trade.date || trade.Date || new Date().toLocaleDateString('en-GB'),
      'Entry Time': trade.entryTime || trade['Entry Time'] || '00:00:00',
      'Exit Time': trade.exitTime || trade['Exit Time'] || '00:00:00',
      Duration: trade.duration || trade.Duration || '0m'
    }));

    console.log('✅ AI Insights API: Data transformation completed');
    console.log('🤖 AI Insights API: Loading AI insights module...');

    // Test loading the AI insights module
    let generateAITradingInsights, generateAISummaries;
    try {
      const aiModule = require('../../../lib/ai-insights/ai-insights-main.js');
      generateAITradingInsights = aiModule.generateAITradingInsights;
      generateAISummaries = aiModule.generateAISummaries;
      console.log('✅ AI Insights API: AI module loaded successfully');
    } catch (moduleError) {
      console.error('❌ AI Insights API: Failed to load AI module:', moduleError.message);
      throw new Error(`Failed to load AI insights module: ${moduleError.message}`);
    }

    console.log('Running AI-enhanced trading insights analysis on', transformedData.length, 'trades');

    // Set up AI options
    const aiOptions = {
      apiKey: process.env.GOOGLE_API_KEY,
      model: 'gemini-1.5-flash',
      maxTokens: 1000,
      temperature: 0.2
    };

    console.log('🚀 AI Insights API: Starting AI analysis...');
    
    // Run the AI insights analysis
    const results = await generateAITradingInsights(transformedData, aiOptions);
    console.log('✅ AI Insights API: AI analysis completed, success:', results.success);

    if (!results.success) {
      console.log('❌ AI Insights API: AI analysis failed:', results.error);
      return NextResponse.json({
        success: false,
        error: 'AI analysis failed',
        details: results.error,
        fallbackAvailable: true
      }, { status: 500 });
    }

    console.log('📝 AI Insights API: Generating summaries...');
    
    // Generate user-friendly summaries for the frontend
    const summaries = generateAISummaries(results);
    console.log('✅ AI Insights API: Summaries generated');

    // Return AI-enhanced results
    return NextResponse.json({
      success: true,
      type: 'ai_insights',
      results: results,
      summaries: summaries,
      consolidatedInsights: results.consolidatedInsights,
      aiMetadata: {
        totalTrades: results.metadata.totalTrades,
        completedInsights: results.metadata.completedInsights.length,
        failedInsights: results.metadata.failedInsights.length,
        totalTokensUsed: results.metadata.totalTokensUsed,
        totalAICost: results.metadata.totalAICost,
        confidenceScore: results.consolidatedInsights?.confidenceScore || 0,
        analysisDate: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('💥 AI insights API error:', error);
    console.error('💥 Full error stack:', error.stack);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message,
      type: 'server_error'
    }, { status: 500 });
  }
}
