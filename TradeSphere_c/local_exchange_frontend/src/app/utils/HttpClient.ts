import axios from "axios";
import {Ticker, Depth, Trade, KLine, Order} from  "./Types"
// import  { AxiosResponse }  from "axios";


const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

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
    const response = await axios.get<Depth>(`${BASE_URL}/depth?symbol=${market}`)
    
    return response.data
}

export async function getTrades(market: string): Promise<Trade[]>{
    console.log("Market: ", market)
    const response = await axios.get<{data: Trade[]}>(`${BASE_URL}/trade?symbol=${market}`)
    return response.data.data
}

export async function getKlines(market: string, interval: string, startTime: number, endTime: number): Promise<KLine[]> {
    
    const response = await axios.get(`${BASE_URL}/kline?symbol=${market}&interval=${interval}&startTime=${startTime}&endTime=${endTime}`);
    
    console.log("KLINES: ", response)
    const data: KLine[] = (response.data as {data: KLine[]}).data;
    return data.sort((x, y) => (Date.parse(y.time) - Date.parse(x.time)));
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
    
    const url = `${BASE_URL}/balance?userId=${userId}`;
    const response = await axios.get(url);
    return response.data || {};
}


export async function postOnRamp(userId: string, amount: number){
    const url = `${BASE_URL}/balance/onRamp`
    const data = {
        userId,
        amount: amount.toString()
    }

    const response= await axios.post(url, data)
    if(response.status === 200){
        return (response.data as {balance: number | string}).balance
    } else {
        return null
    }
}