/**
 * Trading Types - Data structure definitions
 * TypeScript-style definitions for JavaScript objects used across the application
 */

/**
 * Raw trading record as it comes from JSON
 * @typedef {Object} RawTradeRecord
 * @property {string} Date - Date string in various formats
 * @property {string} [Entry Time] - Entry time string
 * @property {string} [Exit Time] - Exit time string  
 * @property {string} Symbol - Trading symbol
 * @property {string|number} P&L - Profit/Loss value (may have currency symbols)
 * @property {string} [Duration] - Duration string (e.g., "5m 30s")
 * @property {string|number} [Quantity] - Trade quantity
 * @property {string|number} [Entry Price] - Entry price
 * @property {string|number} [Exit Price] - Exit price
 * @property {string} [Side] - Buy/Sell direction
 * @property {string} [Strategy] - Trading strategy used
 * @property {string} [Return %] - Return percentage
 * @property {string} [Emotion] - Emotional state during trade
 */

/**
 * Processed trading record with standardized fields
 * @typedef {Object} ProcessedTradeRecord
 * @property {string} originalDate - Original date string
 * @property {string} originalSymbol - Original symbol string
 * @property {string} originalPnL - Original P&L string
 * @property {string} originalDuration - Original duration string
 * @property {Date} date - Parsed date object
 * @property {string} dayOfWeek - Day name (Monday, Tuesday, etc.)
 * @property {Object} entryTime - {hour, minute, second}
 * @property {Object} exitTime - {hour, minute, second}
 * @property {string} symbol - Trading symbol
 * @property {string} instrument - Instrument category (BANKNIFTY, NIFTY, etc.)
 * @property {number} pnl - Numeric P&L value
 * @property {number} durationSeconds - Duration in seconds
 * @property {string} durationCategory - Duration category (<1m, 1-5m, etc.)
 * @property {string} timeBucket - Time bucket (Early Morning, Morning, etc.)
 * @property {number} quantity - Trade quantity
 * @property {number} entryPrice - Entry price
 * @property {number} exitPrice - Exit price
 * @property {string} side - Trade direction
 * @property {boolean} isProfit - Whether trade was profitable
 * @property {boolean} isLoss - Whether trade was a loss
 * @property {string} tradeOutcome - 'Profit' or 'Loss'
 * @property {number} originalIndex - Index in original data
 */

/**
 * Analysis result structure
 * @typedef {Object} AnalysisResult
 * @property {boolean} success - Whether analysis completed successfully
 * @property {Object} data - Analysis data and results
 * @property {string} [error] - Error message if analysis failed
 * @property {Object} metadata - Analysis metadata
 * @property {number} metadata.totalTrades - Total number of trades analyzed
 * @property {Date} metadata.analysisDate - When analysis was performed
 * @property {number} metadata.executionTime - Analysis execution time in ms
 */

/**
 * Day of week analysis data structure
 * @typedef {Object} DayAnalysisData
 * @property {Object[]} dayPnLTable - Daily P&L summary table
 * @property {string} dayPnLTable[].day - Day name
 * @property {number} dayPnLTable[].totalPnL - Total P&L for the day
 * @property {number} dayPnLTable[].avgPnL - Average P&L per trade
 * @property {number} dayPnLTable[].tradeCount - Number of trades
 * @property {number} dayPnLTable[].winRate - Win rate percentage
 * @property {Object} summary - Overall summary statistics
 * @property {number} summary.totalPnL - Total P&L across all days
 * @property {number} summary.totalTrades - Total number of trades
 * @property {number} summary.overallWinRate - Overall win rate
 * @property {string} summary.bestDay - Best performing day
 * @property {string} summary.worstDay - Worst performing day
 * @property {string[]} insights - Generated insights
 * @property {string[]} recommendations - Generated recommendations
 */

/**
 * Duration analysis data structure
 * @typedef {Object} DurationAnalysisData
 * @property {Object[]} durationAnalysisTable - Duration analysis results
 * @property {string} durationAnalysisTable[].durationCategory - Duration category
 * @property {number} durationAnalysisTable[].totalTrades - Total trades
 * @property {number} durationAnalysisTable[].profitTrades - Profitable trades
 * @property {number} durationAnalysisTable[].lossTrades - Loss trades
 * @property {number} durationAnalysisTable[].winRate - Win rate percentage
 * @property {number} durationAnalysisTable[].avgPnL - Average P&L
 * @property {number} durationAnalysisTable[].profitLossRatio - Profit/Loss ratio
 * @property {Object} summary - Summary statistics
 * @property {number} summary.totalPnL - Total P&L
 * @property {number} summary.totalTrades - Total trades
 * @property {number} summary.overallWinRate - Overall win rate
 * @property {number} summary.avgHoldingTime - Average holding time in seconds
 * @property {string[]} insights - Generated insights
 * @property {string[]} recommendations - Generated recommendations
 */

/**
 * Complete analysis results structure
 * @typedef {Object} CompleteAnalysisResults
 * @property {boolean} success - Overall success status
 * @property {Object} insights - All individual insight results
 * @property {AnalysisResult} [insights.dayOfWeekAnalysis] - Day analysis results
 * @property {AnalysisResult} [insights.durationAnalysis] - Duration analysis results
 * @property {string[]} errors - Array of error messages
 * @property {Object} metadata - Analysis metadata
 * @property {number} metadata.totalTrades - Total trades processed
 * @property {Date} metadata.analysisDate - Analysis timestamp
 * @property {string[]} metadata.completedInsights - Successfully completed insights
 * @property {string[]} metadata.failedInsights - Failed insights
 */

/**
 * Consolidated insights structure
 * @typedef {Object} ConsolidatedInsights
 * @property {string} overallSummary - High-level summary text
 * @property {string[]} keyFindings - Most important findings
 * @property {string[]} criticalRecommendations - Actionable recommendations
 * @property {string[]} riskWarnings - Risk alerts and warnings
 */

/**
 * Validation result structure
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether data is valid
 * @property {string[]} errors - Critical errors that prevent processing
 * @property {string[]} warnings - Non-critical warnings
 * @property {Object} summary - Validation summary
 * @property {number} summary.totalRecords - Total records checked
 * @property {number} summary.validRecords - Valid records count
 * @property {number} summary.invalidRecords - Invalid records count
 * @property {Object} summary.missingFields - Count of missing fields by field name
 */

/**
 * Basic statistics structure
 * @typedef {Object} BasicStats
 * @property {number} count - Count of values
 * @property {number} sum - Sum of values
 * @property {number} mean - Mean (average)
 * @property {number} median - Median value
 * @property {number} min - Minimum value
 * @property {number} max - Maximum value
 * @property {number} stdDev - Standard deviation
 * @property {number} variance - Variance
 */

/**
 * Pivot table structure
 * @typedef {Object} PivotTable
 * @property {Object} data - Pivot table data (row -> column -> value)
 * @property {string[]} rows - Array of row keys
 * @property {string[]} columns - Array of column keys
 */

/**
 * Outliers analysis structure
 * @typedef {Object} OutliersAnalysis
 * @property {number[]} outliers - Array of outlier values
 * @property {number} lowerBound - Lower bound for outlier detection
 * @property {number} upperBound - Upper bound for outlier detection
 * @property {number} q1 - First quartile
 * @property {number} q3 - Third quartile
 * @property {number} iqr - Interquartile range
 */

// Constants and enums
const INSTRUMENT_CATEGORIES = [
  'BANKNIFTY',
  'NIFTY', 
  'SENSEX',
  'FINNIFTY',
  'STOCKS',
  'OTHER'
];

const DURATION_CATEGORIES = [
  '<1m',
  '1-5m',
  '5-15m',
  '15-30m',
  '30-60m',
  '1-2h',
  '>2h'
];

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday', 
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

const TRADING_DAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday', 
  'Thursday',
  'Friday'
];

// Analysis configuration options
const DEFAULT_OPTIONS = {
  // General options
  includeWeekends: false,
  minTradesForInsight: 3,
  
  // Currency formatting
  currencySymbol: '₹',
  currencyLocale: 'en-IN',
  
  // Percentage formatting
  percentageDecimals: 1,
  
  // Time zone
  timezone: 'Asia/Kolkata',
  
  // Outlier detection
  outlierMultiplier: 1.5,
  
  // Moving average window
  movingAverageWindow: 5,
  
  // Risk metrics
  riskFreeRate: 0.06, // 6% annual risk-free rate
  
  // Insight generation
  generateDetailedInsights: true,
  includeRecommendations: true,
  includeRiskWarnings: true
};

// Export types and constants
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    // Constants
    INSTRUMENT_CATEGORIES,
    DURATION_CATEGORIES,
    DAY_NAMES,
    TRADING_DAY_NAMES,
    DEFAULT_OPTIONS,
    
    // Type checking utilities
    isValidTradeRecord: (record) => {
      return record && 
             typeof record === 'object' &&
             (record.Date || record.date) &&
             (record['P&L'] || record.PnL || record.pnl);
    },
    
    isValidProcessedRecord: (record) => {
      return record &&
             typeof record === 'object' &&
             record.date instanceof Date &&
             typeof record.pnl === 'number' &&
             typeof record.instrument === 'string';
    }
  };
} else {
  // Browser environment
  window.TradingInsights = window.TradingInsights || {};
  window.TradingInsights.Types = {
    INSTRUMENT_CATEGORIES,
    DURATION_CATEGORIES,
    DAY_NAMES,
    TRADING_DAY_NAMES,
    DEFAULT_OPTIONS
  };
}

/*
USAGE EXAMPLES:

// Type checking in functions
function analyzeData(trades) {
  if (!Array.isArray(trades)) {
    throw new Error('Trades must be an array');
  }
  
  const validTrades = trades.filter(trade => 
    TradingTypes.isValidTradeRecord(trade)
  );
  
  // Process trades...
}

// Using constants
const durationCategories = TradingTypes.DURATION_CATEGORIES;
const instruments = TradingTypes.INSTRUMENT_CATEGORIES;

// Configuration
const options = {
  ...TradingTypes.DEFAULT_OPTIONS,
  minTradesForInsight: 5,
  currencySymbol: '$'
};

*/
