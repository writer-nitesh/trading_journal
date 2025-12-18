import { db } from "@/lib/firebase/database";
import { doc, getDoc, setDoc } from "firebase/firestore";
import axios from "axios";
import { SmartAPI } from "smartapi-javascript";

// Helper to get date strings for last 3 months
function getDateRange() {
  const to = new Date();
  const from = new Date();
  from.setMonth(from.getMonth() - 3);
  const pad = n => n.toString().padStart(2, '0');
  const format = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} 09:15`;
  return { from: format(from), to: format(to) };
}

export async function POST(req) {
  const { userId, action, symbol, interval, orderParams } = await req.json();
  if (!userId || !action) return new Response(JSON.stringify({ error: "Missing userId or action" }), { status: 400 });

  // Fetch credentials from Firestore
  const credDoc = await getDoc(doc(db, "credentials", userId));
  if (!credDoc.exists()) return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
  const { access_token, api_key, credential } = credDoc.data();
  // For legacy support
  const apiKey = api_key || (credential && credential[0]?.api_key);

  if (!access_token || !apiKey) {
    return new Response(JSON.stringify({ error: "Missing access_token or api_key" }), { status: 400 });
  }

  // Common headers for axios
  const headers = {
    'Content-Type': 'application/json',
    'X-UserType': 'USER',
    'X-SourceID': 'WEB',
    'X-ClientLocalIP': '127.0.0.1',
    'X-ClientPublicIP': '127.0.0.1',
    'X-MACAddress': '00:00:00:00:00:00',
    'X-PrivateKey': apiKey,
    'Authorization': `Bearer ${access_token}`,
  };

  try {
    let data, endpoint, savePath;
    switch (action) {
      case "holdings":
        endpoint = 'https://apiconnect.angelbroking.com/rest/secure/angelbroking/portfolio/v1/getAllHolding';
        data = (await axios.get(endpoint, { headers })).data;
        savePath = ["holdings", "latest"];
        break;
      case "orderbook":
        endpoint = 'https://apiconnect.angelbroking.com/rest/secure/angelbroking/order/v1/getOrderBook';
        data = (await axios.get(endpoint, { headers })).data;
        savePath = ["orderBook", "latest"];
        break;
      case "trades":
        endpoint = 'https://apiconnect.angelbroking.com/rest/secure/angelbroking/order/v1/getTradeBook';
        data = (await axios.get(endpoint, { headers })).data;
        savePath = ["trades", "latest"];
        break;
      case "candles":
        if (!symbol) return new Response(JSON.stringify({ error: "Missing symbol" }), { status: 400 });
        const { from, to } = getDateRange();
        const smartapi = new SmartAPI({ api_key: apiKey, access_token });
        data = await smartapi.getCandleData({
          exchange: "NSE",
          tradingsymbol: symbol,
          interval: interval || "ONE_DAY",
          fromdate: from,
          todate: to,
        });
        savePath = ["candles", symbol];
        break;
      case "placeOrder":
        if (!orderParams) return new Response(JSON.stringify({ error: "Missing orderParams" }), { status: 400 });
        const smartapiOrder = new SmartAPI({ api_key: apiKey, access_token });
        data = await smartapiOrder.placeOrder(orderParams);
        savePath = null; // Don't save orders by default
        break;
      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400 });
    }

    // Save to Firestore if applicable
    if (savePath) {
      await setDoc(doc(db, "users", userId, savePath[0], savePath[1]), {
        data,
        fetchedAt: new Date(),
      });
    }

    return new Response(JSON.stringify({ success: true, data }), { status: 200 });
  } catch (error) {
    console.error("AngelOne API error:", error.response?.data || error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}