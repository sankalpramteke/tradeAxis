import { useEffect, useState } from "react";
import Trades from "../Trade";
import DepthView from "./DepthView";
import {Depth as Depthtype, Trade } from "@/app/utils/Types";
import { getDepth, getTrades } from "@/app/utils/HttpClient";
import { SignallingManager } from "@/app/utils/SignallingManager";

export default function Depth({market}: {market: string}){
    const [activeTab, setActiveTab] = useState<"book" | "trades" >("book")
    const [trade, setTrade] = useState<Trade[] | null>(null)
    const [depth, setDepth] = useState<Depthtype | null>(null)

    useEffect(()=>{
        SignallingManager.getInstance().registerCallback("depth", (data: Depthtype)=>{
            setDepth(prevDepth => {
                const asks = prevDepth?.asks;
                const bids = prevDepth?.bids

                const updatedAsks : [string, string][] = asks?.map(ask => {
                    const found = data.asks.find(dask => parseFloat(dask[0]).toFixed(2) == parseFloat(ask[0]).toFixed(2))
                    if(found){
                        if (parseFloat(found[1]) == 0) {
                            return null; // Returning null here, which will be filtered out later
                        }
                        data.asks.splice(data.asks.indexOf(found), 1)
                        return [found[0], found[1]]
                    }
                    return [ask[0], ask[1]]
                }).filter((bid): bid is [string, string] => bid !== null) || []

                if(data.asks.length > 0){
                    data.asks.forEach(ask => {
                        if(!(ask[1] == '0')){
                            updatedAsks.push(ask)
                        }
                    })
                }

                const updatedBids: [string, string][] = bids?.map(bid => {
                    const found = data.bids.find(dbid => parseFloat(dbid[0]).toFixed(2) == parseFloat(bid[0]).toFixed(2));
                    
                    if (found) {
                        // Skip if found[1] is 0 (do not return anything, effectively removing the element)
                        if (parseFloat(found[1]) == 0) {
                            return null; // Returning null here, which will be filtered out later
                        }
                        data.bids.splice(data.bids.indexOf(found), 1); // Remove the matched bid from the data.bids array
                        return [found[0], found[1]]; // Return the updated bid
                    }
                    
                    return [bid[0], bid[1]]; // Return the original bid if no match is found
                }).filter((bid): bid is [string, string] => bid !== null) || []

                if(data.bids.length > 0){
                    data.bids.forEach(bid => {
                        if(!(bid[1] == '0')){
                            updatedBids.push(bid)
                        }
                    })
                }

                const newDepth : Depthtype = {
                    asks: [...updatedAsks],
                    bids: [...updatedBids]
                }

                return newDepth 
                
            })
        }, `DEPTH-${market}`)
        SignallingManager.getInstance().sendMessage({"method": "SUBSCRIBE", "params": [`depth.${market}`]})

        // Live trades via WS
        const tradeCbId = `TRADE-${market}`
        SignallingManager.getInstance().registerCallback("trade", (t: any)=>{
            setTrade(prev => {
                const item: Trade = {
                    id: t.tradeId ?? t.t ?? Date.now(),
                    isbuyermaker: t.buyerMaker ?? t.m ?? false,
                    price: String(t.price ?? t.p ?? 0),
                    quantity: String(t.quantity ?? t.q ?? 0),
                    quotequantity: String((Number(t.price ?? t.p ?? 0) * Number(t.quantity ?? t.q ?? 0)) || 0),
                    timestamp: Number(t.timestamp ?? t.T ?? Date.now())
                }
                const next = [item, ...(prev || [])]
                return next.slice(0, 100)
            })
        }, tradeCbId)
        SignallingManager.getInstance().sendMessage({ method: "SUBSCRIBE", params: [`trade.${market}`] })

        getTrades(market).then(setTrade)
        getDepth(market).then(data => {
            setDepth(data)
        })

        return ()=>{
            SignallingManager.getInstance().derigisterCallback("depth", `DEPTH-${market}`)
            SignallingManager.getInstance().sendMessage({"method": "UNSUBSCRIBE", "params": [`depth.${market}`]})
            // trade cleanup
            SignallingManager.getInstance().derigisterCallback("trade", tradeCbId)
            SignallingManager.getInstance().sendMessage({ method: "UNSUBSCRIBE", params: [`trade.${market}`] })
        }
    }, [market])

    return <div id="depth" className="panel flex flex-col text-sm h-full">
        {/* header tabs */}
        <div className="flex items-center gap-4 px-3 py-2 border-b border-border/60">
            <button onClick={()=> setActiveTab("book")} className={`text-xs pb-1 border-b-2 transition-colors ${activeTab === "book" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                Book
            </button>
            <button onClick={()=> setActiveTab("trades")} className={`text-xs pb-1 border-b-2 transition-colors ${activeTab === "trades" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                Trades
            </button>
            <div className="ml-auto text-[11px] text-muted-foreground">{market}</div>
        </div>
        <div className="min-h-0 flex-1">
            { activeTab === "trades" 
                ? <Trades market={market} trade={trade || []} /> 
                : <DepthView market={market} depth={depth || {asks: [], bids: []}} trade={trade? trade[0] : null} /> }
        </div>
    </div>

}