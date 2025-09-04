"use client"
import { useEffect, useRef, useState } from "react"
import { Ticker } from "../utils/Types"
import { SignallingManager } from "../utils/SignallingManager"
import { getTicker, getKlines } from "../utils/HttpClient"
import Image from "next/image"
export default function MarketBar({ symbol: market }: { symbol: string }) {

    const [ticker, setTicker] = useState<Ticker>({"firstPrice": "0",
        "high": "0",
        "lastPrice": "0",
        "low": "0",
        "priceChange": "0",
        "priceChangePercent": "0",
        "quoteVolume": "0",
        "symbol": "0",
        "trades": "0",
        "volume": "0"})
    // Fallback firstPrice for this session if backend/klines don't provide one
    const sessionFirstRef = useRef<number | null>(null)
    useEffect(() => {
        getTicker(market).then(data => {
            console.log("Ticker data: ", data)
            if (data) {
                setTicker(data)
            }
        })
        // If backend doesn't provide a reliable firstPrice, compute it from last 24h klines
        ;(async () => {
            try{
                const end = Date.now()
                const start = end - 24 * 60 * 60 * 1000
                const kl = await getKlines(market, '1m', start, end)
                if (kl && kl.length) {
                    const lastClose = parseFloat(kl[0].close) // kl is sorted desc in HttpClient
                    const firstClose = parseFloat(kl[kl.length - 1].close)
                    if (isFinite(firstClose) && isFinite(lastClose)) {
                        setTicker(prev => {
                            const next = { ...prev }
                            // Only override if missing or zero
                            if (!parseFloat(next.firstPrice || '0')) next.firstPrice = String(firstClose)
                            if (!parseFloat(next.lastPrice || '0')) next.lastPrice = String(lastClose)
                            const fp = parseFloat(next.firstPrice || '0')
                            const lp = parseFloat(next.lastPrice || '0')
                            if (fp > 0 && isFinite(lp)) {
                                const change = lp - fp
                                const pct = (change / fp) * 100
                                next.priceChange = change.toString()
                                next.priceChangePercent = pct.toString()
                            }
                            return next
                        })
                    }
                }
            } catch(e){
                console.warn('[MarketBar] kline derivation failed', e)
            }
        })()
         SignallingManager.getInstance().registerCallback("ticker", function(data: Partial<Ticker>){
            console.debug('[MarketBar] ticker update for', market, data)
            setTicker(prevTicker => {
                const next: Ticker = {
                    firstPrice: data?.firstPrice ?? prevTicker?.firstPrice ?? '',
                    lastPrice: data?.lastPrice ?? prevTicker?.lastPrice ?? '',
                    high: data?.high ?? prevTicker?.high ?? '',
                    low: data?.low ?? prevTicker?.low ?? '',
                    priceChange: data?.priceChange ?? prevTicker?.priceChange ?? '',
                    priceChangePercent: data?.priceChangePercent ?? prevTicker?.priceChangePercent ?? '',
                    quoteVolume: data?.quoteVolume ?? prevTicker?.quoteVolume ?? '',
                    symbol: data?.symbol ?? prevTicker?.symbol ?? '',
                    trades: data?.trades ?? prevTicker?.trades ?? '',
                    volume: data?.volume ?? prevTicker?.volume ?? ''
                }
                // Derive 24h change if not provided by WS
                let fp = parseFloat(next.firstPrice || '0')
                const lp = parseFloat(next.lastPrice || '0')
                // Session fallback: if firstPrice missing/zero, set once from first seen lastPrice
                if ((!isFinite(fp) || fp <= 0) && isFinite(lp) && lp > 0) {
                    if (sessionFirstRef.current == null) sessionFirstRef.current = lp
                    fp = sessionFirstRef.current
                    next.firstPrice = String(fp)
                }
                if (!isNaN(fp) && fp > 0 && !isNaN(lp)) {
                    const change = lp - fp
                    const pct = (change / fp) * 100
                    if (!data?.priceChange) next.priceChange = change.toString()
                    if (!data?.priceChangePercent) next.priceChangePercent = pct.toString()
                }
                return next
            })
         }, `TICKER-${market}`)
         SignallingManager.getInstance().sendMessage({"method": "SUBSCRIBE",  "params": [`ticker.${market}`]})
         // Also subscribe to depth to ensure synthesized ticker fires even if book component is not mounted
         SignallingManager.getInstance().sendMessage({"method": "SUBSCRIBE",  "params": [`depth.${market}`]})
         // Additionally, react to depth directly as a fallback
         SignallingManager.getInstance().registerCallback("depth", function(data: {bids: string[][], asks: string[][]}){
            const bestBid = Array.isArray(data.bids) && data.bids.length>0 ? parseFloat(data.bids[0][0]) : NaN
            const bestAsk = Array.isArray(data.asks) && data.asks.length>0 ? parseFloat(data.asks[0][0]) : NaN
            const mid = (!isNaN(bestBid) && !isNaN(bestAsk)) ? (bestBid+bestAsk)/2 : (!isNaN(bestBid) ? bestBid : (!isNaN(bestAsk) ? bestAsk : NaN))
            if(!isNaN(mid)){
                setTicker(prev => {
                    const next = { ...prev, lastPrice: String(mid) }
                    let fp = parseFloat(next.firstPrice || '0')
                    const lp = mid
                    if ((!isFinite(fp) || fp <= 0) && isFinite(lp) && lp > 0) {
                        if (sessionFirstRef.current == null) sessionFirstRef.current = lp
                        fp = sessionFirstRef.current
                        next.firstPrice = String(fp)
                    }
                    if (!isNaN(fp) && fp > 0) {
                        const change = lp - fp
                        const pct = (change / fp) * 100
                        next.priceChange = change.toString()
                        next.priceChangePercent = pct.toString()
                    }
                    return next
                })
            }
         }, `DEPTH-${market}-MBAR`)

         return ()=>{
            SignallingManager.getInstance().derigisterCallback("ticker", `TICKER-${market}`)
         SignallingManager.getInstance().sendMessage({"method": "UNSUBSCRIBE",  "params": [`ticker.${market}`]})
         SignallingManager.getInstance().sendMessage({"method": "UNSUBSCRIBE",  "params": [`depth.${market}`]})
         SignallingManager.getInstance().derigisterCallback("depth", `DEPTH-${market}-MBAR`)

         }
    }, [market])

    // Number format helpers for clean display
    const formatPrice = (value?: string) => {
        const n = parseFloat(value || '0')
        if (!isFinite(n)) return '0.00'
        const abs = Math.abs(n)
        const maxFrac = abs >= 1 ? 2 : abs >= 0.01 ? 4 : 8
        return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: maxFrac }).format(n)
    }

    const formatVolume = (value?: string) => {
        const n = parseFloat(value || '0')
        if (!isFinite(n)) return '0'
        // Compact for very large numbers, otherwise up to 4 decimals
        if (Math.abs(n) >= 100000) {
            return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(n)
        }
        return new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(n)
    }

    const formatChange = (value?: string) => {
        const n = parseFloat(value || '0')
        if (!isFinite(n)) return '0.00'
        return n.toFixed(2)
    }

    
    return (
        <div className="w-full h-14 px-3 flex justify-start items-center border-y-[1px] border-slate-800 text-white relative space-x-10 ">
            <div className="flex justify-start items-center text-white ml-8">
            <div className="h-8 w-8 rounded-full overflow-hidden mx-2">
            <Image src={`/images/${market.split('_')[0]}.png`} alt=""  width={100} height={100}/>
            </div>
            {market}
            </div>
            <div className="flex flex-row justify-between items-center space-x-10 ">
                <div className="flex flex-col justify-center items-center">
                
                    <div className={`text-lg ${parseFloat(ticker?.priceChange || "0") >= 0 ? "text-green-500" : "text-red-500"}`}>
                        ${formatPrice(ticker?.lastPrice)}
                    </div>
                    <div className="text-md text-slate-300">
                        ${formatPrice(ticker?.lastPrice)}
                    </div>
                </div>
                <div className="flex flex-col ">
                    <div className="text-xs text-slate-400 font-semibold">
                        24H Change
                    </div>
                    <div className={`text-sm ${parseFloat(ticker?.priceChange || "0") >= 0 ? "text-green-500" : "text-red-500"} `}>
                        {formatChange(ticker?.priceChange)} {formatChange(ticker?.priceChangePercent)}%
                    </div>
                </div>
                <div className="flex flex-col ">
                    <div className="text-xs text-slate-400 font-semibold">
                        24H High
                    </div>
                    <div className={`text-sm `}>
                        {formatPrice(ticker?.high)}
                    </div>
                </div>
                <div className="flex flex-col ">
                    <div className="text-xs text-slate-400 font-semibold">
                        24H Low
                    </div>
                    <div className={`text-sm `}>
                        {formatPrice(ticker?.low)}
                    </div>
                </div>
                <div className="flex flex-col ">
                    <div className="text-xs text-slate-400 font-semibold">
                        24H Volume
                    </div>
                    <div className={`text-sm `}>
                        {formatVolume(ticker?.volume)}
                    </div>
                </div>
            </div>
        </div>
    )

}