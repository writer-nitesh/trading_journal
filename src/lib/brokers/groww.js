'use server'

/**
 * Get today's placed orders from Groww
 * @param {string} accessToken - Groww Access Token (Bearer)
 * @returns {Promise<object>} - { status: "success"|"error", orders|error }
 */
export const getGrowwOrders = async (accessToken) => {
    try {
        const res = await fetch(`https://api.groww.in/v1/order/list`, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${accessToken}`,
                "X-API-VERSION": "1.0",
            },
        });

        const data = await res.json();

        console.log(res,"--***");
        

        if (!res.ok || data.status !== "SUCCESS") {
            throw new Error(data?.error?.message || "Failed to fetch Groww orders");
        }

        return {
            status: "success",
            orders: data.payload?.order_list || []
        };
    } catch (error) {
        return {
            status: "error",
            error: error.message
        };
    }
};
