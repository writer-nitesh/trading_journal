// src/app/api/dhan/auth/callback/route.js
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const tokenId = searchParams.get("tokenid");

    if (!tokenId) {
      console.error('No tokenId received in callback');
      return new Response("Missing tokenId", { status: 400 });
    }

    // Step 3: Consume consent to get user details and access token
    const consumeResponse = await fetch(`https://auth.dhan.co/partner/consume-consent?tokenId=${tokenId}`, {
      method: 'GET',
      headers: {
        'partner_id': process.env.DHAN_PARTNER_ID,
        'partner_secret': process.env.DHAN_PARTNER_SECRET
      }
    });

    if (!consumeResponse.ok) {
      console.error('Failed to consume consent:', await consumeResponse.text());
      return new Response("Failed to consume consent", { status: 400 });
    }

    const userData = await consumeResponse.json();
    
    // Extract user details from the response
    const {
      clientId,
      ucc,
      poaStatus,
      accessToken,
      // Add other fields as per Dhan's response structure
    } = userData;

    // Log user data for debugging
    console.log('Dhan user data received:', {
      clientId,
      ucc,
      poaStatus,
      accessToken: accessToken ? '***' : 'missing',
      brokerName: "Dhan",
      connectionTimestamp: new Date().toISOString(),
      fullResponse: userData
    });

    // Store user data securely (you should encrypt sensitive data)
    // For now, we'll redirect with success status
    // In production, you should save this to your database
    
    // Redirect to dashboard with success status
    return Response.redirect("/dashboard?dhan=success", 302);

  } catch (error) {
    console.error('Error in Dhan callback:', error);
    return new Response("Internal server error", { status: 500 });
  }
}
