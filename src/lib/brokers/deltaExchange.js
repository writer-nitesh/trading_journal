"use server";

import crypto from "crypto";

const BASE_URL = "https://api.india.delta.exchange";

function parseKotakDateTime(dateStr) {
    const [datePart, timePart] = dateStr.split(" ");
    const [day, monthStr, year] = datePart.split("-");
    const monthNames = {
        Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
        Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
    };

    const month = monthNames[monthStr]; // 0–11
    const [hours, minutes, seconds] = timePart.split(":").map(Number);

    const dateObj = new Date(year, month, Number(day), hours, minutes, seconds);

    // format YYYY-MM-DD HH:mm:ss
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
    const dd = String(dateObj.getDate()).padStart(2, "0");
    const hh = String(dateObj.getHours()).padStart(2, "0");
    const min = String(dateObj.getMinutes()).padStart(2, "0");
    const ss = String(dateObj.getSeconds()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}



function generateSignature(secret, message) {
    return crypto.createHmac("sha256", secret).update(message).digest("hex");
}

export async function orders(API_SECRET, API_KEY) {
    try {
        const method = "GET";
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const path = "/v2/fills";
        const queryString = "";
        const payload = "";

        const signatureData = method + timestamp + path + queryString + payload;
        const signature = generateSignature(API_SECRET, signatureData);

        const headers = {
            Accept: "application/json",
            "api-key": API_KEY,
            signature,
            timestamp
        };

        const res = await fetch(`${BASE_URL}${path}`, {
            method,
            headers,
            cache: "no-store",
        });
        const data = await res.json();

        const formattedOrders = data.result.map((order) => {
            return {
                ...order,
                created_at: formatDateTime(new Date(order.created_at)),
                side: order.side.toUpperCase(),
                status: "closed",
            };
        });

        return {
            orders: formattedOrders || [],
            status: "success",
        };
    } catch (err) {
        return {
            error: err.message,
            status: "error",
        };
    }
}
