"use client"
import Image from "next/image"
import { Ticker } from "../utils/Types"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getTicker } from "../utils/HttpClient"

export default function MarketShow({market} : {market: {"name": string, "symbol": string, "baseAsset": string, "price": string}}) {
    const router = useRouter()


    const [ticker, setTicker] = useState<Ticker>({
        firstPrice: "",
        high: "",
        lastPrice: "",
        low: "",
        priceChange: "",    
        priceChangePercent: "",
        quoteVolume: "",
        symbol: "",
        trades: "",
        volume: ""
    })

    console.log(ticker)

    useEffect(()=>{
        getTicker(`${market.baseAsset}_USDC`).then(setTicker)
    }, [])

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
