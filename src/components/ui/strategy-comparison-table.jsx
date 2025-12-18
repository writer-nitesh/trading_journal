'use client'

import React, { useState, useMemo } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, TrendingUp, TrendingDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '₹0';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value));
};

const formatPercentage = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.0%';
  }
  return `${Number(value).toFixed(1)}%`;
};

const getPerformanceBadge = (value, type) => {
  let variant = 'secondary';
  let icon = null;
  
  if (type === 'pnl') {
    variant = value >= 0 ? 'default' : 'destructive';
    icon = value >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />;
  } else if (type === 'winRate') {
    if (value >= 60) variant = 'default';
    else if (value >= 50) variant = 'secondary';
    else variant = 'destructive';
  } else if (type === 'riskReward') {
    variant = value >= 1.5 ? 'default' : value >= 1 ? 'secondary' : 'destructive';
  }
  
  return { variant, icon };
};

export function StrategyComparisonTable({ strategyMetrics = {} }) {
  const [sorting, setSorting] = useState([{ id: 'totalPnL', desc: true }]);

  const data = useMemo(() => {
    return Object.values(strategyMetrics).map(strategy => ({
      strategy: strategy.strategy,
      totalTrades: strategy.totalTrades,
      winCount: strategy.winCount,
      lossCount: strategy.lossCount,
      winRate: strategy.winRate,
      totalPnL: strategy.totalPnL,
      avgWinSize: strategy.avgWinSize,
      avgLossSize: strategy.avgLossSize,
      riskRewardRatio: strategy.riskRewardRatio,
      profitFactor: strategy.profitFactor,
      avgDuration: strategy.avgDuration,
      avgReturnPct: strategy.avgReturnPct,
    }));
  }, [strategyMetrics]);

  const columns = [
    {
      accessorKey: 'strategy',
      header: 'Strategy',
      cell: ({ row }) => (
        <div className="font-medium capitalize">
          {row.getValue('strategy')}
        </div>
      ),
    },
    {
      accessorKey: 'totalTrades',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2"
        >
          Total Trades
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center font-medium">
          {row.getValue('totalTrades')}
        </div>
      ),
    },
    {
      accessorKey: 'winRate',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2"
        >
          Win Rate
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const winRate = row.getValue('winRate');
        const { variant } = getPerformanceBadge(winRate, 'winRate');
        return (
          <Badge variant={variant} className="justify-center">
            {formatPercentage(winRate)}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'totalPnL',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2"
        >
          Total P&L
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const pnl = row.getValue('totalPnL');
        const { variant, icon } = getPerformanceBadge(pnl, 'pnl');
        return (
          <Badge variant={variant} className="justify-center gap-1">
            {icon}
            {formatCurrency(pnl)}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'winCount',
      header: 'Wins',
      cell: ({ row }) => (
        <div className="text-center text-green-600 font-medium">
          {row.getValue('winCount')}
        </div>
      ),
    },
    {
      accessorKey: 'lossCount',
      header: 'Losses',
      cell: ({ row }) => (
        <div className="text-center text-red-600 font-medium">
          {row.getValue('lossCount')}
        </div>
      ),
    },
    {
      accessorKey: 'avgWinSize',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2"
        >
          Avg Win
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center text-green-600 font-medium">
          {formatCurrency(row.getValue('avgWinSize'))}
        </div>
      ),
    },
    {
      accessorKey: 'avgLossSize',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2"
        >
          Avg Loss
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center text-red-600 font-medium">
          {formatCurrency(row.getValue('avgLossSize'))}
        </div>
      ),
    },
    {
      accessorKey: 'riskRewardRatio',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2"
        >
          Risk:Reward
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const ratio = row.getValue('riskRewardRatio');
        const { variant } = getPerformanceBadge(ratio, 'riskReward');
        return (
          <Badge variant={variant} className="justify-center">
            1:{ratio.toFixed(2)}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'profitFactor',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2"
        >
          Profit Factor
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center font-medium">
          {row.getValue('profitFactor').toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: 'avgDuration',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2"
        >
          Avg Duration
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center font-medium">
          {row.getValue('avgDuration').toFixed(1)}h
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
  });

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Strategy Comparison</CardTitle>
          <CardDescription>Compare performance across different trading strategies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No strategy data available for comparison</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Strategy Comparison Table</CardTitle>
        <CardDescription>
          Detailed performance metrics for each trading strategy
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-center">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className="hover:bg-muted/50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Summary Statistics */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Best Strategy</p>
            <p className="text-lg font-semibold capitalize">
              {data.reduce((best, current) => 
                current.totalPnL > best.totalPnL ? current : best
              ).strategy}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Highest Win Rate</p>
            <p className="text-lg font-semibold">
              {formatPercentage(Math.max(...data.map(s => s.winRate)))}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Trades</p>
            <p className="text-lg font-semibold">
              {data.reduce((sum, s) => sum + s.totalTrades, 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Profitable Strategies</p>
            <p className="text-lg font-semibold">
              {data.filter(s => s.totalPnL > 0).length}/{data.length}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
