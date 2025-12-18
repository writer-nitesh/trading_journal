// Strategy-based analytics utility functions

/**
 * Calculate comprehensive strategy-based metrics
 * @param {Array} trades - Array of trading data
 * @returns {Object} Strategy analytics grouped by strategy type
 */
export function calculateStrategyAnalytics(trades) {
  if (!trades || trades.length === 0) {
    return {};
  }

  // Group trades by strategy
  const strategiesData = trades.reduce((acc, trade) => {
    const strategy = trade.strategy || 'unknown';
    if (!acc[strategy]) {
      acc[strategy] = [];
    }
    acc[strategy].push(trade);
    return acc;
  }, {});

  // Calculate metrics for each strategy
  const strategyMetrics = {};

  Object.keys(strategiesData).forEach(strategy => {
    const strategyTrades = strategiesData[strategy];
    const totalTrades = strategyTrades.length;
    
    // Separate long and short trades
    const longTrades = strategyTrades.filter(t => t.side === 'LONG');
    const shortTrades = strategyTrades.filter(t => t.side === 'SHORT');
    
    // Win/Loss analysis
    const winningTrades = strategyTrades.filter(t => t.pnl > 0);
    const losingTrades = strategyTrades.filter(t => t.pnl < 0);
    const breakEvenTrades = strategyTrades.filter(t => t.pnl === 0);
    
    const winCount = winningTrades.length;
    const lossCount = losingTrades.length;
    const winRate = totalTrades > 0 ? (winCount / totalTrades) * 100 : 0;
    
    // P&L calculations
    const totalPnL = strategyTrades.reduce((sum, t) => sum + t.pnl, 0);
    const winningPnL = winningTrades.reduce((sum, t) => sum + t.pnl, 0);
    const losingPnL = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0));
    
    // Average calculations
    const avgWinSize = winCount > 0 ? winningPnL / winCount : 0;
    const avgLossSize = lossCount > 0 ? losingPnL / lossCount : 0;
    const avgTradeSize = totalTrades > 0 ? Math.abs(totalPnL) / totalTrades : 0;
    
    // Risk-Reward ratio
    const riskRewardRatio = avgLossSize > 0 ? avgWinSize / avgLossSize : 0;
    
    // Duration analysis
    const avgDuration = calculateAverageDuration(strategyTrades);
    
    // Volume analysis
    const totalVolume = strategyTrades.reduce((sum, t) => sum + (t.quantity * t.entry_price), 0);
    const avgVolume = totalTrades > 0 ? totalVolume / totalTrades : 0;
    
    // Return percentage analysis
    const avgReturnPct = totalTrades > 0 ? 
      strategyTrades.reduce((sum, t) => sum + t.return_pct, 0) / totalTrades : 0;
    
    // Long/Short specific metrics
    const longWins = longTrades.filter(t => t.pnl > 0).length;
    const shortWins = shortTrades.filter(t => t.pnl > 0).length;
    const longWinRate = longTrades.length > 0 ? (longWins / longTrades.length) * 100 : 0;
    const shortWinRate = shortTrades.length > 0 ? (shortWins / shortTrades.length) * 100 : 0;
    
    strategyMetrics[strategy] = {
      strategy,
      totalTrades,
      longTrades: longTrades.length,
      shortTrades: shortTrades.length,
      winCount,
      lossCount,
      breakEvenCount: breakEvenTrades.length,
      winRate: parseFloat(winRate.toFixed(2)),
      longWinRate: parseFloat(longWinRate.toFixed(2)),
      shortWinRate: parseFloat(shortWinRate.toFixed(2)),
      totalPnL: parseFloat(totalPnL.toFixed(2)),
      winningPnL: parseFloat(winningPnL.toFixed(2)),
      losingPnL: parseFloat(losingPnL.toFixed(2)),
      avgWinSize: parseFloat(avgWinSize.toFixed(2)),
      avgLossSize: parseFloat(avgLossSize.toFixed(2)),
      avgTradeSize: parseFloat(avgTradeSize.toFixed(2)),
      riskRewardRatio: parseFloat(riskRewardRatio.toFixed(2)),
      avgDuration: parseFloat(avgDuration.toFixed(1)),
      totalVolume: parseFloat(totalVolume.toFixed(2)),
      avgVolume: parseFloat(avgVolume.toFixed(2)),
      avgReturnPct: parseFloat(avgReturnPct.toFixed(2)),
      profitFactor: losingPnL > 0 ? parseFloat((winningPnL / losingPnL).toFixed(2)) : 0,
      trades: strategyTrades
    };
  });

  return strategyMetrics;
}

/**
 * Calculate average trade duration for a strategy
 * @param {Array} trades - Array of trades for a strategy
 * @returns {number} Average duration in hours
 */
function calculateAverageDuration(trades) {
  // Simulated duration calculation - in real app, this would use actual entry/exit timestamps
  const baseHours = [0.5, 1, 2, 4, 8, 24, 48]; // Different holding periods
  
  return trades.reduce((sum, trade, index) => {
    // Use trade characteristics to determine duration
    const seedRandom = (seed) => {
      const x = Math.sin(seed * 10000) * 10000;
      return x - Math.floor(x);
    };
    
    const durationIndex = Math.floor(seedRandom(index + trade.symbol.length) * baseHours.length);
    return sum + baseHours[durationIndex];
  }, 0) / trades.length;
}

/**
 * Get strategy comparison data for charts
 * @param {Object} strategyMetrics - Strategy metrics object
 * @returns {Array} Array formatted for chart consumption
 */
export function getStrategyComparisonData(strategyMetrics) {
  return Object.values(strategyMetrics).map(strategy => ({
    strategy: strategy.strategy,
    winRate: strategy.winRate,
    totalTrades: strategy.totalTrades,
    totalPnL: strategy.totalPnL,
    avgWinSize: strategy.avgWinSize,
    avgLossSize: strategy.avgLossSize,
    riskReward: strategy.riskRewardRatio,
    profitFactor: strategy.profitFactor,
    winCount: strategy.winCount,
    lossCount: strategy.lossCount
  }));
}

/**
 * Get top performing strategies
 * @param {Object} strategyMetrics - Strategy metrics object
 * @param {string} metric - Metric to sort by ('winRate', 'totalPnL', 'profitFactor', etc.)
 * @param {number} limit - Number of top strategies to return
 * @returns {Array} Sorted array of top strategies
 */
export function getTopStrategies(strategyMetrics, metric = 'totalPnL', limit = 5) {
  return Object.values(strategyMetrics)
    .sort((a, b) => b[metric] - a[metric])
    .slice(0, limit);
}

/**
 * Calculate overall portfolio metrics from strategy data
 * @param {Object} strategyMetrics - Strategy metrics object
 * @returns {Object} Overall portfolio metrics
 */
export function calculatePortfolioMetrics(strategyMetrics) {
  const strategies = Object.values(strategyMetrics);
  
  if (strategies.length === 0) {
    return {
      totalStrategies: 0,
      totalTrades: 0,
      overallWinRate: 0,
      totalPnL: 0,
      bestStrategy: null,
      worstStrategy: null,
      avgTradesPerStrategy: 0
    };
  }
  
  const totalTrades = strategies.reduce((sum, s) => sum + s.totalTrades, 0);
  const totalWinCount = strategies.reduce((sum, s) => sum + s.winCount, 0);
  const totalPnL = strategies.reduce((sum, s) => sum + s.totalPnL, 0);
  
  const bestStrategy = strategies.reduce((best, current) => 
    current.totalPnL > best.totalPnL ? current : best
  );
  
  const worstStrategy = strategies.reduce((worst, current) => 
    current.totalPnL < worst.totalPnL ? current : worst
  );
  
  return {
    totalStrategies: strategies.length,
    totalTrades,
    overallWinRate: totalTrades > 0 ? parseFloat(((totalWinCount / totalTrades) * 100).toFixed(2)) : 0,
    totalPnL: parseFloat(totalPnL.toFixed(2)),
    bestStrategy: bestStrategy.strategy,
    worstStrategy: worstStrategy.strategy,
    avgTradesPerStrategy: parseFloat((totalTrades / strategies.length).toFixed(1))
  };
}

/**
 * Filter strategy data based on criteria
 * @param {Object} strategyMetrics - Strategy metrics object
 * @param {Object} filters - Filter criteria
 * @returns {Object} Filtered strategy metrics
 */
export function filterStrategyData(strategyMetrics, filters = {}) {
  const { minTrades = 0, minWinRate = 0, strategies = [] } = filters;
  
  const filtered = {};
  
  Object.keys(strategyMetrics).forEach(strategy => {
    const data = strategyMetrics[strategy];
    
    // Apply filters
    const meetsMinTrades = data.totalTrades >= minTrades;
    const meetsMinWinRate = data.winRate >= minWinRate;
    const isSelectedStrategy = strategies.length === 0 || strategies.includes(strategy);
    
    if (meetsMinTrades && meetsMinWinRate && isSelectedStrategy) {
      filtered[strategy] = data;
    }
  });
  
  return filtered;
}
