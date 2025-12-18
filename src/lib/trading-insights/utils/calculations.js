/**
 * Common Calculation Functions
 * Shared mathematical and statistical functions used across all insights
 */

/**
 * Calculate basic statistics for an array of numbers
 * @param {number[]} values - Array of numeric values
 * @returns {Object} - Statistics object
 */
function calculateBasicStats(values) {
  if (!Array.isArray(values) || values.length === 0) {
    return {
      count: 0,
      sum: 0,
      mean: 0,
      median: 0,
      min: 0,
      max: 0,
      stdDev: 0,
      variance: 0
    };
  }
  
  const validValues = values.filter(v => typeof v === 'number' && !isNaN(v));
  
  if (validValues.length === 0) {
    return {
      count: 0,
      sum: 0,
      mean: 0,
      median: 0,
      min: 0,
      max: 0,
      stdDev: 0,
      variance: 0
    };
  }
  
  const sorted = [...validValues].sort((a, b) => a - b);
  const sum = validValues.reduce((acc, val) => acc + val, 0);
  const mean = sum / validValues.length;
  
  // Calculate median
  const median = validValues.length % 2 === 0
    ? (sorted[validValues.length / 2 - 1] + sorted[validValues.length / 2]) / 2
    : sorted[Math.floor(validValues.length / 2)];
  
  // Calculate variance and standard deviation
  const variance = validValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / validValues.length;
  const stdDev = Math.sqrt(variance);
  
  return {
    count: validValues.length,
    sum: sum,
    mean: mean,
    median: median,
    min: Math.min(...validValues),
    max: Math.max(...validValues),
    stdDev: stdDev,
    variance: variance
  };
}

/**
 * Calculate win rate from trading data
 * @param {Object[]} trades - Array of trade objects with pnl field
 * @returns {number} - Win rate as percentage (0-100)
 */
function calculateWinRate(trades) {
  if (!Array.isArray(trades) || trades.length === 0) {
    return 0;
  }
  
  const profitableTrades = trades.filter(trade => trade.pnl > 0).length;
  return (profitableTrades / trades.length) * 100;
}

/**
 * Calculate profit/loss ratio
 * @param {Object[]} trades - Array of trade objects with pnl field
 * @returns {number} - Profit/Loss ratio
 */
function calculateProfitLossRatio(trades) {
  if (!Array.isArray(trades) || trades.length === 0) {
    return 0;
  }
  
  const profitTrades = trades.filter(trade => trade.pnl > 0);
  const lossTrades = trades.filter(trade => trade.pnl < 0);
  
  if (lossTrades.length === 0) {
    return profitTrades.length > 0 ? Infinity : 0;
  }
  
  return profitTrades.length / lossTrades.length;
}

/**
 * Calculate risk-reward ratio
 * @param {Object[]} trades - Array of trade objects with pnl field
 * @returns {number} - Average profit to average loss ratio
 */
function calculateRiskRewardRatio(trades) {
  if (!Array.isArray(trades) || trades.length === 0) {
    return 0;
  }
  
  const profitTrades = trades.filter(trade => trade.pnl > 0);
  const lossTrades = trades.filter(trade => trade.pnl < 0);
  
  if (profitTrades.length === 0 || lossTrades.length === 0) {
    return 0;
  }
  
  const avgProfit = profitTrades.reduce((sum, trade) => sum + trade.pnl, 0) / profitTrades.length;
  const avgLoss = Math.abs(lossTrades.reduce((sum, trade) => sum + trade.pnl, 0) / lossTrades.length);
  
  return avgProfit / avgLoss;
}

/**
 * Calculate Sharpe-like ratio (return/risk)
 * @param {number[]} returns - Array of returns
 * @returns {number} - Sharpe-like ratio
 */
function calculateSharpeRatio(returns) {
  const stats = calculateBasicStats(returns);
  
  if (stats.stdDev === 0) {
    return 0;
  }
  
  return stats.mean / stats.stdDev;
}

/**
 * Group data by a specified field
 * @param {Object[]} data - Array of objects to group
 * @param {string} field - Field name to group by
 * @returns {Object} - Grouped data object
 */
function groupBy(data, field) {
  if (!Array.isArray(data)) {
    return {};
  }
  
  return data.reduce((groups, item) => {
    const key = item[field] || 'Unknown';
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});
}

/**
 * Create a pivot table from data
 * @param {Object[]} data - Array of objects
 * @param {string} rowField - Field for rows
 * @param {string} colField - Field for columns
 * @param {string} valueField - Field for values
 * @param {string} aggregation - Aggregation type ('sum', 'count', 'mean')
 * @returns {Object} - Pivot table object
 */
function createPivotTable(data, rowField, colField, valueField, aggregation = 'sum') {
  if (!Array.isArray(data) || data.length === 0) {
    return {
      data: {},
      rows: [],
      columns: []
    };
  }
  
  const pivotData = {};
  const rows = new Set();
  const columns = new Set();
  
  // First pass: collect all row and column values
  data.forEach(item => {
    const rowValue = item[rowField] || 'Unknown';
    const colValue = item[colField] || 'Unknown';
    
    rows.add(rowValue);
    columns.add(colValue);
    
    const key = `${rowValue}|${colValue}`;
    if (!pivotData[key]) {
      pivotData[key] = [];
    }
    pivotData[key].push(item[valueField] || 0);
  });
  
  // Second pass: aggregate values
  const result = {};
  Array.from(rows).forEach(row => {
    result[row] = {};
    Array.from(columns).forEach(col => {
      const key = `${row}|${col}`;
      const values = pivotData[key] || [];
      
      let aggregatedValue = 0;
      if (values.length > 0) {
        switch (aggregation) {
          case 'sum':
            aggregatedValue = values.reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
            break;
          case 'count':
            aggregatedValue = values.length;
            break;
          case 'mean':
            const numericValues = values.filter(val => typeof val === 'number');
            aggregatedValue = numericValues.length > 0 ? 
              numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length : 0;
            break;
          default:
            aggregatedValue = values.reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
        }
      }
      
      result[row][col] = aggregatedValue;
    });
  });
  
  return {
    data: result,
    rows: Array.from(rows).sort(),
    columns: Array.from(columns).sort()
  };
}

/**
 * Calculate percentile value
 * @param {number[]} values - Array of numeric values
 * @param {number} percentile - Percentile (0-100)
 * @returns {number} - Percentile value
 */
function calculatePercentile(values, percentile) {
  if (!Array.isArray(values) || values.length === 0) {
    return 0;
  }
  
  const validValues = values.filter(v => typeof v === 'number' && !isNaN(v));
  if (validValues.length === 0) {
    return 0;
  }
  
  const sorted = [...validValues].sort((a, b) => a - b);
  const index = (percentile / 100) * (sorted.length - 1);
  
  if (index === Math.floor(index)) {
    return sorted[index];
  } else {
    const lower = sorted[Math.floor(index)];
    const upper = sorted[Math.ceil(index)];
    return lower + (upper - lower) * (index - Math.floor(index));
  }
}

/**
 * Calculate correlation between two arrays
 * @param {number[]} x - First array
 * @param {number[]} y - Second array
 * @returns {number} - Correlation coefficient (-1 to 1)
 */
function calculateCorrelation(x, y) {
  if (!Array.isArray(x) || !Array.isArray(y) || x.length !== y.length || x.length === 0) {
    return 0;
  }
  
  const n = x.length;
  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = y.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
  const sumY2 = y.reduce((sum, val) => sum + val * val, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  if (denominator === 0) {
    return 0;
  }
  
  return numerator / denominator;
}

/**
 * Calculate moving average
 * @param {number[]} values - Array of numeric values
 * @param {number} window - Window size for moving average
 * @returns {number[]} - Moving average array
 */
function calculateMovingAverage(values, window) {
  if (!Array.isArray(values) || window <= 0 || values.length < window) {
    return [];
  }
  
  const result = [];
  for (let i = window - 1; i < values.length; i++) {
    const slice = values.slice(i - window + 1, i + 1);
    const average = slice.reduce((sum, val) => sum + val, 0) / window;
    result.push(average);
  }
  
  return result;
}

/**
 * Find outliers using IQR method
 * @param {number[]} values - Array of numeric values
 * @param {number} multiplier - IQR multiplier (default 1.5)
 * @returns {Object} - Outliers information
 */
function findOutliers(values, multiplier = 1.5) {
  if (!Array.isArray(values) || values.length === 0) {
    return {
      outliers: [],
      lowerBound: 0,
      upperBound: 0,
      q1: 0,
      q3: 0,
      iqr: 0
    };
  }
  
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = calculatePercentile(sorted, 25);
  const q3 = calculatePercentile(sorted, 75);
  const iqr = q3 - q1;
  
  const lowerBound = q1 - multiplier * iqr;
  const upperBound = q3 + multiplier * iqr;
  
  const outliers = values.filter(val => val < lowerBound || val > upperBound);
  
  return {
    outliers: outliers,
    lowerBound: lowerBound,
    upperBound: upperBound,
    q1: q1,
    q3: q3,
    iqr: iqr
  };
}

/**
 * Format number as currency
 * @param {number} value - Numeric value
 * @param {string} currency - Currency symbol (default '₹')
 * @returns {string} - Formatted currency string
 */
function formatCurrency(value, currency = '₹') {
  if (typeof value !== 'number' || isNaN(value)) {
    return `${currency}0`;
  }
  
  const formatted = Math.abs(value).toLocaleString('en-IN');
  const sign = value < 0 ? '-' : '';
  
  return `${sign}${currency}${formatted}`;
}

/**
 * Format percentage
 * @param {number} value - Numeric value (0-100)
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted percentage string
 */
function formatPercentage(value, decimals = 1) {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0.0%';
  }
  
  return `${value.toFixed(decimals)}%`;
}

/**
 * Sort array of objects by field
 * @param {Object[]} array - Array to sort
 * @param {string} field - Field to sort by
 * @param {string} direction - 'asc' or 'desc'
 * @returns {Object[]} - Sorted array
 */
function sortByField(array, field, direction = 'asc') {
  if (!Array.isArray(array)) {
    return [];
  }
  
  return [...array].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return direction === 'asc' ? aVal - bVal : bVal - aVal;
    } else {
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      if (direction === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    }
  });
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    // Statistical functions
    calculateBasicStats,
    calculatePercentile,
    calculateCorrelation,
    calculateMovingAverage,
    findOutliers,
    
    // Trading-specific calculations
    calculateWinRate,
    calculateProfitLossRatio,
    calculateRiskRewardRatio,
    calculateSharpeRatio,
    
    // Data manipulation
    groupBy,
    createPivotTable,
    sortByField,
    
    // Formatting functions
    formatCurrency,
    formatPercentage
  };
} else {
  // Browser environment
  window.TradingInsights = window.TradingInsights || {};
  window.TradingInsights.Calculations = {
    calculateBasicStats,
    calculatePercentile,
    calculateCorrelation,
    calculateMovingAverage,
    findOutliers,
    calculateWinRate,
    calculateProfitLossRatio,
    calculateRiskRewardRatio,
    calculateSharpeRatio,
    groupBy,
    createPivotTable,
    sortByField,
    formatCurrency,
    formatPercentage
  };
}
