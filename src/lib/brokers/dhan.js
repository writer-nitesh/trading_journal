'use server'
/**
 * Fetches all orders from Dhan API
 * @param {string} accessToken - The Dhan access token
 * @returns {Promise<Array<object>>} - A promise which resolves to an object with two properties: status and data/error. If the request is successful, status is "success" and data is the response from the API. If the request fails, status is "error" and error is the error message.
 */
export const getDhanOrders = async (accessToken) => {
    console.log("Access Token",accessToken );
    
    try {
        const orders = await fetch('https://api.dhan.co/v2/orders', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'access-token': accessToken
            }
        });
        
          console.log(orders);
         const ordersData = await orders.json();
         console.log(ordersData);

        if (!orders.ok) {
            throw new Error("Failed to fetch orders");
        }
      
        return {
            status: "success",
            orders: ordersData
        }
    }
    catch (error) {
        console.log("Dhan Session Error:", error);

        return {
            status: "error",
            error: error.message
        }
    }
}


