"use client";

import { useEffect } from 'react';
import { useDhan } from '@/hooks/useDhan';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function DhanPortfolio() {
  const { 
    portfolio, 
    orders, 
    isLoading, 
    error, 
    fetchPortfolio, 
    fetchOrders 
  } = useDhan();

  useEffect(() => {
    fetchPortfolio();
    fetchOrders();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <p>Error: {error}</p>
            <Button 
              onClick={() => {
                fetchPortfolio();
                fetchOrders();
              }}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      {portfolio && (
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Summary</CardTitle>
            <CardDescription>Your current holdings and positions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Total Value</p>
                <p className="text-2xl font-bold">
                  ₹{portfolio.totalValue?.toLocaleString() || 'N/A'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Available Balance</p>
                <p className="text-2xl font-bold">
                  ₹{portfolio.availableBalance?.toLocaleString() || 'N/A'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Used Margin</p>
                <p className="text-2xl font-bold">
                  ₹{portfolio.usedMargin?.toLocaleString() || 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Holdings */}
      {portfolio?.holdings && portfolio.holdings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Holdings</CardTitle>
            <CardDescription>Your current stock holdings</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Avg Price</TableHead>
                  <TableHead>Current Price</TableHead>
                  <TableHead>P&L</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {portfolio.holdings.map((holding, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{holding.symbol}</TableCell>
                    <TableCell>{holding.quantity}</TableCell>
                    <TableCell>₹{holding.avgPrice?.toFixed(2)}</TableCell>
                    <TableCell>₹{holding.currentPrice?.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={holding.pnl >= 0 ? "default" : "destructive"}>
                        ₹{holding.pnl?.toFixed(2)}
                      </Badge>
                    </TableCell>
                    <TableCell>₹{holding.value?.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Orders */}
      {orders && orders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your recent trading orders</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{order.orderId}</TableCell>
                    <TableCell>{order.symbol}</TableCell>
                    <TableCell>
                      <Badge variant={order.orderType === 'BUY' ? "default" : "secondary"}>
                        {order.orderType}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell>₹{order.price?.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          order.status === 'COMPLETE' ? "default" : 
                          order.status === 'PENDING' ? "secondary" : "destructive"
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(order.timestamp).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* No Data */}
      {(!portfolio || !portfolio.holdings?.length) && (!orders || !orders.length) && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <p>No portfolio or order data available</p>
              <Button 
                onClick={() => {
                  fetchPortfolio();
                  fetchOrders();
                }}
                className="mt-2"
              >
                Refresh Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 