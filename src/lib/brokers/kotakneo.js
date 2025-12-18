"use server"

import { authenticator } from 'otplib';

const BASE_URL = "https://napi.kotaksecurities.com/oauth2/token";
const LOGIN_URL = 'https://gw-napi.kotaksecurities.com/login/1.0/login/v6/totp/login';
const ORDER_URL = "https://gw-napi.kotaksecurities.com/Orders/2.0/quick/user/orders?sld=server1";
const FINAL_SESSION_URL = "https://gw-napi.kotaksecurities.com/login/1.0/login/v6/totp/validate";

function parseKotakDateTime(dateStr) {
    const [datePart, timePart] = dateStr.split(" ");
    const [day, monthStr, year] = datePart.split("-");
    const monthNames = {
        Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
        Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
    };

    const month = monthNames[monthStr];
    const [hours, minutes, seconds] = timePart.split(":").map(Number);

    return new Date(year, month, day, hours, minutes, seconds);
}


export async function getAccessToken(consumerKey, consumerSecret) {

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

    try {
        const body = new URLSearchParams({
            grant_type: "client_credentials",
        });

        const response = await fetch(BASE_URL, {
            method: "POST",
            headers: {
                "Authorization": `Basic ${auth}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(JSON.stringify(data));
        }

        return {
            accessToken: data.access_token,
            expiresIn: data.expires_in,
            tokenType: data.token_type,
            scope: data.scope,
            status: "success",
        };
    } catch (err) {
        return {
            error: err.message,
            status: "error",
        };
    }
}

export async function viewToken(access_token, mobileNumber, ucc, secret) {
    ``
    try {
        const token = authenticator.generate(secret);

        const body = {
            totp: token,
            mobileNumber: mobileNumber,
            ucc: ucc
        }
        const payload = JSON.stringify(body)

        const response = await fetch(LOGIN_URL, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'neo-fin-key': 'neotradeapi',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${access_token}`,
            },
            body: payload
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(JSON.stringify(data));
        }

        return data.data;

    } catch (err) {
        return { error: err.message, status: 'error' };
    }
}

export async function getFinalSessionToken(bearerToken, sid, auth, mpin) {
    try {
        const response = await fetch(FINAL_SESSION_URL, {
            method: "POST",
            headers: {
                accept: "application/json",
                "sid": sid,
                "Auth": auth,
                "neo-fin-key": "neotradeapi",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${bearerToken}`,
            },
            body: JSON.stringify({ mpin }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(JSON.stringify(data));
        }

        return data.data;
    } catch (err) {
        return { error: err.message, status: "error" };
    }
}


export async function connectKotakNeo(consumerKey, consumerSecret, mobileNumber, ucc, secret, mpin) {

    try {
        const auth = await getAccessToken(consumerKey, consumerSecret)
        const token = await viewToken(auth.accessToken, mobileNumber, ucc, secret)
        const session = await getFinalSessionToken(auth.accessToken, token.sid, token.token, mpin)

        return {
            status: "success",
            accessToken: auth.accessToken,
            sessionId: session.sid,
            sessionToken: session.token
        }
    }
    catch (err) {
        console.log("KOTAK ERROR ", err);

        return { error: err.message, status: "error" };
    }

}


export async function getKotakOrders(accessToken, sessionId, sessionToken) {
    try {
        const response = await fetch(ORDER_URL, {
            method: "GET",
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${accessToken}`,
                Sid: sessionId,
                Auth: sessionToken,
                "neo-fin-key": "neotradeapi",
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(JSON.stringify(data));
        }

        const formattedOrders = (data.data || []).map((order) => {
            const rawDate = order.ordDtTm;

            const formattedOrder = {
                ...order,
                ordDtTm: parseKotakDateTime(rawDate),
                trnsTp: order.trnsTp === "B" ? "BUY" : order.trnsTp === "S" ? "SELL" : order.trnsTp,
            };
            return formattedOrder;
        });

        console.log("Final Orders:", formattedOrders);

        return {
            orders: formattedOrders,
            status: "success",
        };
    } catch (err) {
        return {
            error: err.message,
            status: "error",
        };
    }
}
