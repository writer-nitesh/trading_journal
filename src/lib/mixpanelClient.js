// src/lib/mixpanelClient.js
import mixpanel from 'mixpanel-browser';

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
let isInitialized = false;

export const initMixpanel = () => {
  if (!MIXPANEL_TOKEN) {
    console.warn('Mixpanel token is missing! Check your .env file.');
    return;
  }
  if (!isInitialized) {
    mixpanel.init(MIXPANEL_TOKEN, { autocapture: false });
    isInitialized = true;
  }
};

export const trackEvent = (eventName, properties = {}) => {
  if (typeof window !== "undefined") {
    if (!isInitialized) {
      initMixpanel();
    }
    if (isInitialized) {
      mixpanel.track(eventName, properties);
    }
  }
};
