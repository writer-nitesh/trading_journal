/**
 * Direction × Instrument Analysis - JavaScript Implementation
 * Equivalent to Python insight #4 from insights10.ipynb
 * 
 * This module analyzes trading performance by direction (LONG/SHORT) combined with
 * instrument types to identify optimal direction-instrument combinations.
 * Focus on data-driven insights only.
 */

// Import utility modules
const DataProcessor = require('../utils/data-processor.js');
const Calculations = require('../utils/calculations.js');

/**
 * Extract unique symbols from the dataset dynamically
 * @param {Object[]} tradingData - Array of processed trading records
 * @returns {string[]} - Array of unique symbols
 */
function extractUniqueSymbols(tradingData) {
  const symbols = new Set();
  
  tradingData.forEach(trade => {
    if (trade.symbol && typeof trade.symbol === 'string') {
      symbols.add(trade.symbol.toUpperCase().trim());
    }
  });
  
  return Array.from(symbols).sort();
}

/**
 * Categorize trade by direction and symbol
 * @param {Object} trade - Individual trade record
 * @returns {Object} - Direction and symbol information
 */
function categorizeDirectionSymbol(trade) {
  const direction = trade.side ? trade.side.toUpperCase() : 'UNKNOWN';
  const symbol = trade.symbol ? trade.symbol.toUpperCase().trim() : 'UNKNOWN';
  
  return {
    direction,
    symbol,
    directionSymbolKey: `${direction}_${symbol}`
  };
}

/**
 * Check if a symbol is a CE option
 * @param {string} symbol - Trading symbol
 * @returns {boolean} - True if CE option
 */
function isCEOption(symbol) {
  if (!symbol || typeof symbol !== 'string') return false;
  const upperSymbol = symbol.toUpperCase();
  // Must end with CE and contain numbers (indicating strike price) to be an option
  return upperSymbol.endsWith('CE') && /\d/.test(upperSymbol);
}

/**
 * Check if a symbol is a PE option
 * @param {string} symbol - Trading symbol
 * @returns {boolean} - True if PE option
 */
function isPEOption(symbol) {
  if (!symbol || typeof symbol !== 'string') return false;
  const upperSymbol = symbol.toUpperCase();
  // Must end with PE and contain numbers (indicating strike price) to be an option
  return upperSymbol.endsWith('PE') && /\d/.test(upperSymbol);
}

/**
 * Categorize CE/PE options by base instrument
 * @param {string} symbol - Trading symbol
 * @returns {string} - Base instrument category for options
 */
function categorizeOptionInstrument(symbol) {
  if (!symbol || typeof symbol !== 'string') return 'UNKNOWN';
  
  const upperSymbol = symbol.toUpperCase();
  
  if (upperSymbol.includes('NIFTY') && !upperSymbol.includes('BANKNIFTY')) {
    return 'NIFTY';
  }
  if (upperSymbol.includes('BANKNIFTY')) {
    return 'BANKNIFTY';
  }
  if (upperSymbol.includes('SENSEX')) {
    return 'SENSEX';
  }
  
  return 'OTHER';
}

/**
 * Generate insights from direction-symbol analysis
 * @param {Object} directionSymbolMatrix - Direction-symbol performance matrix
 * @param {Object[]} processedData - Processed trading data
 * @returns {string[]} - Array of insights
 */
function generateDirectionSymbolInsights(directionSymbolMatrix, processedData) {
  const insights = [];
  
  try {
    // Find best and worst direction-symbol combinations
    const combinations = [];
    
    Object.keys(directionSymbolMatrix.LONG || {}).forEach(symbol => {
      const longData = directionSymbolMatrix.LONG[symbol];
      if (longData.tradeCount > 0) {
        combinations.push({
          direction: 'LONG',
          symbol: symbol,
          totalPnL: longData.totalPnL,
          tradeCount: longData.tradeCount,
          winRate: longData.winRate,
          avgPnL: longData.avgPnL
        });
      }
    });
    
    Object.keys(directionSymbolMatrix.SHORT || {}).forEach(symbol => {
      const shortData = directionSymbolMatrix.SHORT[symbol];
      if (shortData.tradeCount > 0) {
        combinations.push({
          direction: 'SHORT',
          symbol: symbol,
          totalPnL: shortData.totalPnL,
          tradeCount: shortData.tradeCount,
          winRate: shortData.winRate,
          avgPnL: shortData.avgPnL
        });
      }
    });
    
    if (combinations.length > 0) {
      // Best combination by total P&L
      const bestCombo = combinations.reduce((best, combo) => combo.totalPnL > best.totalPnL ? combo : best);
      insights.push(`Best Direction-Symbol combo: ${bestCombo.direction} ${bestCombo.symbol} (₹${bestCombo.totalPnL.toFixed(0)}, ${bestCombo.tradeCount} trades, ${bestCombo.winRate.toFixed(1)}% win rate)`);
      
      // Worst combination by total P&L
      const worstCombo = combinations.reduce((worst, combo) => combo.totalPnL < worst.totalPnL ? combo : worst);
      if (worstCombo.totalPnL < 0) {
        insights.push(`Worst Direction-Symbol combo: ${worstCombo.direction} ${worstCombo.symbol} (₹${worstCombo.totalPnL.toFixed(0)}, ${worstCombo.tradeCount} trades, ${worstCombo.winRate.toFixed(1)}% win rate)`);
      }
      
      // Best direction overall
      const longTotalPnL = combinations.filter(c => c.direction === 'LONG').reduce((sum, c) => sum + c.totalPnL, 0);
      const shortTotalPnL = combinations.filter(c => c.direction === 'SHORT').reduce((sum, c) => sum + c.totalPnL, 0);
      
      if (longTotalPnL > shortTotalPnL) {
        insights.push(`Direction bias: LONG positions perform better overall (₹${longTotalPnL.toFixed(0)} vs ₹${shortTotalPnL.toFixed(0)})`);
      } else if (shortTotalPnL > longTotalPnL) {
        insights.push(`Direction bias: SHORT positions perform better overall (₹${shortTotalPnL.toFixed(0)} vs ₹${longTotalPnL.toFixed(0)})`);
      }
      
      // Most profitable symbol regardless of direction
      const symbolTotals = {};
      combinations.forEach(combo => {
        symbolTotals[combo.symbol] = (symbolTotals[combo.symbol] || 0) + combo.totalPnL;
      });
      
      const bestSymbol = Object.keys(symbolTotals).reduce((best, symbol) => 
        symbolTotals[symbol] > symbolTotals[best] ? symbol : best);
      insights.push(`Most profitable symbol overall: ${bestSymbol} (₹${symbolTotals[bestSymbol].toFixed(0)} total)`);
      
      // High win rate combinations (>=70% with >=3 trades)
      const highWinRateCombos = combinations.filter(combo => combo.winRate >= 70 && combo.tradeCount >= 3);
      if (highWinRateCombos.length > 0) {
        const bestWinRateCombo = highWinRateCombos.reduce((best, combo) => combo.winRate > best.winRate ? combo : best);
        insights.push(`Most consistent combo (≥70% win rate, ≥3 trades): ${bestWinRateCombo.direction} ${bestWinRateCombo.symbol} (${bestWinRateCombo.winRate.toFixed(1)}% win rate, ₹${bestWinRateCombo.totalPnL.toFixed(0)})`);
      }
      
      // Symbol diversity analysis
      const uniqueSymbols = new Set(combinations.map(c => c.symbol)).size;
      const totalCombinations = combinations.length;
      insights.push(`Portfolio diversity: Trading ${uniqueSymbols} unique symbols with ${totalCombinations} direction-symbol combinations`);
      
    } else {
      insights.push('No valid direction-symbol combinations found');
    }
    
  } catch (error) {
    insights.push(`Error generating insights: ${error.message}`);
  }
  
  return insights;
}

/**
 * Generate recommendations from direction-symbol analysis
 * @param {Object} directionSymbolMatrix - Direction-symbol performance matrix
 * @param {Object[]} processedData - Processed trading data
 * @returns {string[]} - Array of recommendations
 */
function generateDirectionSymbolRecommendations(directionSymbolMatrix, processedData) {
  const recommendations = [];
  
  try {
    const combinations = [];
    
    // Collect all combinations
    ['LONG', 'SHORT'].forEach(direction => {
      if (directionSymbolMatrix[direction]) {
        Object.keys(directionSymbolMatrix[direction]).forEach(symbol => {
          const data = directionSymbolMatrix[direction][symbol];
          if (data.tradeCount > 0) {
            combinations.push({
              direction,
              symbol,
              totalPnL: data.totalPnL,
              tradeCount: data.tradeCount,
              winRate: data.winRate,
              avgPnL: data.avgPnL
            });
          }
        });
      }
    });
    
    if (combinations.length > 0) {
      // Top performing combinations
      const topCombos = combinations
        .filter(combo => combo.totalPnL > 0)
        .sort((a, b) => b.totalPnL - a.totalPnL)
        .slice(0, 3);
        
      if (topCombos.length > 0) {
        recommendations.push(`FOCUS ON TOP PERFORMERS: Concentrate on ${topCombos.map(c => `${c.direction} ${c.symbol}`).join(', ')} - your most profitable combinations`);
      }
      
      // Poor performing combinations to avoid
      const poorCombos = combinations
        .filter(combo => combo.totalPnL < -500 && combo.tradeCount >= 2)
        .sort((a, b) => a.totalPnL - b.totalPnL)
        .slice(0, 2);
        
      if (poorCombos.length > 0) {
        recommendations.push(`AVOID POOR COMBINATIONS: Reduce or eliminate ${poorCombos.map(c => `${c.direction} ${c.symbol}`).join(', ')} - consistently underperforming`);
      }
      
      // Direction specialization
      const longTotal = combinations.filter(c => c.direction === 'LONG').reduce((sum, c) => sum + c.totalPnL, 0);
      const shortTotal = combinations.filter(c => c.direction === 'SHORT').reduce((sum, c) => sum + c.totalPnL, 0);
      
      if (Math.abs(longTotal - shortTotal) > 1000) {
        const betterDirection = longTotal > shortTotal ? 'LONG' : 'SHORT';
        recommendations.push(`DIRECTION SPECIALIZATION: Consider focusing more on ${betterDirection} positions based on historical performance`);
      }
      
      // Symbol specialization
      const symbolTotals = {};
      combinations.forEach(combo => {
        symbolTotals[combo.symbol] = (symbolTotals[combo.symbol] || 0) + combo.totalPnL;
      });
      
      const topSymbols = Object.keys(symbolTotals)
        .filter(symbol => symbolTotals[symbol] > 0)
        .sort((a, b) => symbolTotals[b] - symbolTotals[a])
        .slice(0, 3);
        
      if (topSymbols.length > 0) {
        recommendations.push(`SYMBOL SPECIALIZATION: Focus on ${topSymbols.join(', ')} - your most profitable instruments`);
      }
      
      // Risk management
      const highRiskCombos = combinations.filter(combo => combo.winRate < 40 && combo.tradeCount >= 3);
      if (highRiskCombos.length > 0) {
        recommendations.push(`RISK MANAGEMENT: Review strategy for low win-rate combinations and consider position sizing reduction or elimination`);
      }
      
    } else {
      recommendations.push('Insufficient data for generating recommendations');
    }
    
  } catch (error) {
    recommendations.push(`Error generating recommendations: ${error.message}`);
  }
  
  return recommendations;
}

/**
 * Main function to analyze Direction × Symbol patterns
 * @param {Object[]} processedTradingData - Array of processed trading records
 * @param {Object} options - Configuration options
 * @returns {Object} - Analysis results with insights
 */
function analyzeDirectionSymbolPnL(processedTradingData, options = {}) {
  try {
    // Validate input
    if (!Array.isArray(processedTradingData) || processedTradingData.length === 0) {
      throw new Error('Invalid trading data: Expected non-empty array');
    }

    // Extract unique symbols from the dataset
    const uniqueSymbols = extractUniqueSymbols(processedTradingData);
    const directions = ['LONG', 'SHORT'];

    // Initialize direction-symbol matrix
    const directionSymbolMatrix = {};
    directions.forEach(direction => {
      directionSymbolMatrix[direction] = {};
      uniqueSymbols.forEach(symbol => {
        directionSymbolMatrix[direction][symbol] = {
          totalPnL: 0,
          tradeCount: 0,
          winningTrades: 0,
          losingTrades: 0,
          avgPnL: 0,
          winRate: 0,
          lossRate: 0,
          bestTrade: 0,
          worstTrade: 0
        };
      });
    });

    // Process each trade and populate the matrix
    const validTrades = processedTradingData.filter(trade => 
      trade.pnl !== undefined && trade.pnl !== null && typeof trade.pnl === 'number' && 
      trade.side && trade.symbol
    );

    validTrades.forEach(trade => {
      const { direction, symbol } = categorizeDirectionSymbol(trade);
      
      if (directionSymbolMatrix[direction] && directionSymbolMatrix[direction][symbol]) {
        const cell = directionSymbolMatrix[direction][symbol];
        
        cell.totalPnL += trade.pnl;
        cell.tradeCount += 1;
        
        if (trade.pnl > 0) {
          cell.winningTrades += 1;
        } else if (trade.pnl < 0) {
          cell.losingTrades += 1;
        }
        
        // Track best and worst trades
        if (trade.pnl > cell.bestTrade) cell.bestTrade = trade.pnl;
        if (trade.pnl < cell.worstTrade) cell.worstTrade = trade.pnl;
      }
    });

    // Calculate averages and rates
    directions.forEach(direction => {
      uniqueSymbols.forEach(symbol => {
        const cell = directionSymbolMatrix[direction][symbol];
        if (cell.tradeCount > 0) {
          cell.avgPnL = cell.totalPnL / cell.tradeCount;
          cell.winRate = (cell.winningTrades / cell.tradeCount) * 100;
          cell.lossRate = (cell.losingTrades / cell.tradeCount) * 100;
        }
      });
    });

    // Generate direction analysis summary
    const directionAnalysis = directions.map(direction => {
      const directionData = Object.values(directionSymbolMatrix[direction]);
      const totalPnL = directionData.reduce((sum, cell) => sum + cell.totalPnL, 0);
      const totalTrades = directionData.reduce((sum, cell) => sum + cell.tradeCount, 0);
      const winningTrades = directionData.reduce((sum, cell) => sum + cell.winningTrades, 0);
      const bestTrade = Math.max(...directionData.filter(cell => cell.tradeCount > 0).map(cell => cell.bestTrade), 0);
      const worstTrade = Math.min(...directionData.filter(cell => cell.tradeCount > 0).map(cell => cell.worstTrade), 0);
      
      return {
        direction: direction,
        totalPnL: totalPnL,
        tradeCount: totalTrades,
        winRate: totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0,
        avgPnL: totalTrades > 0 ? totalPnL / totalTrades : 0,
        bestTrade: bestTrade,
        worstTrade: worstTrade,
        symbolsTraded: uniqueSymbols.filter(symbol => directionSymbolMatrix[direction][symbol].tradeCount > 0).length
      };
    });

    // Generate symbol analysis summary
    const symbolAnalysis = uniqueSymbols.map(symbol => {
      const longData = directionSymbolMatrix.LONG[symbol];
      const shortData = directionSymbolMatrix.SHORT[symbol];
      
      const totalPnL = longData.totalPnL + shortData.totalPnL;
      const totalTrades = longData.tradeCount + shortData.tradeCount;
      const winningTrades = longData.winningTrades + shortData.winningTrades;
      const bestTrade = Math.max(longData.bestTrade, shortData.bestTrade);
      const worstTrade = Math.min(longData.worstTrade, shortData.worstTrade);
      
      return {
        symbol: symbol,
        totalPnL: totalPnL,
        tradeCount: totalTrades,
        winRate: totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0,
        avgPnL: totalTrades > 0 ? totalPnL / totalTrades : 0,
        bestTrade: bestTrade,
        worstTrade: worstTrade,
        longTrades: longData.tradeCount,
        shortTrades: shortData.tradeCount,
        longPnL: longData.totalPnL,
        shortPnL: shortData.totalPnL
      };
    }).filter(symbolData => symbolData.tradeCount > 0);

    // Convert matrix to flat array for easier consumption
    const directionSymbolMatrixArray = [];
    directions.forEach(direction => {
      uniqueSymbols.forEach(symbol => {
        const cell = directionSymbolMatrix[direction][symbol];
        if (cell.tradeCount > 0) {
          directionSymbolMatrixArray.push({
            direction: direction,
            symbol: symbol,
            totalPnL: cell.totalPnL,
            tradeCount: cell.tradeCount,
            winRate: cell.winRate,
            avgPnL: cell.avgPnL,
            bestTrade: cell.bestTrade,
            worstTrade: cell.worstTrade
          });
        }
      });
    });

    // Generate insights and recommendations
    const insights = generateDirectionSymbolInsights(directionSymbolMatrix, validTrades);
    const recommendations = generateDirectionSymbolRecommendations(directionSymbolMatrix, validTrades);

    // Summary statistics
    const totalPnL = validTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const winningTrades = validTrades.filter(trade => trade.pnl > 0).length;
    const overallWinRate = validTrades.length > 0 ? (winningTrades / validTrades.length) * 100 : 0;
    const uniqueSymbolsTraded = uniqueSymbols.filter(symbol => 
      directionSymbolMatrix.LONG[symbol].tradeCount > 0 || directionSymbolMatrix.SHORT[symbol].tradeCount > 0
    ).length;
    const tradingDays = [...new Set(validTrades.map(trade => 
      trade.date ? trade.date.toDateString() : 'Unknown'
    ))].length;
    const activeCombinations = directionSymbolMatrixArray.length;

    return {
      success: true,
      data: {
        summary: {
          totalTrades: validTrades.length,
          totalPnL: totalPnL,
          overallWinRate: overallWinRate,
          avgPnLPerTrade: validTrades.length > 0 ? totalPnL / validTrades.length : 0,
          uniqueSymbols: uniqueSymbolsTraded,
          uniqueSymbolsTotal: uniqueSymbols.length,
          activeCombinations: activeCombinations,
          totalPossibleCombinations: directions.length * uniqueSymbols.length,
          tradingDays: tradingDays
        },
        directionAnalysis: directionAnalysis,
        symbolAnalysis: symbolAnalysis,
        directionSymbolMatrix: directionSymbolMatrixArray,
        directionSymbolMatrixObject: directionSymbolMatrix,
        directions: directions,
        symbols: uniqueSymbols,
        insights: insights,
        recommendations: recommendations,
        rawProcessedData: validTrades
      }
    };

  } catch (error) {
    console.error('Direction-Symbol Analysis Error:', error);
    return {
      success: false,
      error: error.message,
      details: error.stack
    };
  }
}

/**
 * Main function to analyze Direction × Instrument patterns for CE/PE options only
 * @param {Object[]} processedTradingData - Array of processed trading records
 * @param {Object} options - Configuration options
 * @returns {Object} - Analysis results with insights for CE/PE options
 */
function analyzeDirectionCEPEPnL(processedTradingData, options = {}) {
  try {
    // Validate input
    if (!Array.isArray(processedTradingData) || processedTradingData.length === 0) {
      throw new Error('Invalid trading data: Expected non-empty array');
    }

    // Filter for CE and PE options only
    const cepeOptions = processedTradingData.filter(trade => 
      trade.symbol && (isCEOption(trade.symbol) || isPEOption(trade.symbol))
    );

    if (cepeOptions.length === 0) {
      return {
        success: true,
        data: {
          summary: {
            totalTrades: 0,
            totalPnL: 0,
            overallWinRate: 0,
            avgPnLPerTrade: 0,
            uniqueInstruments: 0,
            activeCombinations: 0,
            tradingDays: 0,
            ceTradesCount: 0,
            peTradesCount: 0
          },
          ceAnalysis: [],
          peAnalysis: [],
          directionOptionMatrix: [],
          insights: ['No CE or PE options found in the dataset'],
          recommendations: ['No CE/PE data available for recommendations'],
          rawProcessedData: []
        }
      };
    }

    // Separate CE and PE trades
    const ceTrades = cepeOptions.filter(trade => isCEOption(trade.symbol));
    const peTrades = cepeOptions.filter(trade => isPEOption(trade.symbol));

    // Create analysis for both CE and PE
    const ceAnalysis = analyzeCEPEByType(ceTrades, 'CE');
    const peAnalysis = analyzeCEPEByType(peTrades, 'PE');

    // Combined matrix for all CE/PE options
    const directionOptionMatrix = [];
    
    // Add CE combinations
    ceAnalysis.combinations.forEach(combo => {
      directionOptionMatrix.push({
        ...combo,
        optionType: 'CE',
        fullCategory: `${combo.direction}_${combo.instrument}_CE`
      });
    });
    
    // Add PE combinations
    peAnalysis.combinations.forEach(combo => {
      directionOptionMatrix.push({
        ...combo,
        optionType: 'PE',
        fullCategory: `${combo.direction}_${combo.instrument}_PE`
      });
    });

    // Generate combined insights
    const insights = [];
    
    if (directionOptionMatrix.length > 0) {
      // Best overall combination
      const bestCombo = directionOptionMatrix.reduce((best, combo) => combo.totalPnL > best.totalPnL ? combo : best);
      insights.push(`Best Direction-Option combo: ${bestCombo.direction} ${bestCombo.instrument} ${bestCombo.optionType} (₹${bestCombo.totalPnL.toFixed(0)}, ${bestCombo.tradeCount} trades, ${bestCombo.winRate.toFixed(1)}% win rate)`);
      
      // Worst combination
      const worstCombo = directionOptionMatrix.reduce((worst, combo) => combo.totalPnL < worst.totalPnL ? combo : worst);
      if (worstCombo.totalPnL < 0) {
        insights.push(`Worst Direction-Option combo: ${worstCombo.direction} ${worstCombo.instrument} ${worstCombo.optionType} (₹${worstCombo.totalPnL.toFixed(0)}, ${worstCombo.tradeCount} trades, ${worstCombo.winRate.toFixed(1)}% win rate)`);
      }
      
      // CE vs PE performance
      const ceTotalPnL = directionOptionMatrix.filter(c => c.optionType === 'CE').reduce((sum, c) => sum + c.totalPnL, 0);
      const peTotalPnL = directionOptionMatrix.filter(c => c.optionType === 'PE').reduce((sum, c) => sum + c.totalPnL, 0);
      
      if (Math.abs(ceTotalPnL - peTotalPnL) > 500) {
        const betterOptionType = ceTotalPnL > peTotalPnL ? 'CE' : 'PE';
        insights.push(`Option type bias: ${betterOptionType} options perform better overall (₹${betterOptionType === 'CE' ? ceTotalPnL : peTotalPnL} vs ₹${betterOptionType === 'CE' ? peTotalPnL : ceTotalPnL})`);
      }
      
      // Direction bias for options
      const longOptionPnL = directionOptionMatrix.filter(c => c.direction === 'LONG').reduce((sum, c) => sum + c.totalPnL, 0);
      const shortOptionPnL = directionOptionMatrix.filter(c => c.direction === 'SHORT').reduce((sum, c) => sum + c.totalPnL, 0);
      
      if (Math.abs(longOptionPnL - shortOptionPnL) > 500) {
        const betterDirection = longOptionPnL > shortOptionPnL ? 'LONG' : 'SHORT';
        insights.push(`Options direction bias: ${betterDirection} positions in options perform better (₹${betterDirection === 'LONG' ? longOptionPnL : shortOptionPnL} vs ₹${betterDirection === 'LONG' ? shortOptionPnL : longOptionPnL})`);
      }
      
      // Best instrument for options
      const instrumentTotals = {};
      directionOptionMatrix.forEach(combo => {
        instrumentTotals[combo.instrument] = (instrumentTotals[combo.instrument] || 0) + combo.totalPnL;
      });
      
      const bestInstrument = Object.keys(instrumentTotals).reduce((best, inst) => 
        instrumentTotals[inst] > instrumentTotals[best] ? inst : best);
      insights.push(`Most profitable options instrument: ${bestInstrument} (₹${instrumentTotals[bestInstrument].toFixed(0)} total across CE/PE)`);
    }

    // Generate recommendations
    const recommendations = [];
    
    if (directionOptionMatrix.length > 0) {
      // Top performing combinations
      const topCombos = directionOptionMatrix
        .filter(combo => combo.totalPnL > 0)
        .sort((a, b) => b.totalPnL - a.totalPnL)
        .slice(0, 3);
        
      if (topCombos.length > 0) {
        recommendations.push(`FOCUS ON TOP OPTION COMBINATIONS: Concentrate on ${topCombos.map(c => `${c.direction} ${c.instrument} ${c.optionType}`).join(', ')}`);
      }
      
      // Poor combinations to avoid
      const poorCombos = directionOptionMatrix
        .filter(combo => combo.totalPnL < -300 && combo.tradeCount >= 2)
        .sort((a, b) => a.totalPnL - b.totalPnL)
        .slice(0, 2);
        
      if (poorCombos.length > 0) {
        recommendations.push(`AVOID POOR OPTION COMBINATIONS: Reduce ${poorCombos.map(c => `${c.direction} ${c.instrument} ${c.optionType}`).join(', ')}`);
      }
      
      // Specialization recommendations
      if (ceTrades.length > 0 && peTrades.length > 0) {
        const ceTotalPnL = ceAnalysis.totalPnL;
        const peTotalPnL = peAnalysis.totalPnL;
        
        if (Math.abs(ceTotalPnL - peTotalPnL) > 1000) {
          const betterType = ceTotalPnL > peTotalPnL ? 'CE' : 'PE';
          recommendations.push(`OPTION TYPE SPECIALIZATION: Focus more on ${betterType} options based on performance`);
        }
      }
      
      recommendations.push('RISK MANAGEMENT: Monitor option time decay and implement proper position sizing for derivatives');
    }

    // Summary statistics
    const totalTrades = cepeOptions.length;
    const totalPnL = cepeOptions.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const winningTrades = cepeOptions.filter(trade => trade.pnl > 0).length;
    const overallWinRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
    const uniqueInstruments = new Set(cepeOptions.map(trade => categorizeOptionInstrument(trade.symbol))).size;
    const tradingDays = [...new Set(cepeOptions.map(trade => 
      trade.date ? trade.date.toDateString() : 'Unknown'
    ))].length;

    return {
      success: true,
      data: {
        summary: {
          totalTrades: totalTrades,
          totalPnL: totalPnL,
          overallWinRate: overallWinRate,
          avgPnLPerTrade: totalTrades > 0 ? totalPnL / totalTrades : 0,
          uniqueInstruments: uniqueInstruments,
          activeCombinations: directionOptionMatrix.length,
          tradingDays: tradingDays,
          ceTradesCount: ceTrades.length,
          peTradesCount: peTrades.length
        },
        ceAnalysis: ceAnalysis,
        peAnalysis: peAnalysis,
        directionOptionMatrix: directionOptionMatrix,
        insights: insights,
        recommendations: recommendations,
        rawProcessedData: cepeOptions
      }
    };

  } catch (error) {
    console.error('Direction CE/PE Analysis Error:', error);
    return {
      success: false,
      error: error.message,
      details: error.stack
    };
  }
}

/**
 * Helper function to analyze CE or PE trades by type
 * @param {Object[]} trades - Array of CE or PE trades
 * @param {string} optionType - 'CE' or 'PE'
 * @returns {Object} - Analysis results for the option type
 */
function analyzeCEPEByType(trades, optionType) {
  if (trades.length === 0) {
    return {
      optionType: optionType,
      totalPnL: 0,
      totalTrades: 0,
      winRate: 0,
      combinations: [],
      directionBias: null,
      instrumentBias: null
    };
  }

  const directions = ['LONG', 'SHORT'];
  const instruments = [...new Set(trades.map(trade => categorizeOptionInstrument(trade.symbol)))];
  
  // Create direction-instrument matrix for this option type
  const matrix = {};
  directions.forEach(direction => {
    matrix[direction] = {};
    instruments.forEach(instrument => {
      matrix[direction][instrument] = {
        totalPnL: 0,
        tradeCount: 0,
        winningTrades: 0,
        winRate: 0,
        avgPnL: 0
      };
    });
  });
  
  // Populate matrix
  trades.forEach(trade => {
    const direction = trade.side ? trade.side.toUpperCase() : 'UNKNOWN';
    const instrument = categorizeOptionInstrument(trade.symbol);
    
    if (matrix[direction] && matrix[direction][instrument]) {
      const cell = matrix[direction][instrument];
      cell.totalPnL += trade.pnl || 0;
      cell.tradeCount += 1;
      if (trade.pnl > 0) cell.winningTrades += 1;
    }
  });
  
  // Calculate rates and create combinations array
  const combinations = [];
  directions.forEach(direction => {
    instruments.forEach(instrument => {
      const cell = matrix[direction][instrument];
      if (cell.tradeCount > 0) {
        cell.avgPnL = cell.totalPnL / cell.tradeCount;
        cell.winRate = (cell.winningTrades / cell.tradeCount) * 100;
        
        combinations.push({
          direction: direction,
          instrument: instrument,
          totalPnL: cell.totalPnL,
          tradeCount: cell.tradeCount,
          winRate: cell.winRate,
          avgPnL: cell.avgPnL
        });
      }
    });
  });
  
  // Calculate summary stats
  const totalPnL = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  const totalTrades = trades.length;
  const winningTrades = trades.filter(trade => trade.pnl > 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  
  // Direction bias
  const longPnL = combinations.filter(c => c.direction === 'LONG').reduce((sum, c) => sum + c.totalPnL, 0);
  const shortPnL = combinations.filter(c => c.direction === 'SHORT').reduce((sum, c) => sum + c.totalPnL, 0);
  const directionBias = Math.abs(longPnL - shortPnL) > 200 ? (longPnL > shortPnL ? 'LONG' : 'SHORT') : null;
  
  // Instrument bias
  const instrumentTotals = {};
  combinations.forEach(combo => {
    instrumentTotals[combo.instrument] = (instrumentTotals[combo.instrument] || 0) + combo.totalPnL;
  });
  const instrumentBias = Object.keys(instrumentTotals).length > 0 ? 
    Object.keys(instrumentTotals).reduce((best, inst) => instrumentTotals[inst] > instrumentTotals[best] ? inst : best) : null;
  
  return {
    optionType: optionType,
    totalPnL: totalPnL,
    totalTrades: totalTrades,
    winRate: winRate,
    combinations: combinations,
    directionBias: directionBias,
    instrumentBias: instrumentBias
  };
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  module.exports = {
    analyzeDirectionSymbolPnL,
    analyzeDirectionCEPEPnL,
    extractUniqueSymbols,
    categorizeDirectionSymbol,
    isCEOption,
    isPEOption,
    categorizeOptionInstrument
  };
} else {
  // Browser environment
  window.TradingInsights = window.TradingInsights || {};
  window.TradingInsights.DirectionAnalysis = {
    analyzeDirectionSymbolPnL,
    analyzeDirectionCEPEPnL
  };
}
