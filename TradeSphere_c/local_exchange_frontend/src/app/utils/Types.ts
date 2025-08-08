
export interface KLine {
    close: string;
    end: string;
    high: string;
    low: string;
    open: string;
    quoteVolume: string;
    start: string;
    trades: string;
    volume: string;
    time: string;
}

export interface Trade {
    "id": number,
    "isbuyermaker": boolean,
    "price": string,
    "quantity": string,
    "quotequantity": string,
    "timestamp": number
}

export interface Depth {
    bids: [string, string][],
    asks: [string, string][],
    lastUpdateId?: string
}

export interface Ticker {
    "firstPrice": string,
    "high": string,
    "lastPrice": string,
    "low": string,
    "priceChange": string,
    "priceChangePercent": string,
    "quoteVolume": string,
    "symbol": string,
    "trades": string,
    "volume": string
}




export interface Order {
    "filled": number,
    "orderId": string,
    "price": number,
    "quantity": number,
    "side": "sell" | "buy",
    "userId": string
}
