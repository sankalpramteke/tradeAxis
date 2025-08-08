import { RedisClientType, createClient } from "redis";
import { MessageFromOrderBook } from "./types";
import { MessageToEngine } from "./types/to";


export class RedisManager{
    private client: RedisClientType;
    private publisher: RedisClientType
    private static instance: RedisManager

    private constructor(){
        const redisConfig = {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD })
        };
        
        this.client = createClient(redisConfig)
        this.client.connect()
        this.publisher = createClient(redisConfig)
        this.publisher.connect()

    }

    public static getInstance(){
        if(!this.instance){
            this.instance = new RedisManager()
        }

        return this.instance
    }


    public sendAndAwait(message: MessageToEngine ){
        return new Promise<MessageFromOrderBook>((resolve)=>{
            const id = this.getRandomClientId()
            this.client.subscribe(id, (message)=>{
                this.client.unsubscribe(id)
                resolve(JSON.parse(message))
            })
            this.publisher.lPush("messages", JSON.stringify({clientId: id, message}))
        })
    }

    public getRandomClientId(){
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
}