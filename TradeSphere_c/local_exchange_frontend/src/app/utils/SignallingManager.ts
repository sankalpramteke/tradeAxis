
import { Ticker } from "./Types";

// Prefer env override, fallback to localhost. Example in .env.local:
// NEXT_PUBLIC_WS_URL=ws://localhost:3001/ws
export const BASE_URL = (process.env.NEXT_PUBLIC_WS_URL?.trim() || "ws://localhost:3001/ws");
export class SignallingManager{
    private ws: WebSocket;
    private static instance: SignallingManager;
    private initialized : boolean = false
    private callbacks;
    private bufferedmessages = []
    private id: number;

    private constructor(){
        // Initialize callbacks as a map keyed by event type
        this.callbacks = []
        try {
            this.ws = new WebSocket(BASE_URL)
        } catch (e) {
            // If constructor throws (invalid URL), create a dummy socket-like object
            // so that send/registration don't crash. Messages will be buffered until a
            // future init attempt (e.g., page reload with correct URL).
            console.warn('[SignallingManager] WS init failed:', e)
            // @ts-ignore
            this.ws = { readyState: 0 } as WebSocket
        }
        this.bufferedmessages = []
        this.id = 1
        this.init()
    }

    public static getInstance(){
        if(!this.instance){
            this.instance = new SignallingManager()
        }
        return this.instance
    }

    init(){
        if(!this.ws || !(this.ws as any).addEventListener){
            // No real websocket; stay uninitialized
            return
        }

        this.ws.onopen = ()=>{
            this.initialized = true;
            this.bufferedmessages.forEach((message)=>{
                this.ws.send(JSON.stringify(message))
            })
            this.bufferedmessages = []
        }
        
        this.ws.onerror = (err)=>{
            console.warn('[SignallingManager] WS error:', err)
        }
        this.ws.onclose = ()=>{
            this.initialized = false
        }
        
        this.ws.onmessage = (event)=>{
            const message = JSON.parse(event.data)
            const type = message.data.e
            if(type == "ticker"){
                const newTicker: Partial<Ticker> = {
                    firstPrice:message.data.o,
                    lastPrice: message.data.c,
                    high: message.data.h,
                    low: message.data.l,
                    volume: message.data.v,
                    quoteVolume: message.data.q,
                    symbol: message.data.s

                }

                ;(this.callbacks[type] || []).forEach((callback)=>{
                    callback.callback(newTicker)
                })
            }
            else if(type == "depth"){
                const newDepth = {
                    bids: message.data.b,
                    asks: message.data.a,
                }
                ;(this.callbacks[type] || []).forEach((callback)=>{
                    console.log("Call Callback")
                    callback.callback(newDepth)
                })
            } else if(type == "trade"){
                const newTrade = {
                    price: message.data.p,
                    quantity: message.data.q,
                    tradeId: message.data.t,
                    timestamp: message.data.T,
                    buyerMaker: message.data.m,
                }
                ;(this.callbacks[type] || []).forEach((callback)=>{
                    callback.callback(newTrade)
                })
              }
            }
        }
    
    

    sendMessage(message){
        const messageToSend = {
            ...message, id: this.id++
        }
        if(!this.initialized){
            this.bufferedmessages.push(messageToSend)
            return;
        }
        this.ws.send(JSON.stringify(messageToSend))
    }

    async registerCallback( type: string, callback, id: string){
        console.log(id)
        this.callbacks[type] = this.callbacks[type] || []
        this.callbacks[type].push({callback, id})
    }

    async derigisterCallback(type: string, id: string){
        if(this.callbacks && this.callbacks[type]){
            const index = this.callbacks[type].findIndex((callback)=> callback.id === id)
            if(index !== -1){
                this.callbacks[type].splice(index, 1)
            }
        }
    }

}
