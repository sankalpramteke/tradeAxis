import { SubscriptionManager } from "./SubscriptionManager"
import { User } from "./User"
import { WebSocket } from "ws"

export class UserManager{
    private static instance: UserManager
    private users: Map<string, User> = new Map()

    constructor(){

    }

    public static getInstance(){
        if(!this.instance){
            this.instance = new UserManager()
        }

        return this.instance
    }

    public addUser(ws: WebSocket){
        console.log("New user connected")
        const id = this.getRandomId()
        const user = new User(id, ws)
        this.users.set(id, user)
    }


    private registerOnClose(ws: WebSocket, id: string){
        ws.on("close", ()=>{
            this.users.delete(id)
            SubscriptionManager.getInstance().userLeft(id);
        })
    }

    public getUser(id: string){
        return this.users.get(id)
    }

    private getRandomId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
}