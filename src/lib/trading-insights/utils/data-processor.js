/**
 * Data Processor - JSON parsing and cleaning utilities
 * Handles conversion of raw trading data (JSON) into standardized format for analysis
 */

/**
 * Clean currency string and convert to number
 * @param {string|number} value - Currency value (e.g., "₹1,500", "$1500")
 * @returns {number} - Cleaned numeric value
 */
function cleanCurrencyValue(value) {
  if (typeof value === 'number') {
    return value;
  }
  
  if (typeof value === 'string') {
    // Remove currency symbols, commas, and whitespace
    const cleaned = value.replace(/[₹$,\s]/g, '').replace(/[^\d.-]/g, '');
    const number = parseFloat(cleaned);
    return isNaN(number) ? 0 : number;
  }
  
  return 0;
}

/**
 * Parse duration string to seconds
 * @param {string} duration - Duration string (e.g., "5m 30s", "1h 15m", "2m")
 * @returns {number} - Duration in seconds
 */
function parseDurationToSeconds(duration) {
  if (typeof duration !== 'string') {
    return 0;
  }
  
  let totalSeconds = 0;
  
  // Match hours
  const hours = duration.match(/(\d+)h/);
  if (hours) {
    totalSeconds += parseInt(hours[1]) * 3600;
  }
  
  // Match minutes
  const minutes = duration.match(/(\d+)m/);
  if (minutes) {
    totalSeconds += parseInt(minutes[1]) * 60;
  }
  
  // Match seconds
  const seconds = duration.match(/(\d+)s/);
  if (seconds) {
    totalSeconds += parseInt(seconds[1]);
  }
  
  return totalSeconds;
}

/**
 * Parse date string to Date object
 * @param {string} dateStr - Date string in various formats
 * @returns {Date} - Parsed date object
 */
function parseDateString(dateStr) {
  if (!dateStr) return null;
  
  // Handle different date formats
  if (typeof dateStr === 'string') {
    // Try DD/MM/YYYY format first
    const ddmmyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyyy) {
      return new Date(ddmmyyy[3], ddmmyyy[2] - 1, ddmmyyy[1]);
    }
    
    // Try MM/DD/YYYY format
    const mmddyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (mmddyyyy) {
      // Assume MM/DD/YYYY if first number > 12
      if (parseInt(mmddyyyy[1]) > 12) {
        return new Date(mmddyyyy[3], mmddyyyy[1] - 1, mmddyyyy[2]);
      }
    }
    
    // Try standard Date parsing
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  
  return null;
}

/**
 * Parse time string to hours and minutes
 * @param {string} timeStr - Time string (e.g., "09:30:00", "14:25")
 * @returns {Object} - {hour, minute, second}
 */
function parseTimeString(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') {
    return { hour: 0, minute: 0, second: 0 };
  }
  
  const timeParts = timeStr.split(':');
  return {
    hour: parseInt(timeParts[0]) || 0,
    minute: parseInt(timeParts[1]) || 0,
    second: parseInt(timeParts[2]) || 0
  };
}

/**
 * Get day name from date
 * @param {Date} date - Date object
 * @returns {string} - Day name (e.g., "Monday")
 */
function getDayName(date) {
  if (!date || !(date instanceof Date)) return 'Unknown';
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return dayNames[date.getDay()];
}

/**
 * Categorize instrument from symbol
 * @param {string} symbol - Trading symbol
 * @returns {string} - Instrument category
 */
function categorizeInstrument(symbol) {
  if (!symbol || typeof symbol !== 'string') {
    return 'OTHER';
  }
  
  const symbolUpper = symbol.toUpperCase();
  
  if (symbolUpper.includes('BANKNIFTY')) {
    return 'BANKNIFTY';
  } else if (symbolUpper.includes('NIFTY') && !symbolUpper.includes('BANKNIFTY')) {
    return 'NIFTY';
  } else if (symbolUpper.includes('SENSEX')) {
    return 'SENSEX';
  } else if (symbolUpper.includes('FINNIFTY')) {
    return 'FINNIFTY';
  } else if (['INFY', 'HDFCBANK', 'RELIANCE', 'ICICIBANK', 'TCS', 'ITC', 'IDEA', 'SBIN', 'WIPRO'].some(stock => symbolUpper.includes(stock))) {
    return 'STOCKS';
  } else {
    return 'OTHER';
  }
}

/**
 * Get duration category from seconds
 * @param {number} seconds - Duration in seconds
 * @returns {string} - Duration category
 */
function getDurationCategory(seconds) {
  if (seconds < 60) {
    return '<1m';
  } else if (seconds < 300) {
    return '1-5m';
  } else if (seconds < 900) {
    return '5-15m';
  } else if (seconds < 1800) {
    return '15-30m';
  } else if (seconds < 3600) {
    return '30-60m';
  } else if (seconds < 7200) {
    return '1-2h';
  } else {
    return '>2h';
  }
}

/**
 * Process raw trading data into standardized format
 * @param {Object[]} rawData - Raw trading data from JSON
 * @returns {Object[]} - Processed and standardized data
 */
function processRawTradingData(rawData) {
  if (!Array.isArray(rawData)) {
    throw new Error('Trading data must be an array');
  }
  
  const processed = [];
  
  for (let i = 0; i < rawData.length; i++) {
    const trade = rawData[i];
    
    // Skip invalid records
    if (!trade || typeof trade !== 'object') {
      continue;
    }
    
    try {
      // Parse date
      const dateObj = parseDateString(trade.Date || trade.date);
      if (!dateObj) {
        console.warn(`Invalid date in trade ${i}: ${trade.Date || trade.date}`);
        continue;
      }
      
      // Parse entry time
      const entryTime = parseTimeString(trade['Entry Time'] || trade.entryTime || trade.entry_time);
      
      // Parse exit time
      const exitTime = parseTimeString(trade['Exit Time'] || trade.exitTime || trade.exit_time);
      
      // Clean P&L
      const pnl = cleanCurrencyValue(trade['P&L'] || trade.PnL || trade.pnl || trade['Realized P&L'] || 0);
      
      // Parse duration
      let durationSeconds = 0;
      if (trade.Duration || trade.duration) {
        durationSeconds = parseDurationToSeconds(trade.Duration || trade.duration);
      } else if (trade['Exit Time'] && trade['Entry Time']) {
        // Calculate duration from entry/exit times if not provided
        const entryMinutes = entryTime.hour * 60 + entryTime.minute;
        const exitMinutes = exitTime.hour * 60 + exitTime.minute;
        durationSeconds = Math.max(0, (exitMinutes - entryMinutes) * 60);
      }
      
      // Process the trade
      const processedTrade = {
        // Original data
        originalDate: trade.Date || trade.date,
        originalSymbol: trade.Symbol || trade.symbol,
        originalPnL: trade['P&L'] || trade.PnL || trade.pnl,
        originalDuration: trade.Duration || trade.duration,
        
        // Processed data
        date: dateObj,
        dayOfWeek: getDayName(dateObj),
        entryTime: entryTime,
        exitTime: exitTime,
        symbol: trade.Symbol || trade.symbol || '',
        instrument: categorizeInstrument(trade.Symbol || trade.symbol),
        pnl: pnl,
        durationSeconds: durationSeconds,
        durationCategory: getDurationCategory(durationSeconds),
        
        // Trading metadata
        quantity: parseInt(trade.Quantity || trade.quantity || 0),
        entryPrice: cleanCurrencyValue(trade['Entry Price'] || trade.entryPrice || 0),
        exitPrice: cleanCurrencyValue(trade['Exit Price'] || trade.exitPrice || 0),
        side: trade.Side || trade.side || 'Unknown',
        
        // Calculated fields
        isProfit: pnl > 0,
        isLoss: pnl < 0,
        tradeOutcome: pnl > 0 ? 'Profit' : 'Loss',
        
        // Index for tracking
        originalIndex: i
      };
      
      processed.push(processedTrade);
      
    } catch (error) {
      console.warn(`Error processing trade ${i}:`, error.message);
      continue;
    }
  }
  
  console.log(`Data processing complete: ${processed.length} valid trades from ${rawData.length} records`);
  
  return processed;
}

/**
 * Validate trading data structure
 * @param {Object[]} data - Trading data to validate
 * @returns {Object} - Validation result
 */
function validateTradingData(data) {
  const validation = {
    isValid: true,
    errors: [],
    warnings: [],
    summary: {
      totalRecords: 0,
      validRecords: 0,
      invalidRecords: 0,
      missingFields: {}
    }
  };
  
  if (!Array.isArray(data)) {
    validation.isValid = false;
    validation.errors.push('Data must be an array');
    return validation;
  }
  
  validation.summary.totalRecords = data.length;
  
  if (data.length === 0) {
    validation.isValid = false;
    validation.errors.push('No data provided');
    return validation;
  }
  
  // Check each record
  const requiredFields = ['Date', 'P&L'];
  const optionalFields = ['Symbol', 'Entry Time', 'Exit Time', 'Duration'];
  
  for (let i = 0; i < data.length; i++) {
    const record = data[i];
    let recordValid = true;
    
    if (!record || typeof record !== 'object') {
      validation.summary.invalidRecords++;
      validation.warnings.push(`Record ${i}: Invalid record structure`);
      continue;
    }
    
    // Check required fields
    for (const field of requiredFields) {
      if (!record[field] && !record[field.toLowerCase()]) {
        recordValid = false;
        validation.summary.missingFields[field] = (validation.summary.missingFields[field] || 0) + 1;
      }
    }
    
    if (recordValid) {
      validation.summary.validRecords++;
    } else {
      validation.summary.invalidRecords++;
    }
  }
  
  // Check if we have enough valid data
  if (validation.summary.validRecords < 3) {
    validation.isValid = false;
    validation.errors.push('Insufficient valid trading data (minimum 3 records required)');
  }
  
  // Add warnings for missing optional fields
  for (const field of optionalFields) {
    const missing = validation.summary.missingFields[field] || 0;
    if (missing > validation.summary.totalRecords * 0.5) {
      validation.warnings.push(`${field} missing in ${missing} records (${Math.round(missing/validation.summary.totalRecords*100)}%)`);
    }
  }
  
  return validation;
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    // Main processing function
    processRawTradingData,
    validateTradingData,
    
    // Individual utility functions
    cleanCurrencyValue,
    parseDurationToSeconds,
    parseDateString,
    parseTimeString,
    getDayName,
    categorizeInstrument,
    getDurationCategory
  };
} else {
  // Browser environment
  window.TradingInsights = window.TradingInsights || {};
  window.TradingInsights.DataProcessor = {
    processRawTradingData,
    validateTradingData,
    cleanCurrencyValue,
    parseDurationToSeconds,
    parseDateString,
    parseTimeString,
    getDayName,
    categorizeInstrument,
    getDurationCategory
  };
}
