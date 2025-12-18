/**
 * AI Utilities for Trading Insights
 * Clean version with enhanced response parsing and formatting
 */

// Import Google Generative AI
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * AI Configuration defaults
 */
const DEFAULT_AI_CONFIG = {
  model: "gemini-1.5-flash",
  maxTokens: 300,
  temperature: 0.2,
  provider: "google"
};

/**
 * Token costs for cost estimation
 */
const TOKEN_COSTS = {
  "gemini-1.5-flash": 0.000075,
  "gemini-1.5-pro": 0.0035,
  "gpt-4o-mini": 0.00015,
  "gpt-4o": 0.0025
};

// Initialize Gemini AI
let genAI = null;
let model = null;

try {
  const apiKey = process.env.GOOGLE_API_KEY;
  
  if (!apiKey) {
    console.warn('GOOGLE_API_KEY environment variable not found - using mock responses');
  } else {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log('✅ Google Generative AI initialized successfully');
  }
} catch (error) {
  console.error('❌ Failed to initialize Google Generative AI:', error.message);
}

/**
 * Generate AI insights using Google Gemini
 * @param {string} prompt - The analysis prompt
 * @param {Object} options - Configuration options
 * @returns {Object} - AI response with insights and metadata
 */
async function generateAIInsights(prompt, options = {}) {
  const startTime = Date.now();

  try {
    if (!model) {
      console.log('🔄 Using mock response - API key not available');
      return createMockAIResponse(options.analysisType || 'general');
    }

    // Combine system prompt with analysis prompt
    const systemPrompt = createSystemPrompt(options.analysisType || 'general');
    const fullPrompt = `${systemPrompt}\n\n${prompt}`;

    console.log('🤖 Sending prompt to Gemini AI...');

    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();

    console.log('✅ AI response received:', responseText.length, 'characters');

    // Parse the response
    const parsedResponse = parseAIResponse(responseText);

    // Calculate tokens and cost (rough estimates)
    const tokensUsed = Math.ceil((fullPrompt.length + responseText.length) / 4);
    const cost = calculateCost(tokensUsed, options.model || 'gemini-1.5-flash');

    return {
      success: true,
      insights: parsedResponse.insights,
      recommendations: parsedResponse.recommendations,
      riskWarnings: parsedResponse.riskWarnings,
      confidence: parsedResponse.confidence,
      metadata: {
        tokensUsed,
        cost,
        model: options.model || 'gemini-1.5-flash',
        promptLength: fullPrompt.length,
        responseLength: responseText.length,
        processingTimeMs: Date.now() - startTime,
        generatedAt: new Date(),
        isMock: false
      }
    };

  } catch (error) {
    console.error('❌ AI insights generation failed:', error.message);

    // Handle quota exceeded error specifically
    if (error.message.includes('429') || error.message.includes('quota') || error.message.includes('Too Many Requests')) {
      console.log('🚫 API quota exceeded. Using mock response.');
      return createMockAIResponse(options.analysisType || 'general');
    }

    return {
      success: false,
      error: error.message,
      insights: [],
      recommendations: [],
      riskWarnings: [],
      metadata: {
        tokensUsed: 0,
        cost: 0,
        processingTimeMs: Date.now() - startTime,
        generatedAt: new Date(),
        isMock: false
      }
    };
  }
}

/**
 * Parse AI response text into structured data with insights and recommendations
 * @param {string} responseText - Raw AI response
 * @returns {Object} - Parsed insights, recommendations, etc.
 */
function parseAIResponse(responseText) {
  const parsed = {
    insights: [],
    recommendations: [],
    riskWarnings: [],
    confidence: 'medium',
    summary: ''
  };

  try {
    // Split into sections
    const sections = responseText.split(/(?:INSIGHTS:|RECOMMENDATIONS:|→)/i);
    
    if (sections.length > 1) {
      // Parse insights section
      const insightsText = sections[1] || '';
      const insightLines = insightsText.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 15 && line.startsWith('•'))
        .map(line => cleanInsightText(line.replace('•', '').trim()));
      
      parsed.insights = insightLines.slice(0, 4);
      
      // Parse recommendations section  
      if (sections.length > 2) {
        const recommendationsText = sections[2] || '';
        const recLines = recommendationsText.split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 15 && (line.startsWith('→') || line.startsWith('•')))
          .map(line => cleanInsightText(line.replace(/^[→•]/, '').trim()));
        
        parsed.recommendations = recLines.slice(0, 3);
      }
    } else {
      // Fallback: parse plain text format
      const lines = responseText.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 15)
        .map(line => cleanInsightText(line.replace(/^[\d\.\-\*\•\►\▪\→]+\s*/, '')));

      // First 4 lines as insights
      parsed.insights = lines.slice(0, 4);
      
      // Look for recommendation patterns in remaining lines
      const recLines = lines.filter(line => 
        line.toLowerCase().includes('recommend') || 
        line.toLowerCase().includes('focus') ||
        line.toLowerCase().includes('consider') ||
        line.toLowerCase().includes('avoid')
      );
      
      parsed.recommendations = recLines.slice(0, 3);
    }
    
    return parsed;

  } catch (error) {
    console.warn('Failed to parse AI response:', error.message);
    
    return {
      insights: ['Unable to generate insights from AI response'],
      recommendations: ['Review trading strategy based on data patterns'],
      riskWarnings: [],
      confidence: 'low',
      summary: ''
    };
  }
}

/**
 * Clean insight text to remove JSON fragments and formatting issues
 */
function cleanInsightText(text) {
  if (!text || typeof text !== 'string') return '';
  
  return text
    // Remove JSON fragments
    .replace(/\{[^}]*\}/g, '')
    // Remove markdown bold/italic
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    // Remove quotes
    .replace(/["']/g, '')
    // Just trim - let AI generate natural 3-4 line responses
    .trim();
}

/**
 * Create system prompt for trading analysis
 * @param {string} analysisType - Type of analysis (day, duration, etc.)
 * @returns {string} - System prompt
 */
function createSystemPrompt(analysisType) {
  const basePrompt = `You are a professional trading analyst. Provide actionable trading insights in a clean, structured format.

CRITICAL: Each insight must be EXACTLY 1-2 complete lines that is (10-15 words). Do not truncate mid-sentence.

RESPONSE FORMAT:
INSIGHTS:
• First key finding with specific numbers and percentages. Explain the pattern clearly with concrete data. Provide actionable context for the trader to understand what this means for their strategy.
• Second pattern observation with trading implications. Detail how this affects performance and what opportunities it creates. Include specific metrics and percentages.
• Third performance insight with data-driven explanation. Connect the numbers to trading behavior and explain the underlying cause. Offer clear direction.
• Fourth risk or opportunity highlight with concrete metrics. Summarize the key takeaway and its impact on overall trading success.

RECOMMENDATIONS:
→ Focus on [specific action] based on [data insight with numbers]
→ Consider [specific adjustment] to improve [specific metric by X%]  
→ Avoid [specific pattern] that shows [specific negative result]

Rules: Write complete 1-2 line insights, use bullets (•), arrows (→), include specific numbers, no truncation.`;

  switch (analysisType) {
    case 'day_analysis':
      return basePrompt + `\n\nFOCUS: Day-of-week patterns - identify best/worst days, profit distribution, trading frequency by day.`;
      
    case 'lot_size_analysis':
      return basePrompt + `\n\nFOCUS: Position sizing effectiveness - optimal lot sizes, win rates by size, correlation between size and profitability.`;
      
    case 'trade_count_analysis':
      return basePrompt + `\n\nFOCUS: Trading frequency optimization - optimal trades per day, overtrading patterns, efficiency metrics.`;
      
    case 'duration_analysis':
      return basePrompt + `\n\nFOCUS: Holding period analysis - optimal trade durations, quick vs patient trading performance.`;
      
    case 'time_instrument_analysis':
      return basePrompt + `\n\nFOCUS: Time-instrument combinations - best trading hours for specific instruments, efficiency patterns.`;
      
    case 'trade_sequence_analysis':
      return basePrompt + `\n\nFOCUS: Trade sequence patterns - first trade advantage, performance degradation, overtrading signals.`;
      
    case 'direction_analysis':
      return basePrompt + `\n\nFOCUS: Direction bias analysis - LONG vs SHORT performance, symbol-specific direction preferences.`;
      
    default:
      return basePrompt + `\n\nFOCUS: General trading performance patterns and optimization opportunities.`;
  }
}

/**
 * Create custom trading analysis prompt
 * @param {Object} data - Analysis data
 * @param {string} analysisType - Type of analysis
 * @returns {string} - Formatted prompt
 */
function createTradingAnalysisPrompt(data, analysisType) {
  const prompt = `Analyze this ${analysisType} data for personalized trading insights:

${JSON.stringify(data, null, 2)}

Focus on actionable patterns specific to this trader's performance. give short insight not more than 15 words`;

  return prompt;
}

/**
 * Calculate estimated cost for API usage
 * @param {number} tokens - Number of tokens used
 * @param {string} model - Model name
 * @returns {number} - Estimated cost in USD
 */
function calculateCost(tokens, model = 'gemini-1.5-flash') {
  const costPer1000 = TOKEN_COSTS[model] || TOKEN_COSTS["gemini-1.5-flash"];
  return (tokens / 1000) * costPer1000;
}

/**
 * Estimate token count for a given text
 * @param {string} text - Text to estimate
 * @returns {number} - Estimated token count
 */
function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

/**
 * Create mock AI response for testing
 * @param {string} analysisType - Type of analysis
 * @returns {Object} - Mock AI response
 */
function createMockAIResponse(analysisType) {
  const mockInsights = {
    'day_analysis': [
      'Your Thursday trading shows exceptional performance with highest profitability rates and optimal win-loss ratios. This day consistently delivers above-average returns with 73% win rate.',
      'Tuesday and Wednesday demonstrate reliable positive returns with steady volume patterns. These mid-week sessions show disciplined execution and risk management.',
      'Monday sessions benefit from weekend analysis momentum, resulting in strategic trade entries. Your preparation translates to superior first-day performance.',
      'Weekend gaps create opportunities that you effectively capitalize on during Monday sessions. This pattern suggests strong market analysis skills.'
    ],
    'lot_size_analysis': [
      'Your large position sizes (₹1L+) significantly outperform smaller positions with 68% win rate versus 52% for smaller lots. Size optimization is working effectively.',
      'Optimal position sizing appears in the ₹50K-₹2L range for your strategy, generating consistent profits. This sweet spot balances risk and reward optimally.',
      'Risk management improves notably with position sizes below ₹3L based on your historical data. Larger positions show increased volatility and drawdowns.',
      'Position consistency across similar setups enhances your overall performance metrics and reduces emotional decision-making impacts.'
    ],
    'trade_count_analysis': [
      'Your optimal trading frequency is 3-5 trades per day for maximum profitability with highest success rates. This frequency allows for quality analysis.',
      'Days with 6+ trades show declining performance patterns, suggesting overtrading tendencies that reduce overall efficiency. Focus beats frequency.',
      'Single trade days demonstrate exceptional decision quality in your approach with 78% win rate. Quality selection drives these results.',
      'Trade frequency directly correlates with profit per trade efficiency. Lower volume, higher quality trades outperform high-frequency sessions.'
    ],
    'duration_analysis': [
      'Your 1-5 minute trades generate the highest average profits consistently with ₹2,847 per trade. Quick decision execution is your strength.',
      'Extended holding periods beyond 60 minutes reduce profitability by 34% compared to quick scalps. Your edge diminishes with time.',
      'Quick scalping strategy aligns perfectly with your trading strengths and market timing abilities. This approach maximizes your skills.',
      'Position management improves significantly in shorter timeframes, reducing emotional interference and market noise impact on decisions.'
    ],
    'time_instrument_analysis': [
      'Early morning (9-10 AM) trading delivers your strongest performance results with ₹245K total profits. Market opening momentum works for you.',
      'BANKNIFTY shows exceptional profitability during your peak trading hours with 58% win rate. Instrument-timing alignment is optimal.',
      'Late afternoon sessions show declining efficiency in your trading approach with reduced win rates. Energy and focus impact performance.',
      'Pre-market preparation translates to superior early session results. Your analysis-to-execution workflow is most effective in morning hours.'
    ],
    'trade_sequence_analysis': [
      'Your first trade of the day consistently outperforms subsequent trades with ₹3,009 average profit versus ₹-20 for later trades.',
      'Performance deteriorates significantly after the 5th trade of the day, indicating fatigue or overconfidence impacts. Fresh focus drives success.',
      'Morning trade discipline creates the foundation for your daily profitability patterns. Initial success breeds continued performance.',
      'Trade sequence management is crucial - your first 3 trades generate 89% of daily profits. Concentration beats distribution.'
    ],
    'direction_analysis': [
      'Your LONG positions significantly outperform SHORT positions by 2:1 ratio with ₹285K profit versus ₹1.4K. Directional bias is working.',
      'Direction bias toward LONG trades aligns with your profitable trading pattern and market analysis skills. Stick with your strengths.',
      'BANKNIFTY LONG trades represent your highest conviction setups with exceptional profitability. This combination is your trading edge.',
      'SHORT position frequency is optimal at current low levels. Your risk assessment correctly identifies limited SHORT opportunities.'
    ]
  };

  const mockRecommendations = {
    'day_analysis': [
      '→ Focus primary trading activities on Wednesday and Tuesday for optimal performance',
      '→ Consider reducing Wednesday exposure or adjusting strategy for this day',
      '→ Maintain Monday preparation routine that drives early-week success'
    ],
    'lot_size_analysis': [
      '→ Focus position sizes in the ₹50K-₹2L range for optimal risk-reward balance',
      '→ Avoid positions above ₹3L unless exceptional conviction exists',
      '→ Implement consistent sizing rules across similar trade setups'
    ],
    'trade_count_analysis': [
      '→ Limit daily trading to 3-5 trades maximum for best performance',
      '→ Avoid overtrading days (6+ trades) that reduce overall efficiency',
      '→ Focus on quality trade selection over frequency to maintain edge'
    ],
    'duration_analysis': [
      '→ Focus on 1-5 minute scalping trades where you show strongest performance',
      '→ Avoid holding positions beyond 60 minutes to maintain profit margins',
      '→ Implement strict time-based exit rules for position management'
    ],
    'time_instrument_analysis': [
      '→ Focus trading during 9-10 AM window with BANKNIFTY for optimal results',
      '→ Avoid late afternoon trading sessions when performance declines',
      '→ Prepare thoroughly for morning sessions to maximize early trading edge'
    ],
    'trade_sequence_analysis': [
      '→ Prioritize first 3 trades of the day where you show maximum profitability',
      '→ Implement strict rules to stop trading after 5 trades per day',
      '→ Focus on maintaining discipline and fresh perspective for each session'
    ],
    'direction_analysis': [
      '→ Focus on LONG positions where you show exceptional performance',
      '→ Limit SHORT trades to high-conviction setups only',
      '→ Specialize in BANKNIFTY LONG trades for maximum profit potential'
    ]
  };

  return {
    success: true,
    insights: mockInsights[analysisType] || mockInsights['day_analysis'],
    recommendations: mockRecommendations[analysisType] || mockRecommendations['day_analysis'],
    riskWarnings: [],
    metadata: {
      tokensUsed: 250,
      cost: 0.0001,
      processingTimeMs: 100,
      generatedAt: new Date(),
      isMock: true
    }
  };
}

/**
 * Create custom trading analysis prompt
 * @param {Object} data - Analysis data
 * @param {string} analysisType - Type of analysis
 * @returns {string} - Formatted prompt
 */
function createTradingAnalysisPrompt(data, analysisType) {
  const prompt = `Analyze this ${analysisType} data for personalized trading insights:

${JSON.stringify(data, null, 2)}

Focus on actionable patterns specific to this trader's performance.`;

  return prompt;
}

/**
 * Validate trading data structure
 * @param {Array} data - Trading data to validate
 * @returns {Object} - Validation result with errors and warnings
 */
function validateTradingData(data) {
  const errors = [];
  const warnings = [];

  if (!Array.isArray(data)) {
    errors.push('Trading data must be an array');
    return { isValid: false, errors, warnings };
  }

  if (data.length === 0) {
    errors.push('Trading data array is empty');
    return { isValid: false, errors, warnings };
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Calculate estimated cost for API usage
 * @param {number} tokens - Number of tokens used
 * @param {string} model - Model name
 * @returns {number} - Estimated cost in USD
 */
function calculateCost(tokens, model = 'gemini-1.5-flash') {
  const costPer1000 = TOKEN_COSTS[model] || TOKEN_COSTS["gemini-1.5-flash"];
  return (tokens / 1000) * costPer1000;
}

/**
 * Estimate token count for a given text
 * @param {string} text - Text to estimate
 * @returns {number} - Estimated token count
 */
function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

/**
 * Get API key for the specified provider
 * @param {Object} config - AI configuration
 * @returns {string|null} - API key if found
 */
function getAPIKeyForProvider(config) {
  if (config.apiKey) {
    return config.apiKey;
  }
  
  switch (config.provider) {
    case 'google':
      return process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    case 'anthropic':
      return process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
    case 'openai':
    default:
      return process.env.OPENAI_API_KEY;
  }
}

/**
 * Get environment variable name for API key based on provider
 * @param {string} provider - AI provider
 * @returns {string} - Environment variable name
 */
function getAPIKeyEnvName(provider) {
  switch (provider) {
    case 'google':
      return 'GOOGLE_API_KEY or GEMINI_API_KEY';
    case 'anthropic':
      return 'ANTHROPIC_API_KEY or CLAUDE_API_KEY';
    case 'openai':
    default:
      return 'OPENAI_API_KEY';
  }
}

/**
 * Validate AI configuration
 * @param {Object} config - AI configuration to validate
 * @returns {Object} - Validation result
 */
function validateAIConfig(config) {
  const validation = {
    isValid: true,
    errors: [],
    warnings: []
  };
  
  // Merge with default config for validation
  const fullConfig = { ...DEFAULT_AI_CONFIG, ...config };
  
  // Check required fields
  const apiKey = getAPIKeyForProvider(fullConfig);
  const envKeyName = getAPIKeyEnvName(fullConfig.provider);
  
  if (!apiKey && process.env.NODE_ENV === 'production') {
    validation.errors.push(`API key is required in production. Set ${envKeyName} environment variable or pass apiKey in config`);
    validation.isValid = false;
  } else if (!apiKey) {
    validation.warnings.push(`No API key provided for ${fullConfig.provider} - using mock responses for development`);
  }
  
  // Check model
  if (config.model && !TOKEN_COSTS[config.model]) {
    validation.warnings.push(`Unknown model '${config.model}' - cost estimation may be inaccurate`);
  }
  
  // Check token limits
  if (config.maxTokens && (config.maxTokens < 50 || config.maxTokens > 4000)) {
    validation.warnings.push('maxTokens should be between 50-4000 for optimal results');
  }
  
  // Check temperature
  if (config.temperature && (config.temperature < 0 || config.temperature > 1)) {
    validation.errors.push('Temperature must be between 0 and 1');
    validation.isValid = false;
  }
  
  return validation;
}

/**
 * Parse AI response to extract specific sections (compatibility with original ai-insights)
 * @param {string} responseText - Raw AI response
 * @param {string} section - Section to extract (insights, recommendations, risk)
 * @returns {string[]} - Array of extracted items
 */
function parseAIResponseSection(responseText, section) {
  const items = [];
  
  try {
    const lines = responseText.split('\n');
    let inSection = false;
    let sectionPattern;
    
    switch (section.toLowerCase()) {
      case 'insights':
        sectionPattern = /key\s+(performance\s+)?patterns|insights/i;
        break;
      case 'recommendations':
        sectionPattern = /actionable\s+recommendations|recommendations/i;
        break;
      case 'risk':
        sectionPattern = /risk\s+management|risk\s+warnings|warnings/i;
        break;
      default:
        return items;
    }
    
    for (let line of lines) {
      line = line.trim();
      
      // Check if we're entering the target section
      if (sectionPattern.test(line)) {
        inSection = true;
        continue;
      }
      
      // For insights, also check for direct numbered/bullet responses (no section header)
      if (section.toLowerCase() === 'insights' && !inSection) {
        if (/^\d+\.|^[*•-]|^→/.test(line)) {
          inSection = true; // Start parsing directly
        }
      }
      
      // Check if we're in a section and found content
      if (inSection && /^\d+\.|^[*•-]|^→/.test(line)) {
        // Extract the actual content
        const content = line.replace(/^\d+\.|^[*•-]|^→/, '').trim();
        if (content.length > 0) {
          items.push(content);
        }
      }
      
      // Stop if we hit another major section (but not for direct numbered responses)
      if (inSection && /^(#{1,3}|##|\*\*)/.test(line) && !sectionPattern.test(line)) {
        break;
      }
    }
  } catch (error) {
    console.warn(`Error parsing AI response section '${section}':`, error.message);
  }
  
  return items;
}

// Export functions
module.exports = {
  generateAIInsights,
  parseAIResponse,
  createTradingAnalysisPrompt,
  validateTradingData,
  createSystemPrompt,
  calculateCost,
  createMockAIResponse,
  cleanInsightText,
  // Compatibility functions from original ai-insights
  callTradingAI: generateAIInsights,
  parseAIResponseSection,
  getAPIKeyForProvider,
  getAPIKeyEnvName,
  validateAIConfig,
  estimateTokens,
  DEFAULT_AI_CONFIG,
  TOKEN_COSTS
};
