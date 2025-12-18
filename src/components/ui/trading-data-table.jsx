'use client';

import React, { useState, useMemo } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronDown, MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import useIsMobile from '@/hooks/useIsMobile';

const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value) || !isFinite(value)) {
    return '₹0';
  }
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(Number(value));
  } catch (error) {
    return '₹0';
  }
};

const formatPercentage = (value) => {
  if (value === null || value === undefined || isNaN(value) || !isFinite(value)) {
    return '0.00%';
  }
  try {
    return `${Number(value).toFixed(2)}%`;
  } catch (error) {
    return '0.00%';
  }
};

const formatDuration = (milliseconds) => {
  if (!milliseconds) return '-';

  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

const columns = [
  {
    accessorKey: 'symbol',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="w-full justify-center"
        >
          Symbol
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="font-medium text-left whitespace-nowrap">{row.getValue('symbol')}</div>,
  },
  {
    accessorKey: 'strategy',
    header: ({ column }) => <div className="text-center">Strategy</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Badge variant="outline" className="capitalize whitespace-nowrap">
          {row.getValue('strategy')}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: 'side',
    header: ({ column }) => <div className="text-center">Side</div>,
    cell: ({ row }) => {
      const side = row.getValue('side');
      return (
        <div className="flex justify-center">
          <Badge variant={side === 'LONG' ? 'success' : 'destructive'} className="text-white whitespace-nowrap">
            {side}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: 'quantity',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="w-full justify-center"
        >
          Quantity
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="text-center whitespace-nowrap">{row.getValue('quantity')}</div>,
  },
  {
    accessorKey: 'entry_price',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="w-full justify-center"
        >
          Entry Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="text-center whitespace-nowrap">{formatCurrency(row.getValue('entry_price'))}</div>,
  },
  {
    accessorKey: 'exit_price',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="w-full justify-center"
        >
          Exit Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const exitPrice = row.getValue('exit_price');
      return <div className="text-center whitespace-nowrap">{exitPrice ? formatCurrency(exitPrice) : '-'}</div>;
    },
  },
  {
    accessorKey: 'pnl',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="w-full justify-center"
        >
          P&L
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const pnl = row.getValue('pnl');
      const safePnl = pnl ?? 0;
      return (
        <div className={`text-center font-medium whitespace-nowrap ${safePnl > 0 ? 'text-green-600' : safePnl < 0 ? 'text-red-600' : 'text-neutral-600'
          }`}>
          {formatCurrency(safePnl)}
        </div>
      );
    },
  },
  {
    accessorKey: 'return_pct',
    header: ({ column }) => <div className="text-center">Return %</div>,
    cell: ({ row }) => {
      const returnPct = row.getValue('return_pct');
      const safeReturnPct = returnPct ?? 0;
      return (
        <div className={`text-center font-medium whitespace-nowrap ${safeReturnPct > 0 ? 'text-green-600' : safeReturnPct < 0 ? 'text-red-600' : 'text-neutral-600'
          }`}>
          {formatPercentage(safeReturnPct)}
        </div>
      );
    },
  },
  {
    accessorKey: 'feelings',
    header: ({ column }) => <div className="text-center">Emotion</div>,
    cell: ({ row }) => {
      const feeling = row.getValue('feelings') || 'Not Selected';
      const getEmotionColor = (feeling) => {
        const colors = {
          'calm': 'bg-green-100 text-green-800',
          'overconfident': 'bg-yellow-100 text-yellow-800',
          'nervous': 'bg-blue-100 text-blue-800',
          'confused': 'bg-purple-100 text-purple-800',
          'revenge': 'bg-red-100 text-red-800',
          'happy': 'bg-pink-100 text-pink-800',
          'fear': 'bg-orange-100 text-orange-800',
          'lettinggo': 'bg-cyan-100 text-cyan-800',
          'hardwork': 'bg-indigo-100 text-indigo-800',
          'wanttolearn': 'bg-emerald-100 text-emerald-800',
          'Not Selected': 'bg-neutral-100 text-neutral-800'
        };
        // Convert the feeling to a more readable format
        const displayText = {
          'calm': 'Calm',
          'overconfident': 'Over confident',
          'nervous': 'Nervous',
          'confused': 'Confused',
          'revenge': 'Revenge mode',
          'happy': 'Happy',
          'fear': 'Fear',
          'lettinggo': 'Letting go',
          'hardwork': 'Hard work paid off',
          'wanttolearn': 'Want to learn',
          'Not Selected': 'Not Selected'
        };
        return (
          <Badge className={colors[feeling] || 'bg-neutral-100 text-neutral-800'} variant="secondary">
            {displayText[feeling] || feeling}
          </Badge>
        );
      };
      return (
        <div className="flex justify-center">
          {getEmotionColor(feeling)}
        </div>
      );
    },
  },
  {
    accessorKey: 'date',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="w-full justify-center"
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue('date'));
      return <div className="text-center whitespace-nowrap">{date.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</div>;
    },
  },
  {
    accessorKey: 'entry_time',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="w-full justify-center"
        >
          Entry Time
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const time = row.getValue('entry_time');
      if (!time) return <div className="text-center">-</div>;
      const date = new Date(time);
      return <div className="text-center whitespace-nowrap">{date.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      })}</div>;
    },
  },
  {
    accessorKey: 'exit_time',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="w-full justify-center"
        >
          Exit Time
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const time = row.getValue('exit_time');
      if (!time) return <div className="text-center">-</div>;
      const date = new Date(time);
      return <div className="text-center whitespace-nowrap">{date.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      })}</div>;
    },
  },
  {
    accessorKey: 'duration',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="w-full justify-center"
        >
          Duration
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const duration = row.getValue('duration');
      return <div className="text-center whitespace-nowrap">{formatDuration(duration)}</div>;
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    header: '',
    cell: ({ row }) => {
      const trade = row.original;

      return (
        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(trade.id)}
              >
                Copy trade ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View details</DropdownMenuItem>
              <DropdownMenuItem>Edit trade</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

export function TradingDataTable({ data = [] }) {

  console.log("TradingDataTable ---->", data);

  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const isMobile = useIsMobile()
  React.useEffect(() => {
    if (isMobile) {
      table.setPageSize(12)
    }
    else {
      table.setPageSize(9)
    }


  }, [table, isMobile]);

  return (
    <div className="w-full p-0 mt-2 flex justify-center flex-col items-center">
      <div className='w-full '>
        <div className="flex items-center gap-2 py-1">
          <Input
            placeholder="Filter by symbol..."
            value={(table.getColumn('symbol')?.getFilterValue()) ?? ''}
            onChange={(event) =>
              table.getColumn('symbol')?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="rounded-md border  overflow-hidden flex  min-h-96 lg:h-[calc(100vh-12.5rem)] h-[calc(100vh-12rem)]">
          <div className="overflow-auto">
            <Table className="w-full">
              <TableHeader className="border-b">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="hover:bg-transparent border-b">
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="text-center align-middle px-2 py-1 font-medium bg-background whitespace-nowrap min-w-[100px]"
                      >
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
                      className="border-b hover:bg-muted/50"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="text-center align-middle px-2 py-2 whitespace-nowrap min-w-[100px] text"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No trades found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-2 py-2 px-2">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getPaginationRowModel().rows.length} of{' '}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}