"use server"

export async function getUpstoxLink(apikey, redirectURL) {
    return `https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=${apikey}&redirect_uri=${redirectURL}&state=success
`   
}


export async function getUpstoxSession(apiKey, code, apiSecret, redirectURL) {

    const response = await fetch('https://api.upstox.com/v2/login/authorization/token', {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `code=${code}&client_id=${apiKey}&client_secret=${apiSecret}&redirect_uri=${redirectURL}&grant_type=authorization_code`
    });
    const data = await response.json()

    if (data.access_token) {

        return {
            accessToken: data.access_token,
            status: "success"
        };
    }
    if (data.status === "error") {
        return {
            error: data.errors[0].message,
            status: "error"
        };
    }
}

export async function orders(token) {
    const orders = await fetch('https://api.upstox.com/v2/order/retrieve-all', {
        headers: {
            'Accept': 'application/json',
            "Authorization": `Bearer ${token}`,
        }
    });

    const data = await orders.json()

    if (data.status === "success") {
        return {
            orders: data.data,
            status: "success"
        };
    }
    return {
        error: "Something Went Wrong",
        status: "error"
    };
}