# Dhan Integration Setup Guide

This guide will help you set up the Dhan trading API integration in your Next.js application.

## Prerequisites

1. **Dhan Partner Account**: You need to be registered as a Dhan partner to use their Partner API
2. **Partner Credentials**: Dhan will provide you with `partner_id` and `partner_secret`
3. **Redirect URI**: Configure your redirect URI in the Dhan developer portal

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Dhan API Configuration
DHAN_PARTNER_ID=your_dhan_partner_id
DHAN_PARTNER_SECRET=your_dhan_partner_secret

# Encryption (for storing sensitive data)
ENCRYPTION_SECRET=your_32_character_encryption_secret

# Firebase Configuration (if using Firebase)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# Mixpanel (for analytics)
NEXT_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_token
```

## Dhan Partner Registration

1. Contact Dhan to register as a partner
2. They will provide you with:
   - Partner ID
   - Partner Secret
   - API documentation access

## API Endpoints Created

### Backend Endpoints

1. **`/api/dhan/auth/authorize`** (POST)
   - Generates consent for user authentication
   - Returns consent ID and redirect URL

2. **`/api/dhan/auth/callback`** (GET)
   - Handles the callback from Dhan after user consent
   - Consumes the consent to get user details and access token

3. **`/api/dhan/save-credentials`** (POST)
   - Securely saves user's Dhan credentials
   - Encrypts sensitive data before storage

4. **`/api/dhan/portfolio`** (GET)
   - Fetches user's portfolio from Dhan API
   - Requires user ID as query parameter

5. **`/api/dhan/orders`** (GET/POST)
   - GET: Fetches user's orders
   - POST: Places new orders

### Frontend Components

1. **`DhanConnect`** - Handles the connection flow
2. **`DhanPortfolio`** - Displays portfolio and orders
3. **`DhanOrderForm`** - Form for placing orders
4. **`useDhan`** - Custom hook for API calls

## Integration Flow

1. **User clicks "Connect Dhan Account"**
   - Frontend calls `/api/dhan/auth/authorize`
   - Backend generates consent and returns redirect URL

2. **User is redirected to Dhan**
   - User logs in and grants consent
   - Dhan redirects back to your callback URL with token

3. **Callback processing**
   - Backend consumes consent to get user details
   - User is redirected to dashboard with success status

4. **Using the API**
   - Frontend uses `useDhan` hook for API calls
   - Backend decrypts stored access token for API requests

## Security Considerations

1. **Encryption**: All sensitive data (access tokens) are encrypted before storage
2. **Environment Variables**: Never commit API secrets to version control
3. **HTTPS**: Always use HTTPS in production
4. **Token Storage**: Store tokens securely in your database

## Database Integration

You'll need to implement database storage for user credentials. Example structure:

```javascript
// User's Dhan credentials in database
{
  userId: "user_123",
  brokers: {
    dhan: {
      clientId: "dhan_client_id",
      ucc: "user_ucc",
      poaStatus: "ACTIVE",
      accessToken: "encrypted_access_token",
      brokerName: "Dhan",
      connectionTimestamp: "2024-01-01T00:00:00Z",
      isActive: true
    }
  }
}
```

## Testing

1. **Development**: Use Dhan's sandbox environment if available
2. **Production**: Ensure all environment variables are set correctly
3. **Error Handling**: Check browser console and server logs for errors

## Common Issues

1. **"Access Denied"**: Check partner credentials and redirect URI
2. **"Invalid consent"**: Ensure consent flow is followed correctly
3. **"Token expired"**: Implement token refresh logic
4. **CORS errors**: Ensure proper CORS configuration

## Rate Limits

Be aware of Dhan's API rate limits:
- Order APIs: 25/sec, 250/min, 1000/hr, 7000/day
- Data APIs: 10/sec, 1000/min, 5000/hr, 10000/day

## Support

For Dhan API support, refer to the official documentation: https://dhanhq.co/docs/v1/

## Next Steps

1. Set up your environment variables
2. Register as a Dhan partner
3. Test the connection flow
4. Implement database storage
5. Add error handling and retry logic
6. Deploy to production 