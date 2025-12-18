/**
 * Test Direction Analysis Implementation
 * Quick test to verify direction analysis is working
 */

const TradingInsights = require('./src/lib/trading-insights/trading-insights-main.js');

// Sample test data
const sampleTradingData = [
  {
    Date: '15/1/2025',
    Symbol: 'BANKNIFTY24JAN50000CE',
    Side: 'LONG',
    Quantity: 150,
    'Entry Price': '₹150.45',
    'Exit Price': '₹165.30',
    'P&L': '₹2,227.50',
    'Return %': '9.87%',
    'Entry Time': '09:30:00',
    'Exit Time': '09:35:30',
    Duration: '5m 30s'
  },
  {
    Date: '16/1/2025',
    Symbol: 'NIFTY24JAN22000CE',
    Side: 'SHORT',
    Quantity: 75,
    'Entry Price': '₹85.20',
    'Exit Price': '₹70.15',
    'P&L': '₹1,128.75',
    'Return %': '17.67%',
    'Entry Time': '14:15:00',
    'Exit Time': '14:45:30',
    Duration: '30m 30s'
  },
  {
    Date: '17/1/2025',
    Symbol: 'RELIANCE',
    Side: 'LONG',
    Quantity: 10,
    'Entry Price': '₹2,450.00',
    'Exit Price': '₹2,380.00',
    'P&L': '-₹700.00',
    'Return %': '-2.86%',
    'Entry Time': '10:00:00',
    'Exit Time': '15:30:00',
    Duration: '5h 30m'
  },
  {
    Date: '18/1/2025',
    Symbol: 'BANKNIFTY24JAN48000PE',
    Side: 'LONG',
    Quantity: 225,
    'Entry Price': '₹120.75',
    'Exit Price': '₹145.30',
    'P&L': '₹5,523.75',
    'Return %': '20.35%',
    'Entry Time': '09:45:00',
    'Exit Time': '10:02:15',
    Duration: '17m 15s'
  },
  {
    Date: '19/1/2025',
    Symbol: 'NIFTY24JAN21500PE',
    Side: 'SHORT',
    Quantity: 50,
    'Entry Price': '₹95.40',
    'Exit Price': '₹110.25',
    'P&L': '-₹742.50',
    'Return %': '-15.56%',
    'Entry Time': '13:30:00',
    'Exit Time': '13:32:45',
    Duration: '2m 45s'
  }
];

console.log('🔍 Testing Direction Analysis Implementation...\n');

try {
  // Run all trading insights
  const results = TradingInsights.runAllTradingInsights(sampleTradingData);
  
  console.log('✅ Analysis completed successfully!\n');
  
  // Check if direction analyses are included
  console.log('📊 Completed Insights:', results.metadata.completedInsights.length);
  results.metadata.completedInsights.forEach((insight, index) => {
    console.log(`   ${index + 1}. ${insight}`);
  });
  
  console.log('\n📈 Direction Symbol Analysis Present:', !!results.insights.directionSymbolAnalysis);
  console.log('📊 Direction CE/PE Analysis Present:', !!results.insights.directionCEPEAnalysis);
  
  // Show direction analysis summaries if available
  if (results.conciseSummaries) {
    console.log('\n💡 Direction Analysis Summaries:');
    if (results.conciseSummaries.directionSymbolAnalysis) {
      console.log('   📈 Direction-Symbol:', results.conciseSummaries.directionSymbolAnalysis.substring(0, 100) + '...');
    }
    if (results.conciseSummaries.directionCEPEAnalysis) {
      console.log('   📊 Direction-CE/PE:', results.conciseSummaries.directionCEPEAnalysis.substring(0, 100) + '...');
    }
  }
  
  // Show any errors
  if (results.errors.length > 0) {
    console.log('\n⚠️ Errors:', results.errors);
  }
  
  console.log('\n🎉 Direction Analysis integration test completed!');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error(error.stack);
}
