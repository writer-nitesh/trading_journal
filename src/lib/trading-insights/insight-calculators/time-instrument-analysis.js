/**
 * Time of Day × Instrument P&L Analysis - JavaScript Implementation
 * Equivalent to Python insight #2 from insights10.ipynb
 * 
 * This module analyzes trading performance by time of day and instrument category
 * to identify optimal trading periods for different instruments and detect patterns.
 * Focus on data-driven insights only.
 */

// Import utility modules
const DataProcessor = require('../utils/data-processor.js');
const Calculations = require('../utils/calculations.js');

/**
 * Extract base instrument from complex symbol names
 * Handles options, futures, and stock symbols with dates/suffixes
 * @param {string} symbol - Original symbol name
 * @returns {string} - Base instrument name
 */
function extractBaseInstrument(symbol) {
  if (!symbol || typeof symbol !== 'string') return 'UNKNOWN';
  
  const cleanSymbol = symbol.toUpperCase().trim();
  
  // Remove common patterns found in Indian market symbols
  let baseInstrument = cleanSymbol
    // Remove option patterns (PE/CE with numbers and dates)
    .replace(/\d{2}[A-Z]{3}\d{2}\d+[PC]E$/i, '') // 25JUL24750CE, 2581424400PE
    .replace(/\d{4}\d+[PC]E$/i, '') // 24750CE, 24400PE
    // Remove date patterns
    .replace(/\d{2}[A-Z]{3}\d{2}/gi, '') // 25JUL24, 25JAN24
    .replace(/\d{2}[A-Z]{3}\d{4}/gi, '') // 25JUL2024
    .replace(/\d{7,}/g, '') // Long number sequences
    // Remove FUT suffix
    .replace(/\d{2}[A-Z]{3}FUT$/i, '') // 24SEPFUT
    .replace(/FUT$/i, '') // FUT
    // Remove trailing numbers and symbols
    .replace(/\d+$/g, '')
    .replace(/[^A-Z]/g, '');

  return baseInstrument || 'UNKNOWN';
}

/**
 * Categorize instruments intelligently based on base name
 * @param {string} symbol - Symbol to categorize
 * @returns {string} - Instrument category (actual stock name for stocks, index name for indices)
 */
function categorizeInstrument(symbol) {
  const baseInstrument = extractBaseInstrument(symbol);
  
  // Index-based instruments - return the index name
  if (baseInstrument.includes('BANKNIFTY') || baseInstrument === 'BANKNIFTY') {
    return 'BANKNIFTY';
  }
  if (baseInstrument.includes('SENSEX') || baseInstrument === 'SENSEX') {
    return 'SENSEX';
  }
  if (baseInstrument.includes('NIFTY') || baseInstrument === 'NIFTY') {
    return 'NIFTY';
  }
  
  // For individual stocks, return the actual stock name instead of generic "STOCKS"
  const knownStocks = [
    'INFY', 'INFOSYS', 'HDFCBANK', 'HDFC', 'RELIANCE', 'RIL',
    'ICICIBANK', 'ICICI', 'TCS', 'ITC', 'IDEA', 'BHARTIARTL',
    'SBIN', 'KOTAKBANK', 'LT', 'HINDUNILVR', 'ASIANPAINT',
    'MARUTI', 'BAJFINANCE', 'HCLTECH', 'WIPRO', 'ULTRACEMCO',
    'NESTLEIND', 'TITAN', 'SUNPHARMA', 'ONGC', 'NTPC',
    'POWERGRID', 'TECHM', 'COALINDIA', 'DRREDDY', 'CIPLA',
    'CANFINHOME', 'AXISBANK', 'BAJAJFINSV', 'INDUSINDBK'
  ];
  
  if (knownStocks.includes(baseInstrument)) {
    return baseInstrument; // Return the actual stock name
  }
  
  // Heuristic: If symbol length suggests it's a stock and doesn't contain index names
  if (baseInstrument.length >= 3 && baseInstrument.length <= 15 && 
      !baseInstrument.includes('NIFTY') && !baseInstrument.includes('BANKNIFTY') && 
      !baseInstrument.includes('SENSEX')) {
    return baseInstrument; // Return the actual stock name
  }
  
  return baseInstrument; // Return the symbol itself for unknown instruments
}

/**
 * Get time bucket based on hour
 * @param {number|Date} hourOrDate - Hour in 24-hour format or Date object
 * @returns {string} - Time bucket category
 */
function getTimeBucket(hourOrDate) {
  let hour;
  
  // Handle both hour number and Date object
  if (typeof hourOrDate === 'number') {
    hour = hourOrDate;
  } else if (hourOrDate instanceof Date) {
    hour = hourOrDate.getHours();
  } else if (hourOrDate && typeof hourOrDate === 'object' && hourOrDate.hour !== undefined) {
    hour = hourOrDate.hour; // Handle DataProcessor format
  } else {
    return 'Unknown Time';
  }
  
  if (hour >= 9 && hour < 10) return 'Early Morning (9-10 AM)';
  if (hour >= 10 && hour < 12) return 'Morning (10-12 PM)';
  if (hour >= 12 && hour < 14) return 'Afternoon (12-2 PM)';
  if (hour >= 14) return 'Late Afternoon (2+ PM)';
  return 'Pre-Market';
}

/**
 * Parse time string and extract hour
 * Handles various time formats including AM/PM
 * @param {string} timeString - Time string to parse
 * @returns {number|null} - Hour in 24-hour format or null if invalid
 */
function parseTimeString(timeString) {
  if (!timeString) return null;
  
  try {
    const timeStr = timeString.toString().trim();
    
    // Match patterns like "1:13:07 PM", "10:30:45 AM", "09:30:00"
    const ampmMatch = timeStr.match(/(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)/i);
    if (ampmMatch) {
      let hour = parseInt(ampmMatch[1]);
      const ampm = ampmMatch[4].toUpperCase();
      
      if (ampm === 'PM' && hour !== 12) hour += 12;
      if (ampm === 'AM' && hour === 12) hour = 0;
      
      return hour;
    }
    
    // Try 24-hour format
    const hourMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (hourMatch) {
      return parseInt(hourMatch[1]);
    }
    
    // Try to parse as Date
    const date = new Date(timeStr);
    if (!isNaN(date.getTime())) {
      return date.getHours();
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Generate insights from time-instrument analysis
 * @param {Object} matrix - Time-instrument performance matrix
 * @param {Array} processedData - Processed trading data
 * @returns {Array} - Array of insight objects
 */
function generateTimeInstrumentInsights(matrix, processedData) {
  const insights = [];
  
  try {
    // Find best and worst time-instrument combinations
    let bestCombo = null, worstCombo = null;
    let bestPnL = -Infinity, worstPnL = Infinity;
    
    Object.keys(matrix).forEach(timeSlot => {
      Object.keys(matrix[timeSlot]).forEach(instrument => {
        const cell = matrix[timeSlot][instrument];
        if (cell.tradeCount > 0) {
          if (cell.totalPnL > bestPnL) {
            bestPnL = cell.totalPnL;
            bestCombo = { timeSlot, instrument, ...cell };
          }
          if (cell.totalPnL < worstPnL) {
            worstPnL = cell.totalPnL;
            worstCombo = { timeSlot, instrument, ...cell };
          }
        }
      });
    });
    
    if (bestCombo && bestPnL > 0) {
      insights.push(
        `Best Time-Instrument combo: ${bestCombo.timeSlot} × ${bestCombo.instrument} ` +
        `(₹${bestCombo.totalPnL.toLocaleString()}, ${bestCombo.tradeCount} trades, ${bestCombo.winRate.toFixed(1)}% win rate)`
      );
    }
    
    if (worstCombo && worstPnL < 0) {
      insights.push(
        `Worst Time-Instrument combo: ${worstCombo.timeSlot} × ${worstCombo.instrument} ` +
        `(₹${worstCombo.totalPnL.toLocaleString()}, ${worstCombo.tradeCount} trades, ${worstCombo.winRate.toFixed(1)}% win rate)`
      );
    }
    
    // Best instrument overall
    const instrumentTotals = {};
    Object.keys(matrix).forEach(timeSlot => {
      Object.keys(matrix[timeSlot]).forEach(instrument => {
        if (!instrumentTotals[instrument]) {
          instrumentTotals[instrument] = { pnl: 0, trades: 0, wins: 0 };
        }
        const cell = matrix[timeSlot][instrument];
        instrumentTotals[instrument].pnl += cell.totalPnL;
        instrumentTotals[instrument].trades += cell.tradeCount;
        instrumentTotals[instrument].wins += cell.winningTrades;
      });
    });
    
    const bestInstrument = Object.keys(instrumentTotals).reduce((best, current) => 
      instrumentTotals[current].pnl > instrumentTotals[best].pnl ? current : best
    );
    
    const bestInstData = instrumentTotals[bestInstrument];
    insights.push(
      `Most profitable instrument overall: ${bestInstrument} ` +
      `(₹${bestInstData.pnl.toLocaleString()}, ${bestInstData.trades} trades)`
    );
    
    // Best time bucket overall
    const timeTotals = {};
    Object.keys(matrix).forEach(timeSlot => {
      timeTotals[timeSlot] = { pnl: 0, trades: 0, wins: 0 };
      Object.keys(matrix[timeSlot]).forEach(instrument => {
        const cell = matrix[timeSlot][instrument];
        timeTotals[timeSlot].pnl += cell.totalPnL;
        timeTotals[timeSlot].trades += cell.tradeCount;
        timeTotals[timeSlot].wins += cell.winningTrades;
      });
    });
    
    const bestTimeSlot = Object.keys(timeTotals).reduce((best, current) => 
      timeTotals[current].pnl > timeTotals[best].pnl ? current : best
    );
    
    const bestTimeData = timeTotals[bestTimeSlot];
    insights.push(
      `Best time bucket overall: ${bestTimeSlot} ` +
      `(₹${bestTimeData.pnl.toLocaleString()}, ${bestTimeData.trades} trades)`
    );
    
    // Volatility analysis
    const allComboPnLs = [];
    Object.keys(matrix).forEach(timeSlot => {
      Object.keys(matrix[timeSlot]).forEach(instrument => {
        const cell = matrix[timeSlot][instrument];
        if (cell.tradeCount > 0) {
          allComboPnLs.push(cell.totalPnL);
        }
      });
    });
    
    if (allComboPnLs.length > 1) {
      const stdDev = Calculations.calculateBasicStats(allComboPnLs).stdDev;
      insights.push(`P&L volatility across all time-instrument combinations: ₹${stdDev.toLocaleString()}`);
    }
    
    // Consistency analysis - find combinations with good win rate and multiple trades
    const consistentCombos = [];
    Object.keys(matrix).forEach(timeSlot => {
      Object.keys(matrix[timeSlot]).forEach(instrument => {
        const cell = matrix[timeSlot][instrument];
        if (cell.tradeCount >= 3 && cell.winRate >= 60) {
          consistentCombos.push({ timeSlot, instrument, ...cell });
        }
      });
    });
    
    if (consistentCombos.length > 0) {
      const bestConsistent = consistentCombos.sort((a, b) => b.winRate - a.winRate)[0];
      insights.push(
        `Most consistent combo (≥60% win rate, ≥3 trades): ${bestConsistent.timeSlot} × ${bestConsistent.instrument} ` +
        `(${bestConsistent.winRate.toFixed(1)}% win rate, ₹${bestConsistent.totalPnL.toLocaleString()})`
      );
    }
    
    // Performance patterns
    const morningPerformance = timeTotals['Morning (10-12 PM)'] || { pnl: 0, trades: 0 };
    const afternoonPerformance = timeTotals['Late Afternoon (2+ PM)'] || { pnl: 0, trades: 0 };
    
    if (morningPerformance.trades > 0 && afternoonPerformance.trades > 0) {
      const morningAvg = morningPerformance.pnl / morningPerformance.trades;
      const afternoonAvg = afternoonPerformance.pnl / afternoonPerformance.trades;
      
      if (morningAvg > afternoonAvg + 100) {
        insights.push(`Morning trading significantly outperforms afternoon (₹${(morningAvg - afternoonAvg).toFixed(0)} better per trade)`);
      } else if (afternoonAvg > morningAvg + 100) {
        insights.push(`Afternoon trading significantly outperforms morning (₹${(afternoonAvg - morningAvg).toFixed(0)} better per trade)`);
      }
    }
    
  } catch (error) {
    insights.push(`Error generating insights: ${error.message}`);
  }
  
  return insights;
}

/**
 * Generate recommendations based on time-instrument analysis
 * @param {Object} matrix - Time-instrument performance matrix
 * @param {Array} processedData - Processed trading data
 * @returns {Array} - Array of recommendation strings
 */
function generateTimeInstrumentRecommendations(matrix, processedData) {
  const recommendations = [];
  
  try {
    // Find best performing combinations for recommendations
    const combos = [];
    Object.keys(matrix).forEach(timeSlot => {
      Object.keys(matrix[timeSlot]).forEach(instrument => {
        const cell = matrix[timeSlot][instrument];
        if (cell.tradeCount > 0) {
          combos.push({ timeSlot, instrument, ...cell });
        }
      });
    });
    
    // Recommend best combinations
    const bestCombos = combos
      .filter(combo => combo.totalPnL > 0 && combo.tradeCount >= 2)
      .sort((a, b) => b.totalPnL - a.totalPnL)
      .slice(0, 3);
    
    if (bestCombos.length > 0) {
      recommendations.push(
        `FOCUS ON TOP PERFORMERS: Concentrate trading on ${bestCombos[0].timeSlot} × ${bestCombos[0].instrument} - your most profitable combination`
      );
    }
    
    // Identify poor performers to avoid
    const poorCombos = combos
      .filter(combo => combo.totalPnL < -500 && combo.tradeCount >= 2)
      .sort((a, b) => a.totalPnL - b.totalPnL);
    
    if (poorCombos.length > 0) {
      recommendations.push(
        `AVOID POOR COMBINATIONS: Reduce or eliminate trading ${poorCombos[0].timeSlot} × ${poorCombos[0].instrument} - consistently underperforming`
      );
    }
    
    // Time-based recommendations
    const timeTotals = {};
    Object.keys(matrix).forEach(timeSlot => {
      timeTotals[timeSlot] = { pnl: 0, trades: 0 };
      Object.keys(matrix[timeSlot]).forEach(instrument => {
        const cell = matrix[timeSlot][instrument];
        timeTotals[timeSlot].pnl += cell.totalPnL;
        timeTotals[timeSlot].trades += cell.tradeCount;
      });
    });
    
    const bestTimeSlots = Object.keys(timeTotals)
      .filter(slot => timeTotals[slot].trades > 0)
      .sort((a, b) => timeTotals[b].pnl - timeTotals[a].pnl);
    
    if (bestTimeSlots.length > 0) {
      recommendations.push(
        `OPTIMIZE TRADING SCHEDULE: Focus most of your trading during ${bestTimeSlots[0]} - your most profitable time period`
      );
    }
    
    // Instrument-based recommendations
    const instrumentTotals = {};
    Object.keys(matrix).forEach(timeSlot => {
      Object.keys(matrix[timeSlot]).forEach(instrument => {
        if (!instrumentTotals[instrument]) {
          instrumentTotals[instrument] = { pnl: 0, trades: 0 };
        }
        const cell = matrix[timeSlot][instrument];
        instrumentTotals[instrument].pnl += cell.totalPnL;
        instrumentTotals[instrument].trades += cell.tradeCount;
      });
    });
    
    const profitableInstruments = Object.keys(instrumentTotals)
      .filter(inst => instrumentTotals[inst].pnl > 0)
      .sort((a, b) => instrumentTotals[b].pnl - instrumentTotals[a].pnl);
    
    if (profitableInstruments.length > 0) {
      recommendations.push(
        `INSTRUMENT SPECIALIZATION: Consider specializing in ${profitableInstruments[0]} trading - your most profitable instrument category`
      );
    }
    
    // Risk management recommendations
    const riskyCombos = combos.filter(combo => combo.tradeCount >= 3 && combo.winRate < 40);
    if (riskyCombos.length > 0) {
      recommendations.push(
        `RISK MANAGEMENT: Review strategy for low win-rate combinations and consider position sizing reduction or elimination`
      );
    }
    
    // Diversification recommendations
    const activeCombos = combos.filter(combo => combo.tradeCount > 0).length;
    const totalPossibleCombos = Object.keys(matrix).length * Object.keys(matrix[Object.keys(matrix)[0]]).length;
    
    if (activeCombos < totalPossibleCombos * 0.5) {
      recommendations.push(
        `EXPLORE OPPORTUNITIES: Consider testing other time-instrument combinations to find additional profitable patterns`
      );
    }
    
  } catch (error) {
    recommendations.push(`Error generating recommendations: ${error.message}`);
  }
  
  return recommendations;
}

/**
 * Main function to analyze Time of Day × Instrument P&L patterns
 * @param {Object[]} processedTradingData - Array of processed trading records
 * @param {Object} options - Configuration options
 * @returns {Object} - Analysis results with insights
 */
function analyzeTimeInstrumentPnL(processedTradingData, options = {}) {
  try {
    // Validate input
    if (!Array.isArray(processedTradingData) || processedTradingData.length === 0) {
      throw new Error('Invalid trading data: Expected non-empty array');
    }

    // Process data and add time/instrument information
    const processedData = processedTradingData
      .map(trade => {
        // Handle different entryTime formats
        let hour = null;
        if (trade.entryTime && typeof trade.entryTime === 'object' && trade.entryTime.hour !== undefined) {
          // Already processed by DataProcessor - has {hour, minute, second} format
          const timeObj = new Date();
          timeObj.setHours(trade.entryTime.hour, trade.entryTime.minute, trade.entryTime.second || 0);
          hour = timeObj;
        } else if (trade.entryTime && typeof trade.entryTime === 'string') {
          // Raw string format - needs parsing
          hour = parseTimeString(trade.entryTime);
        } else if (trade['Entry Time'] && typeof trade['Entry Time'] === 'string') {
          // Raw string format from original data
          hour = parseTimeString(trade['Entry Time']);
        }
        
        const timeBucket = hour !== null ? getTimeBucket(hour) : null;
        const instrumentCategory = categorizeInstrument(trade.symbol);
        const baseInstrument = extractBaseInstrument(trade.symbol);
        
        return {
          ...trade,
          hour,
          timeBucket,
          instrumentCategory,
          baseInstrument
        };
      })
      .filter(trade => trade.timeBucket !== null && typeof trade.pnl === 'number');

    if (processedData.length === 0) {
      throw new Error('No valid time-instrument data found');
    }

    // Create time buckets and instrument categories
    const timeBuckets = ['Early Morning (9-10 AM)', 'Morning (10-12 PM)', 'Afternoon (12-2 PM)', 'Late Afternoon (2+ PM)'];
    const instruments = [...new Set(processedData.map(t => t.instrumentCategory))].sort();

    // Initialize time-instrument matrix
    const timeInstrumentMatrix = {};
    timeBuckets.forEach(timeSlot => {
      timeInstrumentMatrix[timeSlot] = {};
      instruments.forEach(instrument => {
        timeInstrumentMatrix[timeSlot][instrument] = {
          totalPnL: 0,
          tradeCount: 0,
          winningTrades: 0,
          losingTrades: 0,
          avgPnL: 0,
          winRate: 0,
          lossRate: 0
        };
      });
    });

    // Populate the matrix
    processedData.forEach(trade => {
      const cell = timeInstrumentMatrix[trade.timeBucket][trade.instrumentCategory];
      if (cell) {
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
    Object.keys(timeInstrumentMatrix).forEach(timeSlot => {
      Object.keys(timeInstrumentMatrix[timeSlot]).forEach(instrument => {
        const cell = timeInstrumentMatrix[timeSlot][instrument];
        if (cell.tradeCount > 0) {
          cell.avgPnL = cell.totalPnL / cell.tradeCount;
          cell.winRate = (cell.winningTrades / cell.tradeCount) * 100;
          cell.lossRate = (cell.losingTrades / cell.tradeCount) * 100;
        }
      });
    });

    // Generate insights and recommendations
    const insights = generateTimeInstrumentInsights(timeInstrumentMatrix, processedData);
    const recommendations = generateTimeInstrumentRecommendations(timeInstrumentMatrix, processedData);

    // Convert matrix to flat arrays for easier consumption
    const timeSlotAnalysis = timeBuckets.map(timeSlot => {
      const slotData = Object.values(timeInstrumentMatrix[timeSlot]);
      const totalPnL = slotData.reduce((sum, inst) => sum + inst.totalPnL, 0);
      const totalTrades = slotData.reduce((sum, inst) => sum + inst.tradeCount, 0);
      const winningTrades = slotData.reduce((sum, inst) => sum + inst.winningTrades, 0);
      const bestTrade = Math.max(...slotData.filter(inst => inst.tradeCount > 0).map(inst => inst.avgPnL), 0);
      const worstTrade = Math.min(...slotData.filter(inst => inst.tradeCount > 0).map(inst => inst.avgPnL), 0);
      
      return {
        timeSlot: timeSlot,
        totalPnL: totalPnL,
        tradeCount: totalTrades,
        winRate: totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0,
        avgPnL: totalTrades > 0 ? totalPnL / totalTrades : 0,
        bestTrade: bestTrade,
        worstTrade: worstTrade
      };
    });

    const instrumentAnalysis = instruments.map(instrument => {
      const instData = timeBuckets.map(timeSlot => timeInstrumentMatrix[timeSlot][instrument]);
      const totalPnL = instData.reduce((sum, slot) => sum + slot.totalPnL, 0);
      const totalTrades = instData.reduce((sum, slot) => sum + slot.tradeCount, 0);
      const winningTrades = instData.reduce((sum, slot) => sum + slot.winningTrades, 0);
      const bestTrade = Math.max(...instData.filter(slot => slot.tradeCount > 0).map(slot => slot.avgPnL), 0);
      const worstTrade = Math.min(...instData.filter(slot => slot.tradeCount > 0).map(slot => slot.avgPnL), 0);
      const symbols = [...new Set(processedData.filter(trade => trade.instrumentCategory === instrument).map(trade => trade.baseInstrument))];
      
      return {
        instrumentType: instrument,
        totalPnL: totalPnL,
        tradeCount: totalTrades,
        winRate: totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0,
        avgPnL: totalTrades > 0 ? totalPnL / totalTrades : 0,
        bestTrade: bestTrade,
        worstTrade: worstTrade,
        symbols: symbols
      };
    });

    // Convert matrix to flat array for combinations view
    const timeInstrumentMatrixArray = [];
    timeBuckets.forEach(timeSlot => {
      instruments.forEach(instrument => {
        const cell = timeInstrumentMatrix[timeSlot][instrument];
        if (cell.tradeCount > 0) {
          timeInstrumentMatrixArray.push({
            timeSlot: timeSlot,
            instrumentType: instrument,
            totalPnL: cell.totalPnL,
            tradeCount: cell.tradeCount,
            winRate: cell.winRate,
            avgPnL: cell.avgPnL
          });
        }
      });
    });

    // Summary statistics
    const totalPnL = processedData.reduce((sum, trade) => sum + trade.pnl, 0);
    const winningTrades = processedData.filter(trade => trade.pnl > 0).length;
    const overallWinRate = (winningTrades / processedData.length) * 100;
    const activeCombinations = Object.keys(timeInstrumentMatrix).reduce((count, timeSlot) => {
      return count + Object.keys(timeInstrumentMatrix[timeSlot]).filter(inst => 
        timeInstrumentMatrix[timeSlot][inst].tradeCount > 0
      ).length;
    }, 0);
    const uniqueInstruments = instruments.length;
    const tradingDays = [...new Set(processedData.map(trade => trade.date ? trade.date.toDateString() : 'Unknown'))].length;

    // Instrument breakdown
    const instrumentBreakdown = {};
    instruments.forEach(instrument => {
      const instrumentData = processedData.filter(trade => trade.instrumentCategory === instrument);
      instrumentBreakdown[instrument] = {
        count: instrumentData.length,
        totalPnL: instrumentData.reduce((sum, trade) => sum + trade.pnl, 0),
        avgPnL: instrumentData.length > 0 ? instrumentData.reduce((sum, trade) => sum + trade.pnl, 0) / instrumentData.length : 0,
        uniqueSymbols: [...new Set(instrumentData.map(trade => trade.baseInstrument))],
        winRate: instrumentData.length > 0 ? (instrumentData.filter(trade => trade.pnl > 0).length / instrumentData.length) * 100 : 0
      };
    });

    return {
      success: true,
      data: {
        summary: {
          totalTrades: processedData.length,
          totalPnL: totalPnL,
          overallWinRate: overallWinRate,
          avgPnLPerTrade: totalPnL / processedData.length,
          activeCombinations: activeCombinations,
          totalPossibleCombinations: timeBuckets.length * instruments.length,
          uniqueInstruments: uniqueInstruments,
          tradingDays: tradingDays
        },
        timeSlotAnalysis: timeSlotAnalysis,
        instrumentAnalysis: instrumentAnalysis,
        timeInstrumentMatrix: timeInstrumentMatrixArray,
        timeInstrumentMatrixObject: timeInstrumentMatrix, // Keep original for backwards compatibility
        timeBuckets: timeBuckets,
        instruments: instruments,
        instrumentBreakdown: instrumentBreakdown,
        insights: insights,
        recommendations: recommendations,
        rawProcessedData: processedData
      }
    };

  } catch (error) {
    console.error('Time-Instrument Analysis Error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

// Export the main analysis function
if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  module.exports = {
    analyzeTimeInstrumentPnL,
    extractBaseInstrument,
    categorizeInstrument,
    getTimeBucket,
    parseTimeString,
    generateTimeInstrumentInsights,
    generateTimeInstrumentRecommendations
  };
} else {
  // Browser environment
  window.TradingInsights = window.TradingInsights || {};
  window.TradingInsights.TimeInstrumentAnalysis = {
    analyzeTimeInstrumentPnL,
    extractBaseInstrument,
    categorizeInstrument,
    getTimeBucket,
    parseTimeString
  };
}
