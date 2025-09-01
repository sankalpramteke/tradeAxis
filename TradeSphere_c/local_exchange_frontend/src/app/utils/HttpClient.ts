import axios from "axios";
import {Ticker, Depth, Trade, KLine, Order} from  "./Types"
// import  { AxiosResponse }  from "axios";


const rawBase = (process.env.NEXT_PUBLIC_BASE_URL || '').trim();
let BASE_URL: string;
try {
  const base = rawBase && /^https?:\/\//i.test(rawBase) ? rawBase : 'http://localhost:3000';
  BASE_URL = new URL('/api/v1', base).toString().replace(/\/?$/, '');
} catch {
  BASE_URL = 'http://localhost:3000/api/v1';
}

// Log once to help diagnose 404s due to wrong base URL
// eslint-disable-next-line no-console
console.debug('[HttpClient] rawBase =', rawBase || '(default http://localhost:3000)', '-> normalized BASE_URL =', BASE_URL);


export async function getTicker(market: string): Promise<Ticker>{
    try{    
    const url = `${BASE_URL}/ticker?symbol=${market}`;
        const response = await axios.get<{data: Ticker}>(url);
        const ticker = response.data.data;
        console.log(ticker)
        if(!ticker){
            throw new Error(`Ticker for ${market} not found`)
        }
        return ticker;
    } catch (error) {
        console.log("error: ", error)
    }
}


export async function getDepth(market: string): Promise<Depth>{
    try {
        const response = await axios.get<Depth>(`${BASE_URL}/depth?symbol=${market}`)
        return response.data
    } catch (e) {
        console.warn('[HttpClient] depth error:', e)
        return { bids: [], asks: [] }
    }
}

export async function getTrades(market: string): Promise<Trade[]>{
    console.log("Market: ", market)
    try {
        const response = await axios.get<{data: Trade[]}>(`${BASE_URL}/trade?symbol=${market}`)
        return response.data.data || []
    } catch (e) {
        console.warn('[HttpClient] trades error:', e)
        return []
    }
}

export async function getKlines(market: string, interval: string, startTime: number, endTime: number): Promise<KLine[]> {
    try {
        const response = await axios.get(`${BASE_URL}/kline?symbol=${market}&interval=${interval}&startTime=${startTime}&endTime=${endTime}`);
        const data: KLine[] = (response.data as {data: KLine[]}).data || [];
        return data.sort((x, y) => (Date.parse(y.time) - Date.parse(x.time)));
    } catch (e) {
        console.warn('[HttpClient] klines error:', e)
        return []
    }
}

export async function postOrder(market: string, price: string, quantity: string, side: string, userId: string){
    const url = `${BASE_URL}/order`;
    const body = {
        market,
        price,  
        quantity,
        side,
        userId
    }

    const response = await axios.post(url, body);
    return response;
}

export async function deleteOrder(market: string, orderId: string){
    const url = `${BASE_URL}/order?market=${market}&orderId=${orderId}`;
    console.log("Deleteing")
    const response = await axios.delete(url);
    return response;
}

export async function getOpenOrders(market: string, userId: string){
    const url = `${BASE_URL}/order/open?market=${market}&userId=${userId}`
    const response : {data: Order[]} = await axios.get(url)
    return response.data;
}

export async function getBalance(userId: string){
    try {
        const url = `${BASE_URL}/balance?userId=${userId}`;
        const response = await axios.get(url);
        return response.data || {};
    } catch (e) {
        console.warn('[HttpClient] balance error:', e)
        return {}
    }
}


export async function postOnRamp(userId: string, amount: number){
    try {
        const url = `${BASE_URL}/balance/onRamp`
        const data = {
            userId,
            amount: amount.toString()
        }
        const response= await axios.post(url, data)
        if(response.status === 200){
            return (response.data as {balance: number | string}).balance
        }
        return null
    } catch (e) {
        console.warn('[HttpClient] onRamp error:', e)
        return null
    }
}