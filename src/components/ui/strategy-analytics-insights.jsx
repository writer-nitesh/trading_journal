'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  BarChart3, 
  Clock, 
  DollarSign,
  Award,
  AlertTriangle,
  Activity
} from 'lucide-react';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatPercentage = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.0%';
  }
  return `${Number(value).toFixed(1)}%`;
};

const formatNumber = (value, decimals = 2) => {
  return Number(value).toFixed(decimals);
};

const getStrategyGrade = (strategy) => {
  const { winRate, profitFactor, totalPnL } = strategy;
  
  if (winRate >= 70 && profitFactor >= 2.0 && totalPnL > 0) return 'A+';
  if (winRate >= 60 && profitFactor >= 1.5 && totalPnL > 0) return 'A';
  if (winRate >= 50 && profitFactor >= 1.2 && totalPnL > 0) return 'B';
  if (winRate >= 40 && profitFactor >= 1.0) return 'C';
  return 'D';
};

const getGradeColor = (grade) => {
  const colors = {
    'A+': 'bg-green-500 text-white',
    'A': 'bg-green-400 text-white',
    'B': 'bg-blue-400 text-white',
    'C': 'bg-yellow-400 text-black',
    'D': 'bg-red-400 text-white'
  };
  return colors[grade] || colors['D'];
};

export function StrategyAnalyticsInsights({ strategyMetrics = {}, portfolioMetrics = {} }) {
  const [selectedView, setSelectedView] = useState('performance');
  const strategies = Object.values(strategyMetrics);
  
  if (strategies.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <p className="text-muted-foreground">No strategy analytics available</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate insights
  const topPerformer = strategies.reduce((best, current) => 
    current.totalPnL > best.totalPnL ? current : best);
  
  const mostConsistent = strategies.reduce((best, current) => 
    current.winRate > best.winRate ? current : best);
  
  const needsImprovement = strategies.filter(s => s.totalPnL < 0 || s.winRate < 40);
  
  const avgProfitFactor = strategies.reduce((sum, s) => sum + s.profitFactor, 0) / strategies.length;
  
  return (
    <div className="space-y-6">
      {/* Key Insights Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-green-600" />
              <CardTitle className="text-sm text-green-800">Top Performer</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-lg font-bold text-green-900 capitalize">{topPerformer.strategy}</p>
              <p className="text-sm text-green-700">{formatCurrency(topPerformer.totalPnL)}</p>
              <Badge className={getGradeColor(getStrategyGrade(topPerformer))}>
                Grade: {getStrategyGrade(topPerformer)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-sm text-blue-800">Most Consistent</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-lg font-bold text-blue-900 capitalize">{mostConsistent.strategy}</p>
              <p className="text-sm text-blue-700">{formatPercentage(mostConsistent.winRate)} Win Rate</p>
              <Badge className={getGradeColor(getStrategyGrade(mostConsistent))}>
                Grade: {getStrategyGrade(mostConsistent)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <CardTitle className="text-sm text-yellow-800">Need Attention</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-lg font-bold text-yellow-900">{needsImprovement.length}</p>
              <p className="text-sm text-yellow-700">
                {needsImprovement.length === 1 ? 'Strategy' : 'Strategies'} underperforming
              </p>
              <Badge variant="outline" className="border-yellow-300 text-yellow-700">
                Review Required
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Strategy Performance Analysis</CardTitle>
          <CardDescription>
            Comprehensive breakdown of each strategy's performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="rankings" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="rankings">Rankings</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>

            <TabsContent value="rankings" className="space-y-4">
              <div className="space-y-3">
                {strategies
                  .sort((a, b) => b.totalPnL - a.totalPnL)
                  .map((strategy, index) => (
                    <div key={strategy.strategy} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold capitalize">{strategy.strategy}</p>
                          <p className="text-sm text-muted-foreground">
                            {strategy.totalTrades} trades • {formatPercentage(strategy.winRate)} win rate
                          </p>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <p className={`font-bold ${strategy.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(strategy.totalPnL)}
                        </p>
                        <Badge className={getGradeColor(getStrategyGrade(strategy))}>
                          {getStrategyGrade(strategy)}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Portfolio Health</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Average Profit Factor</span>
                      <span className="font-semibold">{formatNumber(avgProfitFactor)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Profitable Strategies</span>
                      <span className="font-semibold text-green-600">
                        {strategies.filter(s => s.totalPnL > 0).length}/{strategies.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">High Win Rate ({">"}60%)</span>
                      <span className="font-semibold text-blue-600">
                        {strategies.filter(s => s.winRate > 60).length}/{strategies.length}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Risk Assessment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Strategies at Risk</span>
                      <span className="font-semibold text-red-600">
                        {strategies.filter(s => s.totalPnL < 0).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Low Win Rate ({"<"}40%)</span>
                      <span className="font-semibold text-yellow-600">
                        {strategies.filter(s => s.winRate < 40).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Poor Risk:Reward ({"<"}1)</span>
                      <span className="font-semibold text-orange-600">
                        {strategies.filter(s => s.riskRewardRatio < 1).length}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              <div className="space-y-4">
                {needsImprovement.length > 0 && (
                  <Card className="border-red-200 bg-red-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-red-800">Immediate Actions Required</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-red-700">
                        {needsImprovement.map(strategy => (
                          <li key={strategy.strategy} className="flex items-center space-x-2">
                            <AlertTriangle className="h-4 w-4" />
                            <span>
                              <strong className="capitalize">{strategy.strategy}</strong>: 
                              {strategy.totalPnL < 0 && " Negative P&L"}
                              {strategy.winRate < 40 && " Low win rate"}
                              {strategy.riskRewardRatio < 1 && " Poor risk-reward"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                <Card className="border-green-200 bg-green-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-green-800">Optimization Opportunities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-green-700">
                      <li className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4" />
                        <span>Focus more capital on {topPerformer.strategy} strategy</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Target className="h-4 w-4" />
                        <span>Improve entry/exit timing for strategies with low win rates</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4" />
                        <span>Consider position sizing adjustments based on strategy performance</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
