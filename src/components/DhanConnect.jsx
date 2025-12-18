"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/authProvider';

export default function DhanConnect() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const handleDhanConnect = async () => {
    if (!user) {
      setError('Please login first');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Step 1: Generate consent
      const response = await fetch('/api/dhan/auth/authorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate Dhan connection');
      }

      if (data.success && data.redirectUrl) {
        // Step 2: Redirect user to Dhan consent login
        window.location.href = data.redirectUrl;
      } else {
        throw new Error('Invalid response from server');
      }

    } catch (err) {
      console.error('Error connecting to Dhan:', err);
      setError(err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <img 
            src="/public/brokers/dhan_logo.svg" 
            alt="Dhan" 
            className="w-8 h-8"
          />
          Connect Dhan Account
        </CardTitle>
        <CardDescription>
          Connect your Dhan trading account to access your portfolio, place orders, and track your trades.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}
        
        <Button 
          onClick={handleDhanConnect}
          disabled={isConnecting || !user}
          className="w-full"
        >
          {isConnecting ? 'Connecting...' : 'Connect Dhan Account'}
        </Button>
        
        <div className="mt-4 text-xs text-gray-500">
          <p>• Secure OAuth connection</p>
          <p>• Read-only access to your portfolio</p>
          <p>• Place orders through our platform</p>
        </div>
      </CardContent>
    </Card>
  );
} 