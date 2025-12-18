import { NextResponse } from 'next/server';
import { sessionStore } from '@/lib/angeloneSessionStore';

export async function POST(req) {
  try {
    const body = await req.json();
    const { auth_token, feed_token, client_code, api_key, secret_key, totp } = body;
    if (!auth_token || !feed_token || !client_code || !api_key || !secret_key || !totp) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Call Angel One SmartAPI generateSession
    const response = await fetch('https://apiconnect.angelbroking.com/rest/auth/angelbroking/user/v1/loginByPassword', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-UserType': 'USER',
        'X-SourceID': 'WEB',
        'X-ClientLocalIP': '127.0.0.1',
        'X-ClientPublicIP': '127.0.0.1',
        'X-MACAddress': '00:00:00:00:00:00',
        'X-PrivateKey': api_key,
      },
      body: JSON.stringify({
        clientcode: client_code,
        password: totp,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data.message || 'Failed to generate session' }, { status: 401 });
    }

    // Store tokens in-memory (replace with Firebase for production)
    sessionStore[client_code] = {
      jwt_token: data.data.jwtToken,
      refresh_token: data.data.refreshToken,
      feed_token,
      created: Date.now(),
    };

    return NextResponse.json({ success: true, jwt_token: data.data.jwtToken });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
} 