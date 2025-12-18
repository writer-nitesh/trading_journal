// src/app/api/dhan/auth/authorize/route.js
export async function POST(req) {
  try {
    const { userId } = await req.json();
    
    // Step 1: Generate consent
    const consentResponse = await fetch('https://auth.dhan.co/partner/generate-consent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'partner_id': process.env.DHAN_PARTNER_ID,
        'partner_secret': process.env.DHAN_PARTNER_SECRET
      }
    });

    if (!consentResponse.ok) {
      console.error('Failed to generate consent:', await consentResponse.text());
      return new Response(JSON.stringify({ 
        error: 'Failed to generate consent',
        details: await consentResponse.text()
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const consentData = await consentResponse.json();
    const consentId = consentData.consentId;

    if (!consentId) {
      return new Response(JSON.stringify({ 
        error: 'No consent ID received',
        response: consentData
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Store consent ID temporarily (you might want to use Redis or database)
    // For now, we'll return it to the frontend to handle the redirect
    
    return new Response(JSON.stringify({
      success: true,
      consentId: consentId,
      redirectUrl: `https://auth.dhan.co/consent-login?consentId=${consentId}`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in Dhan authorize:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  }