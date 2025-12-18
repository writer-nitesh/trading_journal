"use client";

import { useState } from 'react';
import { useDhan } from '@/hooks/useDhan';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export default function DhanOrderForm() {
  const [orderData, setOrderData] = useState({
    symbol: '',
    quantity: '',
    price: '',
    orderType: 'BUY',
    productType: 'CNC', // CNC for delivery, MIS for intraday
    validity: 'DAY'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const { placeOrder } = useDhan();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!orderData.symbol || !orderData.quantity || !orderData.price) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await placeOrder({
        ...orderData,
        quantity: parseInt(orderData.quantity),
        price: parseFloat(orderData.price)
      });

      setSuccess(`Order placed successfully! Order ID: ${result.orderId}`);
      
      // Reset form
      setOrderData({
        symbol: '',
        quantity: '',
        price: '',
        orderType: 'BUY',
        productType: 'CNC',
        validity: 'DAY'
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setOrderData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Place Order</CardTitle>
        <CardDescription>Place a new trading order through Dhan</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Symbol */}
          <div>
            <Label htmlFor="symbol">Symbol *</Label>
            <Input
              id="symbol"
              type="text"
              placeholder="e.g., RELIANCE, TCS"
              value={orderData.symbol}
              onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
              required
            />
          </div>

          {/* Order Type */}
          <div>
            <Label htmlFor="orderType">Order Type</Label>
            <Select 
              value={orderData.orderType} 
              onValueChange={(value) => handleInputChange('orderType', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BUY">
                  <Badge variant="default">BUY</Badge>
                </SelectItem>
                <SelectItem value="SELL">
                  <Badge variant="secondary">SELL</Badge>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quantity */}
          <div>
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              placeholder="Number of shares"
              value={orderData.quantity}
              onChange={(e) => handleInputChange('quantity', e.target.value)}
              required
            />
          </div>

          {/* Price */}
          <div>
            <Label htmlFor="price">Price *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              placeholder="Price per share"
              value={orderData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              required
            />
          </div>

          {/* Product Type */}
          <div>
            <Label htmlFor="productType">Product Type</Label>
            <Select 
              value={orderData.productType} 
              onValueChange={(value) => handleInputChange('productType', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CNC">CNC (Delivery)</SelectItem>
                <SelectItem value="MIS">MIS (Intraday)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Validity */}
          <div>
            <Label htmlFor="validity">Validity</Label>
            <Select 
              value={orderData.validity} 
              onValueChange={(value) => handleInputChange('validity', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DAY">Day</SelectItem>
                <SelectItem value="IOC">IOC (Immediate or Cancel)</SelectItem>
                <SelectItem value="FOK">FOK (Fill or Kill)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
              {success}
            </div>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Placing Order...' : 'Place Order'}
          </Button>
        </form>

        {/* Order Summary */}
        {orderData.symbol && orderData.quantity && orderData.price && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <h4 className="font-medium mb-2">Order Summary</h4>
            <div className="text-sm space-y-1">
              <p><span className="font-medium">Symbol:</span> {orderData.symbol}</p>
              <p><span className="font-medium">Type:</span> {orderData.orderType}</p>
              <p><span className="font-medium">Quantity:</span> {orderData.quantity}</p>
              <p><span className="font-medium">Price:</span> ₹{orderData.price}</p>
              <p><span className="font-medium">Total:</span> ₹{(orderData.quantity * orderData.price).toFixed(2)}</p>
              <p><span className="font-medium">Product:</span> {orderData.productType}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 