import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import { Salsa } from "next/font/google"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getCookie(cookieName) {
  const name = cookieName + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(';');

  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i].trimStart();

    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }
  return "";
}

export function removeCookie(cookieName) {
  const basePath = '/';
  const currentPath = window.location.pathname;
  [basePath, currentPath].forEach(path => {
    document.cookie = `${cookieName}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; SameSite=Lax;`;
  });
}

export function setConnectedBroker(broker, key, ttl = 1) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000 * ttl).toUTCString();
  document.cookie = `connectedBroker=${JSON.stringify({ broker, key })}; path =/; expires=${expires}; SameSite=Lax;`;
}


export const salsaFont = Salsa({
  weight: '400',
  subsets: ['latin'],
})


export function formatNumber(num) {
  if (num === null || num === undefined) return '-';

  const absNum = Math.abs(num);

  if (absNum >= 1_000_000_000_000) {
    return (num / 1_000_000_000_000).toFixed(1).replace(/\.0$/, '') + 'T';
  }
  if (absNum >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  if (absNum >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (absNum >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }

  return num.toString();
}

export const truncateText = (text, maxLength = 7) => {
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

export function parseBrokerTimestamp(timestamp) {
  if (!timestamp) return null;
  if (typeof timestamp.toDate === 'function') return timestamp.toDate().toISOString(); // Firestore Timestamp
  if (typeof timestamp.seconds === 'number') return new Date(timestamp.seconds * 1000).toISOString(); // Firestore { seconds }
  const parsed = new Date(timestamp);
  return isNaN(parsed.getTime()) ? null : parsed.toISOString(); // ISO string or Date
}

export function generateRandomId(prefix = '') {
    const randomStr = Math.random().toString(36).substring(2, 10); // 8-char random string
    return `${prefix}_${randomStr}`;
}

export function parseOrderDate(dateStr){
  if (!dateStr) return null;

  // Try native parsing
  const direct = new Date(dateStr);
  if (!isNaN(direct.getTime())) {
    return direct.toISOString().split("T")[0]; // "2025-08-18"
  }

  // Try custom "18-Aug-2025 10:04:02"
  const regex = /^(\d{1,2})-([A-Za-z]{3})-(\d{4})/;
  const match = dateStr.match(regex);

  if (match) {
    const [, day, monthStr, year] = match;
    const months = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
      Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
    };
    const month = months[monthStr];
    if (month === undefined) return null;

    const date = new Date(Number(year), month, Number(day));
    return date.toISOString().split("T")[0]; // always YYYY-MM-DD
  }

  return null;
}

export function normalizeDate(d) {
  if (!d) return null;
  const parsed = new Date(d);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split("T")[0];
  }
  // fallback for dd-MMM-yyyy
  const [day, monthStr, year] = d.split("-");
  const months = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };
  const month = months[monthStr];
  if (month === undefined) return null;
  const safeDate = new Date(Number(year), month, Number(day));
  return safeDate.toISOString().split("T")[0];
}
