import { SmartAPI } from "smartapi-javascript";

export function getSmartAPIInstance(apiKey, apiSecret, accessToken) {
  return new SmartAPI({
    api_key: apiKey,
    api_secret: apiSecret,
    access_token: accessToken,
  });
}
