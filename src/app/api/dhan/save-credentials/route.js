// src/app/api/dhan/save-credentials/route.js
import { encrypt } from '@/lib/encryption';

export async function POST(req) {
  try {
    const { userId, dhanData } = await req.json();
    
    if (!userId || !dhanData) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Encrypt sensitive data before storing
    const encryptedData = {
      clientId: dhanData.clientId,
      ucc: dhanData.ucc,
      poaStatus: dhanData.poaStatus,
      accessToken: encrypt(dhanData.accessToken), // Encrypt the access token
      brokerName: "Dhan",
      connectionTimestamp: new Date().toISOString(),
      isActive: true
    };

    // Save to your database (Firebase, etc.)
    // For now, we'll log it - replace with your database logic
    console.log('Saving Dhan credentials for user:', userId, {
      ...encryptedData,
      accessToken: '***ENCRYPTED***'
    });

    // TODO: Save to your database
    // Example with Firebase:
    // await saveToFirebase(`users/${userId}/brokers/dhan`, encryptedData);

    return new Response(JSON.stringify({
      success: true,
      message: 'Dhan credentials saved successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error saving Dhan credentials:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to save credentials',
      details: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 