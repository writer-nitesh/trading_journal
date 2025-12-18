// src/app/api/dhan/portfolio/route.js
import { decrypt } from '@/lib/encryption';

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
    // For now, we'll use a placeholder
    const userCredentials = {
      accessToken: 'YOUR_ENCRYPTED_ACCESS_TOKEN', // Get from database
      clientId: 'YOUR_CLIENT_ID' // Get from database
    };

    // Decrypt the access token
    const decryptedToken = decrypt(userCredentials.accessToken);

    // Fetch portfolio from Dhan API
    const portfolioResponse = await fetch('https://api.dhan.co/portfolio', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'access-token': decryptedToken
      }
    });

    if (!portfolioResponse.ok) {
      console.error('Dhan portfolio API error:', await portfolioResponse.text());
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch portfolio',
        details: await portfolioResponse.text()
      }), { 
        status: portfolioResponse.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const portfolioData = await portfolioResponse.json();

    return new Response(JSON.stringify({
      success: true,
      portfolio: portfolioData
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching Dhan portfolio:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 