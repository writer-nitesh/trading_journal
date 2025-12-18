import CryptoJS from "crypto-js";

const DOMAIN = process.env.BASE_URL

/**
 * Generates the Fyers authorization URL for OAuth flow
 * @param {string} appId - Your Fyers API client ID
 * @param {string} redirectUri - The redirect URI registered with Fyers
 * @param {string} state - A random state string for security (optional, will generate if not provided)
 * @returns {string} The complete authorization URL
 */
export function getFyersLink(appId, state = null) {
  const baseUrl = "https://api-t1.fyers.in/api/v3/generate-authcode";

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: process.env.NODE_ENV == 'development' ? 'https://dev.tradiohub.com/dashboard/connect' : 'https://tradiohub.com/dashboard/connect',
    response_type: "code"
  });
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Validates the Fyers authorization code and generates access token
 * @param {string} appId - Your Fyers API client ID
 * @param {string} appSecret - Your Fyers API secret key
 * @param {string} authCode - The authorization code received from Fyers OAuth flow
 * @returns {Promise<Object>} Response object with access token or error
 */
export async function generateFyersSession(appId, appSecret, authCode) {
  try {
    // Generate SHA-256 hash of appId:appSecret
    const appIdHash = CryptoJS.SHA256(`${appId}:${appSecret}`).toString();

    const requestBody = {
      grant_type: "authorization_code",
      appIdHash: appIdHash,
      code: authCode
    };

    const response = await fetch('https://api-t1.fyers.in/api/v3/validate-authcode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (data.s === "ok") {
      return {
        accessToken: data.access_token,
        status: "success",
        message: data.message || "Authentication successful"
      };
    } else {
      return {
        error: data.message || "Authentication failed",
        status: "error",
        code: data.code
      };
    }
  } catch (error) {
    console.error("Fyers Auth Code Validation Error:", error);
    return {
      error: error.message || "Network error occurred",
      status: "error"
    };
  }
}

/**
 * Fetches all pending GTT Orders from Fyers
 * @param {string} appId - The Fyers App ID (client ID)
 * @param {string} accessToken - The access token obtained from authentication
 * @returns {Promise<Object>} Response object with order book data or error
 */
export async function orders(appId, accessToken) {
  try {
    const authToken = `${appId}:${accessToken}`;

    const response = await fetch('https://api-t1.fyers.in/api/v3/tradebook', {
      method: 'GET',
      headers: {
        'Authorization': authToken,
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();

    if (data.s === "ok" && Array.isArray(data.tradeBook)) {
      data.tradeBook = data.tradeBook.map(trade => ({
        ...trade,
        side: trade.side === 1 ? "BUY" : trade.side === -1 ? "SELL" : trade.side,
        ord_status: "COMPLETE"
      }));

      console.log("data.tradeBook -------------- ", data.tradeBook);

      return {
        status: "success",
        orderBook: data.tradeBook,
      };
    } else {
      return { status: "error", orderBook: [] };
    }
  } catch {
    return { status: "error", orderBook: [] };
  }
}
