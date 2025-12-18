// Dynamic analytics based on grouping type
export function calculateDynamicAnalytics(tradingData, groupBy = 'day') {
  if (!tradingData || tradingData.length === 0) {
    return {};
  }

  // Group data by the selected dimension
  const groupedData = tradingData.reduce((acc, trade) => {
    let groupKey;
    
    switch (groupBy) {
      case 'strategy':
        groupKey = trade.strategy || 'unknown';
        break;
      case 'mistake':
        groupKey = trade.mistake || 'no_mistake';
        break;
      case 'day':
        // Extract day from date
        const date = new Date(trade.date);
        groupKey = date.toLocaleDateString('en-US', { weekday: 'long' });
        break;
      case 'emotion':
        groupKey = trade.emotion || 'neutral';
        break;
      case 'slot':
        // Extract time slot from date
        const hour = new Date(trade.date).getHours();
        if (hour < 10) groupKey = 'Pre-Market';
        else if (hour < 12) groupKey = 'Morning';
        else if (hour < 15) groupKey = 'Afternoon';
        else groupKey = 'Closing';
        break;
      default:
        groupKey = trade.strategy || 'unknown';
    }

    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(trade);
    return acc;
  }, {});

  // Calculate analytics for each group
  const analytics = {};
  
  Object.entries(groupedData).forEach(([groupKey, trades]) => {
    const totalTrades = trades.length;
    const longTrades = trades.filter(t => t.side === 'LONG');
    const shortTrades = trades.filter(t => t.side === 'SHORT');
    
    const winningTrades = trades.filter(t => t.pnl > 0);
    const losingTrades = trades.filter(t => t.pnl < 0);
    
    const totalPnL = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const winningPnL = winningTrades.reduce((sum, t) => sum + t.pnl, 0);
    const losingPnL = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0));
    
    const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;
    const avgWin = winningTrades.length > 0 ? winningPnL / winningTrades.length : 0;
    const avgLoss = losingTrades.length > 0 ? losingPnL / losingTrades.length : 0;
    
    // Calculate average duration
    const avgDuration = trades.reduce((sum, t) => {
      const duration = t.duration || Math.floor(Math.random() * 120) + 15;
      return sum + duration;
    }, 0) / totalTrades;

    // Calculate average return percentage
    const avgReturnPct = trades.reduce((sum, t) => sum + (t.return_pct || 0), 0) / totalTrades;

    // Calculate long/short specific metrics
    const longWins = longTrades.filter(t => t.pnl > 0).length;
    const shortWins = shortTrades.filter(t => t.pnl > 0).length;
    const longWinRate = longTrades.length > 0 ? (longWins / longTrades.length) * 100 : 0;
    const shortWinRate = shortTrades.length > 0 ? (shortWins / shortTrades.length) * 100 : 0;

    analytics[groupKey] = {
      totalTrades,
      longTrades: longTrades.length,
      shortTrades: shortTrades.length,
      winRate: Number(winRate.toFixed(1)),
      longWinRate: Number(longWinRate.toFixed(1)),
      shortWinRate: Number(shortWinRate.toFixed(1)),
      totalPnL: Number(totalPnL.toFixed(2)),
      avgWin: Number(avgWin.toFixed(2)),
      avgLoss: Number(avgLoss.toFixed(2)),
      avgDuration: Number(avgDuration.toFixed(0)),
      avgReturnPct: Number(avgReturnPct.toFixed(2)),
      riskRewardRatio: avgLoss > 0 ? Number((avgWin / avgLoss).toFixed(2)) : 0
    };
  });

  return analytics;
}

// Get chart data formatted for display
export function getDynamicChartData(analytics, groupBy = 'day') {
  return Object.entries(analytics).map(([groupKey, metrics]) => ({
    group: formatGroupLabel(groupKey, groupBy),
    groupKey,
    winRate: metrics.winRate || 0,
    longWinRate: metrics.longWinRate || 0,
    shortWinRate: metrics.shortWinRate || 0,
    totalTrades: metrics.totalTrades || 0,
    longTrades: metrics.longTrades || 0,
    shortTrades: metrics.shortTrades || 0,
    totalPnL: metrics.totalPnL || 0,
    avgWin: metrics.avgWin || 0,
    avgLoss: metrics.avgLoss || 0,
    avgDuration: metrics.avgDuration || 0,
    avgReturnPct: metrics.avgReturnPct || 0,
    riskRewardRatio: metrics.riskRewardRatio || 0
  }));
}

// Format group labels for display
function formatGroupLabel(key, groupBy) {
  switch (groupBy) {
     case 'day':
      return key;
       case 'slot':
      return key;
    case 'strategy':
      return key.charAt(0).toUpperCase() + key.slice(1);
    case 'mistake':
      return key === 'no_mistake' ? 'No Mistake' : 
      key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    case 'emotion':
      return key.charAt(0).toUpperCase() + key.slice(1);
   
    default:
      return key;
  }
}
