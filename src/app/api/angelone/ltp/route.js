import { NextResponse } from 'next/server';
import { sessionStore } from '@/lib/angeloneSessionStore';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get('symbol');
    const client_code = searchParams.get('client_code');
    if (!symbol || !client_code) {
      return NextResponse.json({ error: 'Missing symbol or client_code' }, { status: 400 });
    }
    const session = sessionStore[client_code];
    if (!session || !session.jwt_token) {
      return NextResponse.json({ error: 'Session not found' }, { status: 401 });
    }
    // Call Angel One SmartAPI LTP endpoint
    const response = await fetch('https://apiconnect.angelbroking.com/rest/secure/angelbroking/order/v1/getLtpData', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-UserType': 'USER',
        'X-SourceID': 'WEB',
        'X-ClientLocalIP': '127.0.0.1',
        'X-ClientPublicIP': '127.0.0.1',
        'X-MACAddress': '00:00:00:00:00:00',
        'X-PrivateKey': process.env.ANGEL_API_KEY,
        'Authorization': `Bearer ${session.jwt_token}`,
      },
      body: JSON.stringify({
        exchange: 'NSE',
        tradingsymbol: symbol,
        symboltoken: symbol,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data.message || 'Failed to fetch LTP' }, { status: 400 });
    }
    return NextResponse.json({ ltp: data.data.ltp, data: data.data });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
} 