import { NextResponse } from 'next/server';

// Import the trading insights main module using ES Module syntax
import * as tradingInsights from '../../../lib/trading-insights/trading-insights-main.js';

export async function POST(request) {
  try {
    const { data: dashboardData } = await request.json();

    if (!Array.isArray(dashboardData) || dashboardData.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No trading data provided'
      }, { status: 400 });
    }

    // Transform dashboard data to raw format expected by insights
    const transformedData = dashboardData.map(trade => ({
      Symbol: trade.symbol || trade.Symbol || 'Unknown',
      Strategy: 'Not Selected',
      Side: trade.side || trade.Side || 'LONG',
      Quantity: trade.quantity || trade.Quantity || 0,
      'Entry Price': typeof trade.entryPrice === 'number' ? `₹${trade.entryPrice}` : (trade['Entry Price'] || '₹0'),
      'Exit Price': typeof trade.exitPrice === 'number' ? `₹${trade.exitPrice}` : (trade['Exit Price'] || '₹0'),
      'P&L': typeof trade.pnl === 'number' ? `₹${trade.pnl}` : (trade['P&L'] || '₹0'),
      'Return %': trade.returnPercentage || trade['Return %'] || '0%',
      Emotion: 'Not Selected',
      Date: trade.date || trade.Date || new Date().toLocaleDateString('en-GB'),
      'Entry Time': trade.entryTime || trade['Entry Time'] || '00:00:00',
      'Exit Time': trade.exitTime || trade['Exit Time'] || '00:00:00',
      Duration: trade.duration || trade.Duration || '0m'
    }));

    console.log('Running trading insights analysis on', transformedData.length, 'trades');

    // Run the trading insights analysis
    const results = tradingInsights.runAllTradingInsights(transformedData);

    if (!results.success) {
      return NextResponse.json({
        success: false,
        error: 'Analysis failed',
        details: results.errors
      }, { status: 500 });
    }

    // Generate user-friendly summaries
    const summaries = tradingInsights.generateConciseSummaries(results);

    // Return both detailed results and concise summaries
    return NextResponse.json({
      success: true,
      results: results,
      summaries: summaries,
      totalTrades: results.metadata.totalTrades,
      completedInsights: results.metadata.completedInsights.length,
      analysisDate: new Date().toISOString()
    },);

  } catch (error) {
    console.error('Trading insights API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
