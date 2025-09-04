"use client"
import Image from "next/image"
import { Ticker } from "../utils/Types"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { getTicker, getKlines } from "../utils/HttpClient"
import { KLine } from "../utils/Types"
import { SignallingManager } from "../utils/SignallingManager"

export default function MarketShow({market} : {market: {"name": string, "symbol": string, "baseAsset": string, "price": string}}) {
    const router = useRouter()


    const [ticker, setTicker] = useState<Ticker>({
        firstPrice: "0",
        high: "0",
        lastPrice: "0",
        low: "0",
        priceChange: "0",    
        priceChangePercent: "0",
        quoteVolume: "0",
        symbol: `${market.baseAsset}_USDC`,
        trades: "0",
        volume: "0"
    })
    // keep a per-row session firstPrice so list shows changing % even if backend lacks 24h first
    const sessionFirstRef = useRef<number | null>(null)

    console.log(ticker)

    useEffect(()=>{
        const sym = `${market.baseAsset}_USDC`
        let cbId: string | null = null
        getTicker(sym).then((data)=>{ if(data) setTicker(data) })
        // Also fetch last 24h klines to compute 24h firstPrice/volume if backend/WS lack them
        ;(async () => {
            try{
                const now = Date.now()
                const dayAgo = now - 24*60*60*1000
                const kl: KLine[] = await getKlines(sym, '1m', Math.floor(dayAgo), Math.floor(now))
                if (Array.isArray(kl) && kl.length > 0) {
                    // first candle open as firstPrice reference, and sum volumes
                    const firstOpen = parseFloat(kl[0].open || '0')
                    const totals = kl.reduce((acc, k) => {
                        const v = parseFloat(k.volume || '0') || 0
                        const q = parseFloat(k.quoteVolume || '0') || (parseFloat(k.close || '0') * v)
                        acc.v += v
                        acc.q += q
                        return acc
                    }, { v: 0, q: 0 })
                    setTicker(prev => ({
                        ...prev,
                        firstPrice: (prev.firstPrice && parseFloat(prev.firstPrice) > 0) ? prev.firstPrice : String(firstOpen || 0),
                        volume: String(totals.v),
                        quoteVolume: String(totals.q),
                    }))
                }
            } catch(e) {
                console.warn('klines fetch failed for', sym, e)
            }
        })()
        // subscribe to WS for realtime updates
        cbId = `LIST-${sym}`
        SignallingManager.getInstance().registerCallback("ticker", (data: Partial<Ticker>) => {
            if (!data) return;
            setTicker(prev => {
                const next: Ticker = {
                    firstPrice: data.firstPrice ?? prev.firstPrice ?? '0',
                    lastPrice: data.lastPrice ?? prev.lastPrice ?? '0',
                    high: data.high ?? prev.high ?? '0',
                    low: data.low ?? prev.low ?? '0',
                    priceChange: data.priceChange ?? prev.priceChange ?? '0',
                    priceChangePercent: data.priceChangePercent ?? prev.priceChangePercent ?? '0',
                    quoteVolume: data.quoteVolume ?? prev.quoteVolume ?? '0',
                    symbol: data.symbol ?? prev.symbol ?? sym,
                    trades: data.trades ?? prev.trades ?? '0',
                    volume: data.volume ?? prev.volume ?? '0',
                }
                // derive if missing
                let fp = parseFloat(next.firstPrice || '0')
                const lp = parseFloat(next.lastPrice || '0')
                if ((!isFinite(fp) || fp <= 0) && isFinite(lp) && lp > 0) {
                    if (sessionFirstRef.current == null) sessionFirstRef.current = lp
                    fp = sessionFirstRef.current
                    next.firstPrice = String(fp)
                }
                if (!data.priceChange || !data.priceChangePercent) {
                    if (fp > 0 && isFinite(lp)) {
                        const change = lp - fp
                        const pct = (change / fp) * 100
                        if (!data.priceChange) next.priceChange = String(change)
                        if (!data.priceChangePercent) next.priceChangePercent = String(pct)
                    }
                }
                return next
            })
        }, cbId)
        SignallingManager.getInstance().sendMessage({ method: 'SUBSCRIBE', params: [`ticker.${sym}`] })
        return () => {
            if (cbId) {
                try {
                    SignallingManager.getInstance().derigisterCallback('ticker', cbId)
                    SignallingManager.getInstance().sendMessage({ method: 'UNSUBSCRIBE', params: [`ticker.${sym}`] })
                } catch {}
            }
        }
    }, [market.baseAsset])

    return (    
        <div onClick={()=>{
            router.push(`/trade/${market.symbol}_USDC`)
        }} className="px-5 py-3 flex flex-row  items-center justify-between border-b-[1px] border-slate-800 cursor-pointer hover:bg-[#191F2B]">
            <div className="h-8 w-8 rounded-full overflow-hidden mx-2">
                    <Image src={`/images/${market.baseAsset}.png`} alt=""  width={100} height={100}/>
            </div>
             <div className="flex flex-col w-[40%]">
                
                <div className="text-lg ">
                {market.name}
                </div>
                <div className="text-sm text-gray-500">
                    {market.symbol}
                </div>
            </div>  
            <div className="flex-grow grid grid-cols-4">
                <div className="text-lg">
                    {`$${parseFloat(ticker?.lastPrice || '0').toLocaleString()}`}
                </div>
                <div className="text-lg">
                    {`$${parseFloat(ticker?.volume || '0').toLocaleString()}`}
                </div>
                <div className="text-lg">
                    {`$${getParsed(ticker?.quoteVolume || '0')}`}
                </div>
                <div className={`text-lg ${parseFloat(ticker?.priceChangePercent) > 0? "text-green-500" : "text-red-500"}`}>
                    {`${parseFloat(ticker?.priceChangePercent || '0').toFixed(2)}%`}
                </div>
            </div>             
        </div>
    )
}

function getParsed(value: string){
    const num = parseFloat(value);
    if(num > 1000){
        return parseFloat((num/1000).toFixed(2)).toLocaleString() + "K";
    }
    return num.toFixed(2).toLocaleString()
}
