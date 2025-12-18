const brokerDataMap = {
    "zerodha": {
        status: "status",
        order_timestamp: "exchange_update_timestamp",
        tradingsymbol: "tradingsymbol",
        quantity: "filled_quantity",
        average_price: "average_price",
        transaction_type: "transaction_type",
        id: "order_id"
    },

    "upstox": {
        order_timestamp: "exchange_timestamp",
        tradingsymbol: "tradingsymbol",
        quantity: "filled_quantity",
        average_price: "average_price",
        transaction_type: "transaction_type",
        id: "order_ref_id",
        status: "status"
    },

    "dhan": {
        order_timestamp: "exchangeTime",
        tradingsymbol: "tradingSymbol",
        quantity: "filledQty",
        average_price: "averageTradedPrice",
        transaction_type: "transactionType",
        id: "orderId",
        status: "orderStatus"
    },

    "fyers": {
        order_timestamp: "orderDateTime",
        tradingsymbol: "symbol",
        quantity: "tradedQty",
        average_price: "tradePrice",
        transaction_type: "side",
        id: "tradeNumber",
        status: "ord_status"
    },
    "angle one": {
        order_timestamp: "averageprice",
        tradingsymbol: "tradingsymbol",
        quantity: "quantity",
        average_price: "averageprice",
        transaction_type: "transactiontype",
        id: "orderid",
        status: "status"
    },
    "groww": {
        order_timestamp: "created_at",
        tradingsymbol: "trading_symbol",
        quantity: "filled_quantity",
        average_price: "average_fill_price",
        transaction_type: "transaction_type",
        id: "groww_order_id",
        status: "order_status"
    },
    "kotak neo": {
        order_timestamp: "ordDtTm",
        tradingsymbol: "sym",
        quantity: "qty",
        average_price: "avgPrc",
        transaction_type: "trnsTp",
        id: "nOrdNo",
        status: "ordSt"
    },
    "delta exchange": {
        order_timestamp: "created_at",
        tradingsymbol: "product_symbol",
        quantity: "size",
        average_price: "price",
        transaction_type: "side",
        id: "order_id",
        status: "status"
    }
}

export default brokerDataMap;

export function mapData(broker, data) {
    if (!data) return {};

    const mappings = brokerDataMap[broker];
    const newItem = {};

    for (const newKey in mappings) {
        const oldKey = mappings[newKey];
        newItem[newKey] = data[oldKey];
    }

    newItem.broker = broker;
    return newItem;
}
