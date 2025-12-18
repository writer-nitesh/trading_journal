/**
 * AI-Enhanced Direction Analysis for TradioHub
 * ============================================
 * Analyzes trading performance by direction (LONG/SHORT) and instrument patterns
 * Uses data tables from direction analysis for AI-powered pattern recognition
 */

// Import AI utilities
const { generateAIInsights, createTradingAnalysisPrompt } = require('../utils/ai-utils.js');

/**
 * Trading directions
 */
const TRADING_DIRECTIONS = ['LONG', 'SHORT'];

/**
 * Main function to generate AI-enhanced direction analysis
 * @param {Object[]} processedTradingData - Array of processed trading records
 * @param {Object} options - Configuration options
 * @returns {Object} - AI-enhanced analysis results
 */
async function generateDirectionAnalysisAIInsights(processedTradingData, options = {}) {
  const startTime = Date.now();
  
  try {
    console.log('📈 Starting AI-enhanced Direction analysis...');
    
    // Extract data tables using the same logic as the updated ai-insights
    const dataTables = extractDirectionAnalysisTables(processedTradingData);
    
    if (!dataTables || !dataTables.directionAnalysisTable || dataTables.directionAnalysisTable.length === 0) {
      return {
        success: false,
        error: 'No direction data could be extracted from trading records',
        analysisType: 'direction_analysis',
        data: null,
        metadata: {
          aiEnhanced: false,
          aiProcessingDate: new Date(),
          errorOccurred: true
        }
      };
    }

    console.log('✅ Direction data extraction completed');
    console.log('Direction categories found:', dataTables.directionAnalysisTable.length);

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
      const prompt = createDirectionAnalysisPrompt(dataTables);
      
      console.log('🤖 Sending prompt to Gemini AI...');
      console.log('📝 Prompt length:', prompt.length, 'characters');

      const aiResponse = await generateAIInsights(prompt, {
        analysisType: 'direction_analysis',
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

    console.log('AI Direction Analysis Result:', aiInsights.success ? '✅ Success' : '❌ Failed');

    return {
      success: true,
      analysisType: 'direction_analysis',
      data: {
        // Include all extracted data tables for backward compatibility
        directionTable: dataTables.directionAnalysisTable,
        summary: {
          totalTrades: dataTables.metadata.totalTrades,
          totalPnL: dataTables.metadata.totalPnL,
          overallWinRate: dataTables.metadata.overallWinRate,
          betterDirection: dataTables.metadata.betterDirection
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
    console.error('💥 Direction analysis threw exception:', error.message);
    return {
      success: false,
      error: error.message,
      analysisType: 'direction_analysis',
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
 * Extract direction analysis data tables from processed trading data
 * @param {Array} processedTradingData - Array of processed trading records
 * @returns {Object} - Extracted data tables
 */
function extractDirectionAnalysisTables(processedTradingData) {
  if (!Array.isArray(processedTradingData) || processedTradingData.length === 0) {
    throw new Error('Invalid trading data: Expected non-empty array');
  }

  console.log('📊 Direction analysis: Processing', processedTradingData.length, 'trading records');

  // Debug: Check sample trade structure
  const sampleTrade = processedTradingData[0];
  console.log('📋 Sample trade structure:', {
    hasOriginalPnL: 'originalPnL' in sampleTrade,
    hasNetPL: 'netPL' in sampleTrade,
    hasPnl: 'pnl' in sampleTrade,
    hasSide: 'side' in sampleTrade,
    hasOriginalSide: 'originalSide' in sampleTrade,
    hasDirection: 'direction' in sampleTrade,
    hasSymbol: 'symbol' in sampleTrade,
    hasOriginalSymbol: 'originalSymbol' in sampleTrade,
    keys: Object.keys(sampleTrade).slice(0, 15)
  });

  // Filter valid trades with flexible field mapping
  const validTrades = processedTradingData.map(trade => {
    // Map P&L field - check multiple possible field names
    let pnl = trade.netPL || trade.originalPnL || trade.pnl || trade.pAndL || trade.pl;
    if (typeof pnl !== 'number') {
      pnl = parseFloat(pnl) || 0;
    }

    // Map direction/side field - check multiple possible field names
    let direction = trade.side || trade.direction || trade.originalSide || trade.type;
    if (direction && typeof direction === 'string') {
      direction = direction.toUpperCase().trim();
      // Normalize direction values
      if (direction === 'BUY' || direction === 'LONG' || direction === 'B') {
        direction = 'LONG';
      } else if (direction === 'SELL' || direction === 'SHORT' || direction === 'S') {
        direction = 'SHORT';
      }
    }

    // Map symbol field
    let symbol = trade.symbol || trade.originalSymbol || trade.instrument;
    if (symbol && typeof symbol === 'string') {
      symbol = symbol.toUpperCase().trim();
    }

    return {
      ...trade,
      pnl: pnl,
      direction: direction,
      symbol: symbol
    };
  }).filter(trade => {
    const hasValidPnL = trade.pnl !== undefined && 
                       trade.pnl !== null && 
                       typeof trade.pnl === 'number';
    const hasValidDirection = trade.direction && 
                             TRADING_DIRECTIONS.includes(trade.direction);
    const hasValidSymbol = trade.symbol && 
                          typeof trade.symbol === 'string' && 
                          trade.symbol.length > 0;
    
    return hasValidPnL && hasValidDirection && hasValidSymbol;
  });

  console.log('✅ Direction analysis: Filtered to', validTrades.length, 'valid trades');
  
  // Debug: Show sample filtered trade
  if (validTrades.length > 0) {
    const sampleFiltered = validTrades[0];
    console.log('📋 Sample filtered trade:', {
      direction: sampleFiltered.direction,
      symbol: sampleFiltered.symbol,
      pnl: sampleFiltered.pnl,
      pnlType: typeof sampleFiltered.pnl
    });
  }

  console.log('✅ Direction analysis: Filtered to', validTrades.length, 'valid trades');

  if (validTrades.length === 0) {
    console.warn('⚠️ No valid trades found with direction and symbol data');
    console.log('📋 Available trade fields in sample:', Object.keys(processedTradingData[0] || {}));
    throw new Error('No valid trades found with direction and symbol data');
  }

  // Extract unique symbols
  const uniqueSymbols = [...new Set(validTrades.map(trade => trade.symbol))].sort();

  // Initialize direction-symbol matrix
  const directionSymbolMatrix = {};
  TRADING_DIRECTIONS.forEach(direction => {
    directionSymbolMatrix[direction] = {};
    uniqueSymbols.forEach(symbol => {
      directionSymbolMatrix[direction][symbol] = {
        totalPnL: 0,
        tradeCount: 0,
        winningTrades: 0,
        losingTrades: 0,
        avgPnL: 0,
        winRate: 0
      };
    });
  });

  // Process each trade and populate the matrix
  validTrades.forEach(trade => {
    const direction = trade.direction;
    const symbol = trade.symbol;
    
    if (directionSymbolMatrix[direction] && directionSymbolMatrix[direction][symbol]) {
      const cell = directionSymbolMatrix[direction][symbol];
      
      cell.totalPnL += trade.pnl;
      cell.tradeCount += 1;
      
      if (trade.pnl > 0) {
        cell.winningTrades += 1;
      } else if (trade.pnl < 0) {
        cell.losingTrades += 1;
      }
    }
  });

  // Calculate derived metrics
  TRADING_DIRECTIONS.forEach(direction => {
    uniqueSymbols.forEach(symbol => {
      const cell = directionSymbolMatrix[direction][symbol];
      if (cell.tradeCount > 0) {
        cell.avgPnL = cell.totalPnL / cell.tradeCount;
        cell.winRate = (cell.winningTrades / cell.tradeCount) * 100;
      }
    });
  });

  // Generate direction analysis table
  const directionAnalysisTable = TRADING_DIRECTIONS.map(direction => {
    const directionData = Object.values(directionSymbolMatrix[direction]);
    const totalPnL = directionData.reduce((sum, cell) => sum + cell.totalPnL, 0);
    const totalTrades = directionData.reduce((sum, cell) => sum + cell.tradeCount, 0);
    const winningTrades = directionData.reduce((sum, cell) => sum + cell.winningTrades, 0);
    const symbolsTraded = uniqueSymbols.filter(symbol => directionSymbolMatrix[direction][symbol].tradeCount > 0).length;
    
    return {
      Direction: direction,
      Trade_Count: totalTrades,
      Total_PnL: Math.round(totalPnL),
      Avg_PnL: totalTrades > 0 ? Math.round(totalPnL / totalTrades) : 0,
      Win_Rate: totalTrades > 0 ? parseFloat(((winningTrades / totalTrades) * 100).toFixed(1)) : 0,
      Symbols_Traded: symbolsTraded
    };
  });

  // Generate symbol analysis table (top 10 by total PnL)
  const symbolAnalysisTable = uniqueSymbols.map(symbol => {
    const longData = directionSymbolMatrix.LONG[symbol];
    const shortData = directionSymbolMatrix.SHORT[symbol];
    
    const totalPnL = longData.totalPnL + shortData.totalPnL;
    const totalTrades = longData.tradeCount + shortData.tradeCount;
    const winningTrades = longData.winningTrades + shortData.winningTrades;
    
    return {
      Symbol: symbol,
      Trade_Count: totalTrades,
      Total_PnL: Math.round(totalPnL),
      Avg_PnL: totalTrades > 0 ? Math.round(totalPnL / totalTrades) : 0,
      Win_Rate: totalTrades > 0 ? parseFloat(((winningTrades / totalTrades) * 100).toFixed(1)) : 0,
      Long_Trades: longData.tradeCount,
      Short_Trades: shortData.tradeCount,
      Long_PnL: Math.round(longData.totalPnL),
      Short_PnL: Math.round(shortData.totalPnL)
    };
  })
  .filter(symbolData => symbolData.Trade_Count > 0)
  .sort((a, b) => b.Total_PnL - a.Total_PnL)
  .slice(0, 10);

  // Generate direction-symbol combinations table (top 15 by total PnL)
  const directionSymbolTable = [];
  TRADING_DIRECTIONS.forEach(direction => {
    uniqueSymbols.forEach(symbol => {
      const cell = directionSymbolMatrix[direction][symbol];
      if (cell.tradeCount > 0) {
        directionSymbolTable.push({
          Direction: direction,
          Symbol: symbol,
          Trade_Count: cell.tradeCount,
          Total_PnL: Math.round(cell.totalPnL),
          Avg_PnL: Math.round(cell.avgPnL),
          Win_Rate: parseFloat(cell.winRate.toFixed(1))
        });
      }
    });
  });
  
  directionSymbolTable.sort((a, b) => b.Total_PnL - a.Total_PnL);
  const topDirectionSymbolTable = directionSymbolTable.slice(0, 15);

  // Calculate summary statistics
  const totalTrades = validTrades.length;
  const totalPnL = validTrades.reduce((sum, trade) => sum + trade.pnl, 0);
  const winningTrades = validTrades.filter(trade => trade.pnl > 0).length;
  const overallWinRate = (winningTrades / totalTrades) * 100;
  const uniqueSymbolsTraded = uniqueSymbols.filter(symbol => 
    directionSymbolMatrix.LONG[symbol].tradeCount > 0 || directionSymbolMatrix.SHORT[symbol].tradeCount > 0
  ).length;
  const activeCombinations = directionSymbolTable.length;
  const totalPossibleCombinations = TRADING_DIRECTIONS.length * uniqueSymbols.length;

  // Find best and worst combinations
  const bestCombo = topDirectionSymbolTable[0];
  const worstCombo = directionSymbolTable[directionSymbolTable.length - 1];

  // Direction performance comparison
  const longPerformance = directionAnalysisTable.find(d => d.Direction === 'LONG');
  const shortPerformance = directionAnalysisTable.find(d => d.Direction === 'SHORT');
  const betterDirection = (longPerformance?.Total_PnL || 0) > (shortPerformance?.Total_PnL || 0) ? 'LONG' : 'SHORT';

  const metadata = {
    totalTrades: totalTrades,
    totalPnL: totalPnL,
    overallWinRate: parseFloat(overallWinRate.toFixed(1)),
    avgPnLPerTrade: Math.round(totalPnL / totalTrades),
    uniqueSymbols: uniqueSymbolsTraded,
    uniqueSymbolsTotal: uniqueSymbols.length,
    activeCombinations: activeCombinations,
    totalPossibleCombinations: totalPossibleCombinations,
    bestCombo: bestCombo ? `${bestCombo.Direction} ${bestCombo.Symbol}` : 'N/A',
    worstCombo: worstCombo ? `${worstCombo.Direction} ${worstCombo.Symbol}` : 'N/A',
    betterDirection: betterDirection,
    longPnL: longPerformance?.Total_PnL || 0,
    shortPnL: shortPerformance?.Total_PnL || 0,
    dataExtractionDate: new Date(),
    recordsProcessed: processedTradingData.length
  };

  return {
    directionAnalysisTable,
    symbolAnalysisTable,
    directionSymbolTable: topDirectionSymbolTable,
    metadata
  };
}

/**
 * Create specialized prompt for direction analysis
 * @param {Object} dataTables - Extracted direction data tables
 * @returns {string} - Formatted prompt for AI analysis
 */
function createDirectionAnalysisPrompt(dataTables) {
  const prompt = `As a professional trading analyst, analyze this direction performance data:

## Trading Data Summary
- Total Trades: ${dataTables.metadata.totalTrades}
- Total P&L: ₹${dataTables.metadata.totalPnL}
- Overall Win Rate: ${dataTables.metadata.overallWinRate}%
- Better Direction: ${dataTables.metadata.betterDirection}
- Unique Symbols: ${dataTables.metadata.uniqueSymbols}

## Direction Performance
${dataTables.directionAnalysisTable.map(row => 
  `${row.Direction}: ${row.Trade_Count} trades, ₹${row.Total_PnL} P&L, ${row.Win_Rate}% win rate, ${row.Symbols_Traded} symbols`
).join('\n')}

## Top Performing Symbols
${dataTables.symbolAnalysisTable.slice(0, 5).map(row => 
  `${row.Symbol}: ${row.Trade_Count} trades, ₹${row.Total_PnL} P&L, ${row.Long_Trades}L/${row.Short_Trades}S`
).join('\n')}

## Best Direction-Symbol Combinations
${dataTables.directionSymbolTable.slice(0, 5).map(row => 
  `${row.Direction} ${row.Symbol}: ${row.Trade_Count} trades, ₹${row.Total_PnL} P&L, ${row.Win_Rate}% win rate`
).join('\n')}

Provide 3-4 actionable insights focusing on:
1. Direction bias and optimal trading approach
2. Symbol-specific direction performance patterns
3. Risk management for different directions
4. Portfolio diversification across directions

Make 10 - 15 words insights personal and specific to this trader's patterns.`;

  return prompt;
}

/**
 * Estimate token usage for direction analysis data
 * @param {Object} dataTables - Data tables object
 * @returns {number} - Estimated token count
 */
function estimateTokenUsage(dataTables) {
  const basePromptTokens = 250;
  const directionTokens = (dataTables.directionAnalysisTable?.length || 0) * 20;
  const symbolTokens = (dataTables.symbolAnalysisTable?.length || 0) * 25;
  const combinationTokens = (dataTables.directionSymbolTable?.length || 0) * 30;
  
  return basePromptTokens + directionTokens + symbolTokens + combinationTokens;
}

// Export functions
module.exports = {
  generateDirectionAnalysisAIInsights,
  extractDirectionAnalysisTables,
  createDirectionAnalysisPrompt,
  estimateTokenUsage,
  TRADING_DIRECTIONS
};
