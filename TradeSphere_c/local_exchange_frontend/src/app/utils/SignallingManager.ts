
import { Ticker } from "./Types";

export const BASE_URL= "wss://localexchangefreedns.mooo.com/ws/"
export class SignallingManager{
    private ws: WebSocket;
    private static instance: SignallingManager;
    private initialized : boolean = false
    private callbacks;
    private bufferedmessages = []
    private id: number;

    private constructor(){
        this.ws = new WebSocket(BASE_URL)
        this.bufferedmessages = []
        this.callbacks = []
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
        this.ws.onopen = ()=>{
            this.initialized = true;
            this.bufferedmessages.forEach((message)=>{
                this.ws.send(JSON.stringify(message))
            })
            this.bufferedmessages = []
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

                this.callbacks[type].forEach((callback)=>{
                    callback.callback(newTicker)
                })
            }
            else if(type == "depth"){
                const newDepth = {
                    bids: message.data.b,
                    asks: message.data.a,
                }
                this.callbacks[type].forEach((callback)=>{
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
                this.callbacks[type].forEach((callback)=>{
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
        this.callbacks[type].push({callback, id: this.id})
    }

    async derigisterCallback(type: string, id: string){
        if(this.callbacks){
            const index = this.callbacks[type].find((callback)=> callback.id === id)
            if(index != -1){
                this.callbacks[type].splice(index, 1)
            }
        }
    }

}


