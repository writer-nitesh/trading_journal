/**
 * Trading Insights - Consolidated Analysis Module
 * JavaScript implementation of all 9 trading insights from insights10.ipynb
 * 
 * This is the main module that provides access to all individual analysis modules
 * and can run comprehensive trading analysis on JSON data.
 */

// Import all individual analysis modules
const DayAnalysis = require('./insight-calculators/day-analysis.js');
const DurationAnalysis = require('./insight-calculators/duration-analysis.js');
const LotSizeAnalysis = require('./insight-calculators/lot-size-analysis.js');
const TradeCountAnalysis = require('./insight-calculators/trade-count-analysis.js');
const TradeSequenceAnalysis = require('./insight-calculators/trade-sequence-analysis.js');
const TimeInstrumentAnalysis = require('./insight-calculators/time-instrument-analysis.js');
const DirectionAnalysis = require('./insight-calculators/direction-analysis.js');
const DataProcessor = require('./utils/data-processor.js');

/**
 * Main function to run all trading insights
 * @param {Object[]} tradingData - Array of trading records in JSON format
 * @param {Object} options - Configuration options
 * @returns {Object} - Complete analysis results
 */
function runAllTradingInsights(tradingData, options = {}) {
	// Validate input data
	if (!Array.isArray(tradingData)) {
		throw new Error('Trading data must be an array of objects');
	}
  
	// Validate the raw trading data first
	const validation = DataProcessor.validateTradingData(tradingData);
	if (!validation.isValid) {
		console.warn('Data validation warnings:', validation.warnings);
		if (validation.errors.length > 0) {
			throw new Error(`Data validation failed: ${validation.errors.join(', ')}`);
		}
	}
  
	// Process and clean the raw trading data
	let processedData;
	try {
		processedData = DataProcessor.processRawTradingData(tradingData);
	} catch (error) {
		throw new Error(`Data processing failed: ${error.message}`);
	}

	const results = {
		success: true,
		insights: {},
		errors: [],
		metadata: {
			totalTrades: processedData.length,
			originalDataCount: tradingData.length,
			analysisDate: new Date(),
			completedInsights: [],
			failedInsights: []
		}
	};

	console.log(`\n🚀 Starting comprehensive trading analysis on ${results.metadata.totalTrades} processed trades (from ${results.metadata.originalDataCount} original records)...\n`);

	// 1. Day of Week vs P&L Analysis
	try {
		console.log('📊 Running Insight #1: Day of Week vs P&L Analysis...');
		const dayResult = DayAnalysis.analyzeDayOfWeekPnL(processedData, options);
		if (dayResult.success) {
			results.insights.dayOfWeekAnalysis = dayResult;
			results.metadata.completedInsights.push('Day of Week Analysis');
			console.log('✅ Day of Week analysis completed successfully');
		} else {
			results.errors.push(`Day Analysis Error: ${dayResult.error}`);
			results.metadata.failedInsights.push('Day of Week Analysis');
			console.log('❌ Day of Week analysis failed');
		}
	} catch (error) {
		results.errors.push(`Day Analysis Exception: ${error.message}`);
		results.metadata.failedInsights.push('Day of Week Analysis');
		console.log('❌ Day of Week analysis threw exception');
	}

	// 2. Holding Duration × Outcome Analysis
	try {
		console.log('⏱️  Running Insight #2: Duration × Outcome Analysis...');
		const durationResult = DurationAnalysis.analyzeDurationOutcomePnL(processedData, options);
		if (durationResult.success) {
			results.insights.durationAnalysis = durationResult;
			results.metadata.completedInsights.push('Duration × Outcome Analysis');
			console.log('✅ Duration × Outcome analysis completed successfully');
		} else {
			results.errors.push(`Duration Analysis Error: ${durationResult.error}`);
			results.metadata.failedInsights.push('Duration × Outcome Analysis');
			console.log('❌ Duration × Outcome analysis failed');
		}
	} catch (error) {
		results.errors.push(`Duration Analysis Exception: ${error.message}`);
		results.metadata.failedInsights.push('Duration × Outcome Analysis');
		console.log('❌ Duration × Outcome analysis threw exception');
	}

	// 3. Lot Size × P&L Analysis
	try {
		console.log('💰 Running Insight #3: Lot Size × P&L Analysis...');
		const lotSizeResult = LotSizeAnalysis.analyzeLotSizePnL(processedData, options);
		if (lotSizeResult.success) {
			results.insights.lotSizeAnalysis = lotSizeResult;
			results.metadata.completedInsights.push('Lot Size × P&L Analysis');
			console.log('✅ Lot Size × P&L analysis completed successfully');
		} else {
			results.errors.push(`Lot Size Analysis Error: ${lotSizeResult.error}`);
			results.metadata.failedInsights.push('Lot Size × P&L Analysis');
			console.log('❌ Lot Size × P&L analysis failed');
		}
	} catch (error) {
		results.errors.push(`Lot Size Analysis Exception: ${error.message}`);
		results.metadata.failedInsights.push('Lot Size × P&L Analysis');
		console.log('❌ Lot Size × P&L analysis threw exception');
	}

	// 4. Trade Count per Day × P&L Analysis
	try {
		console.log('📊 Running Insight #4: Trade Count per Day × P&L Analysis...');
		const tradeCountResult = TradeCountAnalysis.analyzeTradeCountPnL(processedData, options);
		if (tradeCountResult.success) {
			results.insights.tradeCountAnalysis = tradeCountResult;
			results.metadata.completedInsights.push('Trade Count per Day × P&L Analysis');
			console.log('✅ Trade Count per Day × P&L analysis completed successfully');
		} else {
			results.errors.push(`Trade Count Analysis Error: ${tradeCountResult.error}`);
			results.metadata.failedInsights.push('Trade Count per Day × P&L Analysis');
			console.log('❌ Trade Count per Day × P&L analysis failed');
		}
	} catch (error) {
		results.errors.push(`Trade Count Analysis Exception: ${error.message}`);
		results.metadata.failedInsights.push('Trade Count per Day × P&L Analysis');
		console.log('❌ Trade Count per Day × P&L analysis threw exception');
	}

	// 5. Trade Sequence Analysis (First Trade vs Later Trades)
	try {
		console.log('🎯 Running Insight #5: Trade Sequence Analysis...');
		const sequenceResult = TradeSequenceAnalysis.analyzeTradeSequencePnL(processedData, options);
		if (sequenceResult.success) {
			results.insights.tradeSequenceAnalysis = sequenceResult;
			results.metadata.completedInsights.push('Trade Sequence Analysis');
			console.log('✅ Trade Sequence analysis completed successfully');
		} else {
			results.errors.push(`Trade Sequence Analysis Error: ${sequenceResult.error}`);
			results.metadata.failedInsights.push('Trade Sequence Analysis');
			console.log('❌ Trade Sequence analysis failed');
		}
	} catch (error) {
		results.errors.push(`Trade Sequence Analysis Exception: ${error.message}`);
		results.metadata.failedInsights.push('Trade Sequence Analysis');
		console.log('❌ Trade Sequence analysis threw exception');
	}

	// // 6. Time of Day × Instrument P&L Analysis
	// try {
	// 	console.log('⏰ Running Insight #6: Time of Day × Instrument P&L Analysis...');
	// 	const timeInstrumentResult = TimeInstrumentAnalysis.analyzeTimeInstrumentPnL(processedData, options);
	// 	if (timeInstrumentResult.success) {
	// 		results.insights.timeInstrumentAnalysis = timeInstrumentResult;
	// 		results.metadata.completedInsights.push('Time of Day × Instrument P&L Analysis');
	// 		console.log('✅ Time of Day × Instrument P&L analysis completed successfully');
	// 	} else {
	// 		results.errors.push(`Time of Day × Instrument P&L Analysis Error: ${timeInstrumentResult.error}`);
	// 		results.metadata.failedInsights.push('Time of Day × Instrument P&L Analysis');
	// 		console.log('❌ Time of Day × Instrument P&L analysis failed');
	// 	}
	// } catch (error) {
	// 	results.errors.push(`Time of Day × Instrument P&L Analysis Exception: ${error.message}`);
	// 	results.metadata.failedInsights.push('Time of Day × Instrument P&L Analysis');
	// 	console.log('❌ Time of Day × Instrument P&L analysis threw exception');
	// }
	// 7. Direction × Symbol P&L Analysis
	try {
		console.log('📈 Running Insight #7: Direction × Symbol P&L Analysis...');
		const directionSymbolResult = DirectionAnalysis.analyzeDirectionSymbolPnL(processedData, options);
		if (directionSymbolResult.success) {
			results.insights.directionSymbolAnalysis = directionSymbolResult;
			results.metadata.completedInsights.push('Direction × Symbol P&L Analysis');
			console.log('✅ Direction × Symbol P&L analysis completed successfully');
		} else {
			results.errors.push(`Direction × Symbol P&L Analysis Error: ${directionSymbolResult.error}`);
			results.metadata.failedInsights.push('Direction × Symbol P&L Analysis');
			console.log('❌ Direction × Symbol P&L analysis failed');
		}
	} catch (error) {
		results.errors.push(`Direction × Symbol P&L Analysis Exception: ${error.message}`);
		results.metadata.failedInsights.push('Direction × Symbol P&L Analysis');
		console.log('❌ Direction × Symbol P&L analysis threw exception');
	}

	// 8. Direction × CE/PE P&L Analysis
	try {
		console.log('📊 Running Insight #8: Direction × CE/PE P&L Analysis...');
		const directionCEPEResult = DirectionAnalysis.analyzeDirectionCEPEPnL(processedData, options);
		if (directionCEPEResult.success) {
			results.insights.directionCEPEAnalysis = directionCEPEResult;
			results.metadata.completedInsights.push('Direction × CE/PE P&L Analysis');
			console.log('✅ Direction × CE/PE P&L analysis completed successfully');
		} else {
			results.errors.push(`Direction × CE/PE P&L Analysis Error: ${directionCEPEResult.error}`);
			results.metadata.failedInsights.push('Direction × CE/PE P&L Analysis');
			console.log('❌ Direction × CE/PE P&L analysis failed');
		}
	} catch (error) {
		results.errors.push(`Direction × CE/PE P&L Analysis Exception: ${error.message}`);
		results.metadata.failedInsights.push('Direction × CE/PE P&L Analysis');
		console.log('❌ Direction × CE/PE P&L analysis threw exception');
	}

	// TODO: Add remaining insights

	// Calculate overall success
	results.success = results.errors.length === 0;

	// Generate concise summaries
	results.conciseSummaries = generateConciseSummaries(results);

	return results;
}

/**
 * Generate concise, prioritized summaries for each insight
 * @param {Object} results - Results from runAllTradingInsights
 * @returns {Object} - Concise summaries
 */
function generateConciseSummaries(results) {
	const summaries = {};

	// Day of Week Analysis Summary
	if (results.insights.dayOfWeekAnalysis?.success) {
		const dayData = results.insights.dayOfWeekAnalysis.data;
		const sortedDays = [...dayData.dayPnLTable].sort((a, b) => b.totalPnL - a.totalPnL);
		const bestDay = sortedDays[0];
		const worstDay = sortedDays[sortedDays.length - 1];
		
		let summary = '';
		if (bestDay.totalPnL > 0 && worstDay.totalPnL < 0) {
			// Both good and bad days exist
			summary = `Your strongest trading day is ${bestDay.day} with ₹${Math.abs(bestDay.totalPnL).toLocaleString('en-IN')} profit. Consider avoiding ${worstDay.day} - you've lost ₹${Math.abs(worstDay.totalPnL).toLocaleString('en-IN')} on this day.`;
		} else if (bestDay.totalPnL > 0) {
			// All days profitable, but some better than others
			summary = `${bestDay.day} is your most profitable day with ₹${Math.abs(bestDay.totalPnL).toLocaleString('en-IN')} earned. Focus more trading on this day.`;
		} else {
			// All days losing
			summary = `All trading days are showing losses. Consider taking a break and reviewing your strategy before continuing.`;
		}
		
		summaries.dayOfWeekAnalysis = summary;
	}

	// Duration Analysis Summary
	if (results.insights.durationAnalysis?.success) {
		const durationData = results.insights.durationAnalysis.data;
		// Use the same sorting as the analysis module - by total P&L, not average P&L
		const sortedDurations = [...durationData.durationTable]; // Already sorted by total P&L
		const bestDuration = sortedDurations[0]; // Highest total P&L
		
		let summary = '';
		if (bestDuration.avgPnL > 0) {
			// Convert duration to readable format
			let durationText = '';
			switch(bestDuration.duration) {
				case '<1m': durationText = 'less than 1 minute'; break;
				case '1-5m': durationText = '1 to 5 minutes'; break;
				case '5-15m': durationText = '5 to 15 minutes'; break;
				case '15-30m': durationText = '15 to 30 minutes'; break;
				case '30-60m': durationText = '30 minutes to 1 hour'; break;
				case '1-2h': durationText = '1 to 2 hours'; break;
				case '>2h': durationText = 'more than 2 hours'; break;
				default: durationText = bestDuration.duration;
			}
			
			// Round the average to a cleaner number
			const avgPnL = Math.round(bestDuration.avgPnL);
			const totalPnL = Math.round(bestDuration.totalPnL);
			
			summary = `You make the most money when holding trades for ${durationText} - earning ₹${totalPnL.toLocaleString('en-IN')} total (₹${avgPnL.toLocaleString('en-IN')} per trade on ${bestDuration.tradeCount} trades).`;
			
			// Fix the logic for quick vs slow advice based on actual best duration
			const isQuickTrade = ['<1m', '1-5m', '5-15m'].includes(bestDuration.duration);
			const isSlowTrade = ['30-60m', '1-2h', '>2h'].includes(bestDuration.duration);
			
			if (isQuickTrade) {
				summary += ' Quick trades work better for you than holding for long periods.';
			} else if (isSlowTrade) {
				summary += ' Patience pays off - longer holds are more profitable for you.';
			} else {
				// For medium durations (15-30m), check the actual data
				const quickTrades = durationData.durationTable.filter(d => ['<1m', '1-5m'].includes(d.duration));
				const slowTrades = durationData.durationTable.filter(d => ['30-60m', '1-2h', '>2h'].includes(d.duration));
				
				if (quickTrades.length > 0 && slowTrades.length > 0) {
					const quickPnL = quickTrades.reduce((sum, d) => sum + d.totalPnL, 0);
					const slowPnL = slowTrades.reduce((sum, d) => sum + d.totalPnL, 0);
					
					if (quickPnL > slowPnL) {
						summary += ' This is a sweet spot - not too quick, not too slow.';
					} else {
						summary += ' This balanced approach works well for your trading style.';
					}
				} else {
					summary += ' This moderate timing approach suits your trading style.';
				}
			}
		} else {
			summary = 'You\'re losing money across all holding periods. Consider paper trading to practice timing before risking real money.';
		}
		
		summaries.durationAnalysis = summary;
	}

	// Lot Size Analysis Summary
	if (results.insights.lotSizeAnalysis?.success) {
		const lotSizeData = results.insights.lotSizeAnalysis.data;
		const sortedCategories = [...lotSizeData.lotSizeTable]; // Already sorted by total P&L
		const bestCategory = sortedCategories[0];
		
		let summary = '';
		if (bestCategory.totalPnL > 0) {
			// Convert category to readable format
			let categoryText = bestCategory.sizeCategory.toLowerCase().replace(/[<>₹]/g, '');
			
			// Round the numbers for readability  
			const totalPnL = Math.round(bestCategory.totalPnL);
			const avgPnL = Math.round(bestCategory.avgPnL);
			
			summary = `Your most profitable trade size is ${categoryText} positions - earning ₹${totalPnL.toLocaleString('en-IN')} total (₹${avgPnL.toLocaleString('en-IN')} per trade on ${bestCategory.tradeCount} trades).`;
			
			// Add sizing advice based on best category
			if (bestCategory.sizeCategory.includes('Small')) {
				summary += ' Smaller position sizes work better for your trading style and risk management.';
			} else if (bestCategory.sizeCategory.includes('Large') || bestCategory.sizeCategory.includes('Very Large')) {
				summary += ' Larger positions are profitable for you, but ensure proper risk management.';
			} else {
				summary += ' This moderate position sizing suits your trading approach well.';
			}
		} else {
			summary = 'All position sizes are showing losses. Consider reducing position sizes and focusing on strategy improvement first.';
		}
		
		summaries.lotSizeAnalysis = summary;
	}

	// Trade Count Analysis Summary
	if (results.insights.tradeCountAnalysis?.success) {
		const countData = results.insights.tradeCountAnalysis.data;
		const sortedCounts = [...countData.tradeCountTable].sort((a, b) => b.avgDailyPnL - a.avgDailyPnL);
		const bestCount = sortedCounts.find(count => count.totalPnL > 0) || sortedCounts[0];
		
		let summary = '';
		if (bestCount && bestCount.totalPnL > 0) {
			const totalPnL = Math.round(bestCount.totalPnL);
			const avgDaily = Math.round(bestCount.avgDailyPnL);
			
			summary = `You perform best with ${bestCount.tradeCount} trades per day - earning ₹${totalPnL.toLocaleString('en-IN')} total (₹${avgDaily.toLocaleString('en-IN')} daily average on ${bestCount.frequencyDays} days).`;
			
			// Add frequency advice
			const highVolumeProblems = countData.tradeCountTable.some(count => 
				count.tradeCount >= 10 && count.avgPnLPerTrade < 0);
			
			if (bestCount.tradeCount <= 3) {
				summary += ' Quality over quantity works for your style - focus on selective, high-conviction trades.';
			} else if (bestCount.tradeCount >= 10) {
				summary += ' High-volume trading suits you, but watch for overtrading signs.';
			} else {
				summary += ' This moderate trading frequency balances opportunity with risk management.';
			}
			
			if (highVolumeProblems) {
				summary += ' Avoid overtrading on days with 10+ trades as it hurts your performance.';
			}
		} else {
			summary = 'All trading frequencies are showing losses. Consider reducing daily trade volume and focusing on quality setups.';
		}
		
		summaries.tradeCountAnalysis = summary;
	}

	// Trade Sequence Analysis Summary
	if (results.insights.tradeSequenceAnalysis?.success) {
		const sequenceData = results.insights.tradeSequenceAnalysis.data;
		const firstTradeStats = sequenceData.sequenceAnalysis.find(cat => cat.category === 'First Trade');
		const lateTradeStats = sequenceData.sequenceAnalysis.find(cat => cat.category === 'Late Trades (6+)');
		
		let summary = '';
		if (firstTradeStats && firstTradeStats.winRate > 0) {
			const totalPnL = Math.round(firstTradeStats.netPnL);
			const winRate = firstTradeStats.winRate.toFixed(1);
			const avgPnL = Math.round(firstTradeStats.avgPnL);
			
			summary = `Your first trade of each day performs best with ${winRate}% win rate (₹${totalPnL.toLocaleString('en-IN')} total, ₹${avgPnL.toLocaleString('en-IN')} per trade).`;
			
			// Compare with late trades if available
			if (lateTradeStats) {
				const degradation = firstTradeStats.winRate - lateTradeStats.winRate;
				if (degradation > 10) {
					summary += ` Performance degrades significantly by late trades - ${degradation.toFixed(1)}% point drop.`;
				} else if (degradation > 5) {
					summary += ` Moderate performance degradation in later trades.`;
				}
			}
			
			// Overtrading insights
			if (sequenceData.overtradingAnalysis.highVolumePercentage > 30) {
				summary += ` Watch for overtrading - ${sequenceData.overtradingAnalysis.highVolumePercentage.toFixed(1)}% of days have 6+ trades.`;
			}
			
			if (sequenceData.overtradingAnalysis.overtradingCost > 100) {
				summary += ` Overtrading costs ₹${sequenceData.overtradingAnalysis.overtradingCost.toFixed(0)} per trade.`;
			}
		} else {
			summary = 'Trade sequence analysis shows consistent underperformance. Focus on quality over quantity with fewer, better-timed trades.';
		}
		
		summaries.tradeSequenceAnalysis = summary;
	}

	// Time of Day × Instrument P&L Analysis Summary
	if (results.insights.timeInstrumentAnalysis?.success) {
		const timeData = results.insights.timeInstrumentAnalysis.data;
		
		// Find best time-instrument combination
		let bestCombo = null;
		let bestPnL = -Infinity;
		timeData.timeInstrumentMatrix.forEach(combo => {
			if (combo.totalPnL > bestPnL) {
				bestPnL = combo.totalPnL;
				bestCombo = combo;
			}
		});
		
		// Find best time slot overall
		const bestTimeSlot = timeData.timeSlotAnalysis.reduce((best, slot) => 
			slot.totalPnL > best.totalPnL ? slot : best
		);
		
		// Find best instrument overall
		const bestInstrument = timeData.instrumentAnalysis.reduce((best, inst) => 
			inst.totalPnL > best.totalPnL ? inst : best
		);
		
		let summary = '';
		if (bestCombo && bestCombo.totalPnL > 0) {
			summary = `Your most profitable time-instrument combination is ${bestCombo.timeSlot} × ${bestCombo.instrumentType} earning ₹${bestCombo.totalPnL.toLocaleString('en-IN')}`;
			if (bestCombo.winRate >= 60) {
				summary += ` with a ${bestCombo.winRate.toFixed(0)}% win rate`;
			}
			summary += `. Focus trading during ${bestTimeSlot.timeSlot} for optimal results.`;
		} else if (bestTimeSlot.totalPnL > 0) {
			summary = `${bestTimeSlot.timeSlot} is your best trading time with ₹${bestTimeSlot.totalPnL.toLocaleString('en-IN')} earned. Consider focusing on ${bestInstrument.instrumentType} trading.`;
		} else {
			summary = 'Time-instrument analysis shows poor performance across all combinations. Consider reviewing your trading schedule and instrument selection.';
		}
		
		summaries.timeInstrumentAnalysis = summary;
	}

	// Direction × Symbol P&L Analysis Summary
	if (results.insights.directionSymbolAnalysis?.success) {
		const directionData = results.insights.directionSymbolAnalysis.data;
		
		// Find best direction-symbol combination
		let bestCombo = directionData.directionSymbolMatrix.reduce((best, combo) => 
			combo.totalPnL > best.totalPnL ? combo : best
		);
		
		// Find best direction overall
		const longTotalPnL = directionData.directionAnalysis.find(d => d.direction === 'LONG')?.totalPnL || 0;
		const shortTotalPnL = directionData.directionAnalysis.find(d => d.direction === 'SHORT')?.totalPnL || 0;
		
		let summary = '';
		if (bestCombo && bestCombo.totalPnL > 0) {
			summary = `Your most profitable direction-symbol combination is ${bestCombo.direction} ${bestCombo.symbol} earning ₹${bestCombo.totalPnL.toLocaleString('en-IN')}`;
			if (bestCombo.winRate >= 60) {
				summary += ` with ${bestCombo.winRate.toFixed(0)}% win rate`;
			}
			
			// Add direction bias insight
			if (Math.abs(longTotalPnL - shortTotalPnL) > 500) {
				const betterDirection = longTotalPnL > shortTotalPnL ? 'LONG' : 'SHORT';
				summary += `. You perform better with ${betterDirection} positions overall.`;
			} else {
				summary += `. Focus on this high-performing combination.`;
			}
		} else {
			summary = 'Direction-symbol analysis shows challenges across combinations. Consider focusing on fewer, higher-conviction trades.';
		}
		
		summaries.directionSymbolAnalysis = summary;
	}

	// Direction × CE/PE P&L Analysis Summary
	if (results.insights.directionCEPEAnalysis?.success) {
		const cepeData = results.insights.directionCEPEAnalysis.data;
		
		if (cepeData.summary.totalTrades > 0) {
			// Find best direction-option combination
			let bestCombo = cepeData.directionOptionMatrix.length > 0 ? 
				cepeData.directionOptionMatrix.reduce((best, combo) => 
					combo.totalPnL > best.totalPnL ? combo : best
				) : null;
			
			// Compare CE vs PE performance
			const ceTotalPnL = cepeData.ceAnalysis.totalPnL;
			const peTotalPnL = cepeData.peAnalysis.totalPnL;
			
			let summary = '';
			if (bestCombo && bestCombo.totalPnL > 0) {
				summary = `Best options combination: ${bestCombo.direction} ${bestCombo.instrument} ${bestCombo.optionType} earning ₹${bestCombo.totalPnL.toLocaleString('en-IN')}`;
				
				// Add CE vs PE bias
				if (Math.abs(ceTotalPnL - peTotalPnL) > 300) {
					const betterType = ceTotalPnL > peTotalPnL ? 'CE' : 'PE';
					summary += `. ${betterType} options perform better for you than ${betterType === 'CE' ? 'PE' : 'CE'}.`;
				} else {
					summary += `. Your options trading shows balanced performance.`;
				}
			} else if (cepeData.summary.totalTrades > 5) {
				summary = `Options trading needs improvement - ${cepeData.summary.totalTrades} trades with overall losses. Consider paper trading options strategies first.`;
			} else {
				summary = `Limited options data (${cepeData.summary.totalTrades} trades) - build more experience before optimizing.`;
			}
			
			summaries.directionCEPEAnalysis = summary;
		} else {
			summaries.directionCEPEAnalysis = 'No CE/PE options found in your trading data. Consider exploring options trading for portfolio diversification.';
		}
	}

	return summaries;
}

/**
 * Generate consolidated insights summary
 * @param {Object} results - Results from runAllTradingInsights
 * @returns {Object} - Consolidated insights
 */
function generateConsolidatedInsights(results) {
	if (!results.success && results.metadata.completedInsights.length === 0) {
		return {
			overallSummary: 'Analysis failed - no insights generated',
			keyFindings: [],
			criticalRecommendations: [],
			riskWarnings: []
		};
	}

	const consolidated = {
		overallSummary: '',
		keyFindings: [],
		criticalRecommendations: [],
		riskWarnings: []
	};

	// Extract key findings from each completed insight
	if (results.insights.dayOfWeekAnalysis) {
		const dayData = results.insights.dayOfWeekAnalysis.data;
    
		// Find best and worst days
		const bestDay = dayData.dayPnLTable.reduce((best, day) => day.totalPnL > best.totalPnL ? day : best);
		const worstDay = dayData.dayPnLTable.reduce((worst, day) => day.totalPnL < worst.totalPnL ? day : worst);
    
		consolidated.keyFindings.push(`Best trading day: ${bestDay.day} (₹${bestDay.totalPnL.toLocaleString()} total P&L)`);
		if (worstDay.totalPnL < 0) {
			consolidated.keyFindings.push(`Worst trading day: ${worstDay.day} (₹${worstDay.totalPnL.toLocaleString()} total P&L)`);
			consolidated.riskWarnings.push(`${worstDay.day} consistently underperforms - consider reducing activity`);
		}
    
		consolidated.criticalRecommendations.push(`Focus trading on ${bestDay.day} - your most profitable day`);
	}

	if (results.insights.tradeSequenceAnalysis) {
		const sequenceData = results.insights.tradeSequenceAnalysis.data;
		const firstTradeStats = sequenceData.sequenceAnalysis.find(cat => cat.category === 'First Trade');
		const lateTradeStats = sequenceData.sequenceAnalysis.find(cat => cat.category === 'Late Trades (6+)');
		
		if (firstTradeStats) {
			consolidated.keyFindings.push(`First trades: ${firstTradeStats.winRate.toFixed(1)}% win rate (₹${firstTradeStats.avgPnL.toFixed(0)} avg per trade)`);
			
			if (firstTradeStats.winRate > sequenceData.summary.overallWinRate + 5) {
				consolidated.criticalRecommendations.push('Capitalize on strong first trades - focus maximum effort here');
			}
		}
		
		if (lateTradeStats && lateTradeStats.winRate < 45) {
			consolidated.riskWarnings.push(`Late trades (6+) underperform at ${lateTradeStats.winRate.toFixed(1)}% win rate - consider daily limits`);
		}
		
		if (sequenceData.overtradingAnalysis.overtradingCost > 100) {
			consolidated.riskWarnings.push(`Overtrading costs ₹${sequenceData.overtradingAnalysis.overtradingCost.toFixed(0)} per trade on high-volume days`);
		}
	}

	if (results.insights.durationAnalysis) {
		const durationData = results.insights.durationAnalysis.data;
    
		// Find most efficient duration
		const bestDuration = durationData.durationTable.reduce((best, dur) => 
			dur.winRate > best.winRate ? dur : best);
    
		consolidated.keyFindings.push(`Best duration: ${bestDuration.duration} (${bestDuration.winRate.toFixed(1)}% win rate)`);
		consolidated.criticalRecommendations.push(`Target ${bestDuration.duration} holding periods for optimal performance`);
    
		// Check for overtrading (very short durations with poor performance)
		const shortDurations = durationData.durationTable.filter(dur => 
			['<1m', '1-5m'].includes(dur.duration) && dur.winRate < 50);
    
		if (shortDurations.length > 0) {
			consolidated.riskWarnings.push('Short-term trading showing poor results - possible overtrading');
		}
	}

	if (results.insights.timeInstrumentAnalysis) {
		const timeData = results.insights.timeInstrumentAnalysis.data;
		
		// Find best time-instrument combination
		let bestCombo = null;
		let bestPnL = -Infinity;
		timeData.timeInstrumentMatrix.forEach(combo => {
			if (combo.totalPnL > bestPnL) {
				bestPnL = combo.totalPnL;
				bestCombo = combo;
			}
		});
		
		// Find best time slot and instrument overall
		const bestTimeSlot = timeData.timeSlotAnalysis.reduce((best, slot) => 
			slot.totalPnL > best.totalPnL ? slot : best
		);
		const bestInstrument = timeData.instrumentAnalysis.reduce((best, inst) => 
			inst.totalPnL > best.totalPnL ? inst : best
		);
		
		if (bestCombo && bestCombo.totalPnL > 0) {
			consolidated.keyFindings.push(`Best combo: ${bestCombo.timeSlot} × ${bestCombo.instrumentType} (₹${bestCombo.totalPnL.toLocaleString()} P&L)`);
			consolidated.criticalRecommendations.push(`Focus trading during ${bestTimeSlot.timeSlot} with ${bestInstrument.instrumentType}`);
		}
		
		// Find poor performers to warn about
		const poorCombos = timeData.timeInstrumentMatrix.filter(combo => combo.totalPnL < -500);
		if (poorCombos.length > 0) {
			const worstCombo = poorCombos.reduce((worst, combo) => combo.totalPnL < worst.totalPnL ? combo : worst);
			consolidated.riskWarnings.push(`Avoid ${worstCombo.timeSlot} × ${worstCombo.instrumentType} - consistently underperforming`);
		}
	}

	if (results.insights.directionSymbolAnalysis) {
		const directionData = results.insights.directionSymbolAnalysis.data;
		
		// Find best direction-symbol combination
		let bestCombo = directionData.directionSymbolMatrix.reduce((best, combo) => 
			combo.totalPnL > best.totalPnL ? combo : best
		);
		
		if (bestCombo && bestCombo.totalPnL > 0) {
			consolidated.keyFindings.push(`Best direction-symbol combo: ${bestCombo.direction} ${bestCombo.symbol} (₹${bestCombo.totalPnL.toLocaleString()} P&L, ${bestCombo.winRate.toFixed(1)}% win rate)`);
			consolidated.criticalRecommendations.push(`Focus on ${bestCombo.direction} positions in ${bestCombo.symbol}`);
		}
		
		// Direction bias analysis
		const longAnalysis = directionData.directionAnalysis.find(d => d.direction === 'LONG');
		const shortAnalysis = directionData.directionAnalysis.find(d => d.direction === 'SHORT');
		
		if (longAnalysis && shortAnalysis && Math.abs(longAnalysis.totalPnL - shortAnalysis.totalPnL) > 1000) {
			const betterDirection = longAnalysis.totalPnL > shortAnalysis.totalPnL ? 'LONG' : 'SHORT';
			consolidated.criticalRecommendations.push(`Specialize in ${betterDirection} positions - they perform significantly better`);
		}
		
		// Warn about poor direction-symbol combinations
		const poorCombos = directionData.directionSymbolMatrix.filter(combo => combo.totalPnL < -500);
		if (poorCombos.length > 0) {
			const worstCombo = poorCombos.reduce((worst, combo) => combo.totalPnL < worst.totalPnL ? combo : worst);
			consolidated.riskWarnings.push(`Avoid ${worstCombo.direction} ${worstCombo.symbol} - consistently underperforming`);
		}
	}

	if (results.insights.directionCEPEAnalysis) {
		const cepeData = results.insights.directionCEPEAnalysis.data;
		
		if (cepeData.summary.totalTrades > 0) {
			// Best options combination
			if (cepeData.directionOptionMatrix.length > 0) {
				const bestCombo = cepeData.directionOptionMatrix.reduce((best, combo) => 
					combo.totalPnL > best.totalPnL ? combo : best
				);
				
				if (bestCombo.totalPnL > 0) {
					consolidated.keyFindings.push(`Best options combo: ${bestCombo.direction} ${bestCombo.instrument} ${bestCombo.optionType} (₹${bestCombo.totalPnL.toLocaleString()} P&L)`);
					consolidated.criticalRecommendations.push(`Focus options trading on ${bestCombo.direction} ${bestCombo.instrument} ${bestCombo.optionType}`);
				}
			}
			
			// CE vs PE performance
			if (cepeData.ceAnalysis.totalTrades > 0 && cepeData.peAnalysis.totalTrades > 0) {
				const cePnL = cepeData.ceAnalysis.totalPnL;
				const pePnL = cepeData.peAnalysis.totalPnL;
				
				if (Math.abs(cePnL - pePnL) > 500) {
					const betterType = cePnL > pePnL ? 'CE' : 'PE';
					consolidated.criticalRecommendations.push(`Specialize in ${betterType} options - they perform better than ${betterType === 'CE' ? 'PE' : 'CE'}`);
				}
			}
			
			// Options risk warnings
			if (cepeData.summary.overallWinRate < 45) {
				consolidated.riskWarnings.push(`Options win rate is low (${cepeData.summary.overallWinRate.toFixed(1)}%) - review strategy or reduce position sizes`);
			}
		}
	}

	// Generate overall summary
	const totalInsights = results.metadata.completedInsights.length;
	const totalTrades = results.metadata.totalTrades;
  
	consolidated.overallSummary = `Analysis completed on ${totalTrades.toLocaleString()} trades with ${totalInsights} insights generated. ` +
		`${consolidated.keyFindings.length} key findings identified with ${consolidated.criticalRecommendations.length} actionable recommendations.`;

	return consolidated;
}

/**
 * Format complete analysis results for display
 * @param {Object} results - Results from runAllTradingInsights
 * @returns {string} - Formatted output
 */
function formatCompleteAnalysis(results) {
	let output = [];
  
	output.push('🔥 COMPLETE TRADING INSIGHTS ANALYSIS REPORT');
	output.push('=' .repeat(80));
	output.push('');
  
	// Metadata summary
	output.push('📊 ANALYSIS SUMMARY:');
	output.push(`Total Trades Analyzed: ${results.metadata.totalTrades.toLocaleString()}`);
	output.push(`Analysis Date: ${results.metadata.analysisDate.toISOString()}`);
	output.push(`Completed Insights: ${results.metadata.completedInsights.length}`);
	output.push(`Failed Insights: ${results.metadata.failedInsights.length}`);
	output.push('');

	if (results.metadata.completedInsights.length > 0) {
		output.push('✅ COMPLETED INSIGHTS:');
		results.metadata.completedInsights.forEach((insight, index) => {
			output.push(`   ${index + 1}. ${insight}`);
		});
		output.push('');
	}

	if (results.metadata.failedInsights.length > 0) {
		output.push('❌ FAILED INSIGHTS:');
		results.metadata.failedInsights.forEach((insight, index) => {
			output.push(`   ${index + 1}. ${insight}`);
		});
		output.push('');
	}

	// Individual insight results
	if (results.insights.dayOfWeekAnalysis) {
		output.push('📅 DAY OF WEEK ANALYSIS:');
		output.push('-'.repeat(40));
		const dayResult = results.insights.dayOfWeekAnalysis;
		output.push(`Total P&L: ₹${dayResult.data.summary.totalPnL.toLocaleString()}`);
		output.push(`Best Day: ${dayResult.data.dayPnLTable.reduce((best, day) => day.totalPnL > best.totalPnL ? day : best).day}`);
		output.push(`Key Insights: ${dayResult.data.insights.length}`);
		output.push(`Recommendations: ${dayResult.data.recommendations.length}`);
		output.push('');
	}

	if (results.insights.durationAnalysis) {
		output.push('⏱️  DURATION × OUTCOME ANALYSIS:');
		output.push('-'.repeat(40));
		const durationResult = results.insights.durationAnalysis;
		output.push(`Total P&L: ₹${durationResult.data.summary.totalPnL.toLocaleString()}`);
		output.push(`Overall Win Rate: ${durationResult.data.summary.overallWinRate.toFixed(1)}%`);
		output.push(`Avg Holding Time: ${Math.round(durationResult.data.summary.avgHoldingTime / 60)} minutes`);
		output.push(`Key Insights: ${durationResult.data.insights.length}`);
		output.push(`Recommendations: ${durationResult.data.recommendations.length}`);
		output.push('');
	}

	if (results.insights.tradeSequenceAnalysis) {
		output.push('🎯 TRADE SEQUENCE ANALYSIS:');
		output.push('-'.repeat(40));
		const sequenceResult = results.insights.tradeSequenceAnalysis;
		const firstTrade = sequenceResult.data.sequenceAnalysis.find(cat => cat.category === 'First Trade');
		const lateTrades = sequenceResult.data.sequenceAnalysis.find(cat => cat.category === 'Late Trades (6+)');
		
		output.push(`Total P&L: ₹${sequenceResult.data.summary.totalPnL.toLocaleString()}`);
		output.push(`Avg Trades per Day: ${sequenceResult.data.summary.avgTradesPerDay.toFixed(1)}`);
		
		if (firstTrade) {
			output.push(`First Trade Win Rate: ${firstTrade.winRate.toFixed(1)}%`);
		}
		
		if (lateTrades) {
			output.push(`Late Trades (6+) Win Rate: ${lateTrades.winRate.toFixed(1)}%`);
		}
		
		output.push(`Overtrading Days: ${sequenceResult.data.overtradingAnalysis.highVolumePercentage.toFixed(1)}%`);
		output.push(`Key Insights: ${sequenceResult.data.insights.length}`);
		output.push(`Recommendations: ${sequenceResult.data.recommendations.length}`);
		output.push('');
	}

	if (results.insights.timeInstrumentAnalysis) {
		output.push('⏰ TIME-INSTRUMENT ANALYSIS:');
		output.push('-'.repeat(40));
		const timeResult = results.insights.timeInstrumentAnalysis;
		const timeData = timeResult.data;
		
		output.push(`Total P&L: ₹${timeData.summary.totalPnL.toLocaleString()}`);
		output.push(`Unique Instruments: ${timeData.summary.uniqueInstruments}`);
		output.push(`Active Combinations: ${timeData.summary.activeCombinations}/${timeData.summary.totalPossibleCombinations}`);
		output.push(`Best Time: ${timeData.timeSlotAnalysis.reduce((best, slot) => slot.totalPnL > best.totalPnL ? slot : best).timeSlot}`);
		output.push(`Best Instrument: ${timeData.instrumentAnalysis.reduce((best, inst) => inst.totalPnL > best.totalPnL ? inst : best).instrumentType}`);
		output.push(`Key Insights: ${timeData.insights.length}`);
		output.push(`Recommendations: ${timeData.recommendations.length}`);
		output.push('');
	}

	if (results.insights.directionSymbolAnalysis) {
		output.push('📈 DIRECTION-SYMBOL ANALYSIS:');
		output.push('-'.repeat(40));
		const directionResult = results.insights.directionSymbolAnalysis;
		const directionData = directionResult.data;
		
		output.push(`Total P&L: ₹${directionData.summary.totalPnL.toLocaleString()}`);
		output.push(`Unique Symbols: ${directionData.summary.uniqueSymbols}/${directionData.summary.uniqueSymbolsTotal}`);
		output.push(`Active Combinations: ${directionData.summary.activeCombinations}/${directionData.summary.totalPossibleCombinations}`);
		
		const longAnalysis = directionData.directionAnalysis.find(d => d.direction === 'LONG');
		const shortAnalysis = directionData.directionAnalysis.find(d => d.direction === 'SHORT');
		
		if (longAnalysis) output.push(`LONG P&L: ₹${longAnalysis.totalPnL.toLocaleString()} (${longAnalysis.tradeCount} trades, ${longAnalysis.winRate.toFixed(1)}% win rate)`);
		if (shortAnalysis) output.push(`SHORT P&L: ₹${shortAnalysis.totalPnL.toLocaleString()} (${shortAnalysis.tradeCount} trades, ${shortAnalysis.winRate.toFixed(1)}% win rate)`);
		
		output.push(`Key Insights: ${directionData.insights.length}`);
		output.push(`Recommendations: ${directionData.recommendations.length}`);
		output.push('');
	}

	if (results.insights.directionCEPEAnalysis) {
		output.push('📊 DIRECTION-CE/PE ANALYSIS:');
		output.push('-'.repeat(40));
		const cepeResult = results.insights.directionCEPEAnalysis;
		const cepeData = cepeResult.data;
		
		output.push(`Total P&L: ₹${cepeData.summary.totalPnL.toLocaleString()}`);
		output.push(`Total Options Trades: ${cepeData.summary.totalTrades}`);
		output.push(`CE Trades: ${cepeData.summary.ceTradesCount}`);
		output.push(`PE Trades: ${cepeData.summary.peTradesCount}`);
		
		if (cepeData.summary.totalTrades > 0) {
			output.push(`Overall Win Rate: ${cepeData.summary.overallWinRate.toFixed(1)}%`);
			output.push(`Avg P&L per Trade: ₹${cepeData.summary.avgPnLPerTrade.toFixed(0)}`);
			output.push(`Active Combinations: ${cepeData.summary.activeCombinations}`);
		}
		
		output.push(`Key Insights: ${cepeData.insights.length}`);
		output.push(`Recommendations: ${cepeData.recommendations.length}`);
		output.push('');
	}

	// Consolidated insights
	const consolidated = generateConsolidatedInsights(results);
  
	output.push('🎯 CONSOLIDATED INSIGHTS:');
	output.push('-'.repeat(40));
	output.push(consolidated.overallSummary);
	output.push('');

	if (consolidated.keyFindings.length > 0) {
		output.push('🔍 KEY FINDINGS:');
		consolidated.keyFindings.forEach(finding => {
			output.push(`• ${finding}`);
		});
		output.push('');
	}

	if (consolidated.criticalRecommendations.length > 0) {
		output.push('🚀 CRITICAL RECOMMENDATIONS:');
		consolidated.criticalRecommendations.forEach(rec => {
			output.push(`→ ${rec}`);
		});
		output.push('');
	}

	if (consolidated.riskWarnings.length > 0) {
		output.push('⚠️  RISK WARNINGS:');
		consolidated.riskWarnings.forEach(warning => {
			output.push(`⚠️  ${warning}`);
		});
		output.push('');
	}

	// Errors section
	if (results.errors.length > 0) {
		output.push('❌ ANALYSIS ERRORS:');
		results.errors.forEach((error, index) => {
			output.push(`   ${index + 1}. ${error}`);
		});
		output.push('');
	}

	output.push('📈 Analysis complete! Use these insights to optimize your trading strategy.');
  
	return output.join('\n');
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
	// Node.js environment
	module.exports = {
		runAllTradingInsights,
		generateConsolidatedInsights,
		generateConciseSummaries,
		formatCompleteAnalysis,
    
		// Re-export individual modules for direct access
		DayAnalysis,
		DurationAnalysis,
		LotSizeAnalysis,
		TradeCountAnalysis,
		TradeSequenceAnalysis,
		TimeInstrumentAnalysis,
		DirectionAnalysis,
		DataProcessor
	};
} else {
	// Browser environment
	window.TradingInsights = window.TradingInsights || {};
	window.TradingInsights.Main = {
		runAllTradingInsights,
		generateConsolidatedInsights,
		generateConciseSummaries,
		formatCompleteAnalysis
	};
}

// USAGE EXAMPLE:

// Your trading data in JSON format (same structure as after fifo CSV)
const tradingData = [
	{
		Symbol: 'BANKNIFTY24JAN50000CE',
		Strategy: 'Not Selected',
		Side: 'LONG',
		Quantity: 150,
		'Entry Price': '₹150.45',
		'Exit Price': '₹165.30',
		'P&L': '₹2,227.50',
		'Return %': '9.87%',
		Emotion: 'Not Selected',
		Date: '15/8/2025',
		'Entry Time': '09:30:00',
		'Exit Time': '09:35:30',
		Duration: '5m 30s'
	},
	{
		Symbol: 'NIFTY24JAN22000CE',
		Strategy: 'Not Selected',
		Side: 'SHORT',
		Quantity: 75,
		'Entry Price': '₹85.20',
		'Exit Price': '₹70.15',
		'P&L': '₹1,128.75',
		'Return %': '17.67%',
		Emotion: 'Not Selected',
		Date: '16/8/2025',
		'Entry Time': '14:15:00',
		'Exit Time': '14:45:30',
		Duration: '30m 30s'
	},
	{
		Symbol: 'RELIANCE',
		Strategy: 'Not Selected',
		Side: 'LONG',
		Quantity: 10,
		'Entry Price': '₹2,450.00',
		'Exit Price': '₹2,380.00',
		'P&L': '-₹700.00',
		'Return %': '-2.86%',
		Emotion: 'Not Selected',
		Date: '17/8/2025',
		'Entry Time': '10:00:00',
		'Exit Time': '15:30:00',
		Duration: '5h 30m'
	},
	{
		Symbol: 'BANKNIFTY24JAN48000PE',
		Strategy: 'Not Selected',
		Side: 'LONG',
		Quantity: 225,
		'Entry Price': '₹120.75',
		'Exit Price': '₹145.30',
		'P&L': '₹5,523.75',
		'Return %': '20.35%',
		Emotion: 'Not Selected',
		Date: '18/8/2025',
		'Entry Time': '09:45:00',
		'Exit Time': '10:02:15',
		Duration: '17m 15s'
	},
	{
		Symbol: 'NIFTY24JAN21500PE',
		Strategy: 'Not Selected',
		Side: 'SHORT',
		Quantity: 50,
		'Entry Price': '₹95.40',
		'Exit Price': '₹110.25',
		'P&L': '-₹742.50',
		'Return %': '-15.56%',
		Emotion: 'Not Selected',
		Date: '19/8/2025',
		'Entry Time': '13:30:00',
		'Exit Time': '13:32:45',
		Duration: '2m 45s'
	}
];

// Run complete analysis
const results = runAllTradingInsights(tradingData);

// Display formatted report
console.log(formatCompleteAnalysis(results));

// Access individual insights
if (results.insights.dayOfWeekAnalysis) {
	console.log('Day Analysis:', results.insights.dayOfWeekAnalysis.data);
}

// Get consolidated insights
const consolidated = generateConsolidatedInsights(results);
console.log('Key Findings:', consolidated.keyFindings);