// src/app/api/dhan/orders/route.js
import { decrypt } from '@/lib/encryption';

export async function POST(req) {
  try {
    const { userId, orderData } = await req.json();

    if (!userId || !orderData) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // TODO: Get user's Dhan credentials from database
    const userCredentials = {
      accessToken: 'YOUR_ENCRYPTED_ACCESS_TOKEN', // Get from database
      clientId: 'YOUR_CLIENT_ID' // Get from database
    };

    // Decrypt the access token
    const decryptedToken = decrypt(userCredentials.accessToken);

    // Place order using Dhan API
    const orderResponse = await fetch('https://api.dhan.co/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access-token': decryptedToken
      },
      body: JSON.stringify({
        ...orderData,
        clientId: userCredentials.clientId
      })
    });

    if (!orderResponse.ok) {
      console.error('Dhan order API error:', await orderResponse.text());
      return new Response(JSON.stringify({ 
        error: 'Failed to place order',
        details: await orderResponse.text()
      }), { 
        status: orderResponse.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const orderResult = await orderResponse.json();

    return new Response(JSON.stringify({
      success: true,
      order: orderResult
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error placing Dhan order:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Get orders
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return new Response(JSON.stringify({ 
        error: 'Missing userId' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // TODO: Get user's Dhan credentials from database
    const userCredentials = {
      accessToken: 'YOUR_ENCRYPTED_ACCESS_TOKEN', // Get from database
      clientId: 'YOUR_CLIENT_ID' // Get from database
    };

    // Decrypt the access token
    const decryptedToken = decrypt(userCredentials.accessToken);

    // Fetch orders from Dhan API
    const ordersResponse = await fetch('https://api.dhan.co/orders', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'access-token': decryptedToken
      }
    });

    if (!ordersResponse.ok) {
      console.error('Dhan orders API error:', await ordersResponse.text());
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch orders',
        details: await ordersResponse.text()
      }), { 
        status: ordersResponse.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const ordersData = await ordersResponse.json();

    return new Response(JSON.stringify({
      success: true,
      orders: ordersData
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching Dhan orders:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 