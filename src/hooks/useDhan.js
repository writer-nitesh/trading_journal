"use client";

import { useState, useEffect } from 'react';
import { useAuth } from './authProvider';

export function useDhan() {
  const [portfolio, setPortfolio] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Fetch portfolio
  const fetchPortfolio = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/dhan/portfolio?userId=${user.uid}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch portfolio');
      }

      setPortfolio(data.portfolio);
    } catch (err) {
      console.error('Error fetching portfolio:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch orders
  const fetchOrders = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/dhan/orders?userId=${user.uid}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch orders');
      }

      setOrders(data.orders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Place order
  const placeOrder = async (orderData) => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/dhan/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          orderData
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      // Refresh orders after placing new order
      await fetchOrders();
      
      return data.order;
    } catch (err) {
      console.error('Error placing order:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Save Dhan credentials
  const saveCredentials = async (dhanData) => {
    if (!user) return;

    try {
      const response = await fetch('/api/dhan/save-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          dhanData
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save credentials');
      }

      return data;
    } catch (err) {
      console.error('Error saving credentials:', err);
      throw err;
    }
  };

  return {
    portfolio,
    orders,
    isLoading,
    error,
    fetchPortfolio,
    fetchOrders,
    placeOrder,
    saveCredentials
  };
} 