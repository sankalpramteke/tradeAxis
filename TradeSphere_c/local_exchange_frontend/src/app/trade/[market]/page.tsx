"use client"
import Depth from "@/app/components/Depth/Depth"
import MarketBar from "@/app/components/MarketBar"
import SwapUI from "@/app/components/SwapUI"
import TradeView from "@/app/components/TradeView"
import { useParams } from "next/navigation"
export default function MarketsPage() {
    const { market } = useParams()
    return (
        <div className="w-full flex flex-row ">
                <div className="flex flex-col flex-1 ">
                    <MarketBar symbol={Array.isArray(market)? market[0] : market} />
                    <div className="flex flex-row">
                        <div className="flex flex-col flex-1">
                            <TradeView market={Array.isArray(market)? market[0] : market} />
                        </div>
                        <div className="flex flex-col w-[300px] h-[85vh]">
                            <Depth market={Array.isArray(market)? market[0] : market} />
                        </div>
                    </div>
                </div>
                <div className="flex flex-col w-[300px] h-[100vh] border-[1px] border-slate-900">
                    <SwapUI />
                </div>
        </div>
    )
}