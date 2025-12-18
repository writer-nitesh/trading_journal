"use server"

export async function getAngleOneLink(apiKey) {
    return `https://smartapi.angelone.in/publisher-login?api_key=${apiKey}&state=success`
}


export async function generateAngleOneSession(authToken, refreshToken, apiKey) {
    const formData = new URLSearchParams();
    formData.append('refreshToken', refreshToken);

    console.log("Form data -----> ", formData.toString());


    const response = await fetch('https://apiconnect.angelone.in/rest/auth/angelbroking/jwt/v1/generateTokens', {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-PrivateKey': apiKey,
            'Authorization': `Bearer ${authToken}`,

        },
        body: formData.toString()
    });

    const data = await response.json()

    if (data.status) {
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

export async function orders() {

    const orders = await fetch('https://apiconnect.angelone.in/rest/secure/angelbroking/order/v1/getOrderBook', {
        method: 'GET',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-PrivateKey': apiKey,
            'Authorization': `Bearer ${authToken}`,

        },
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