"use client"
import Depth from "@/app/components/Depth/Depth"
import MarketBar from "@/app/components/MarketBar"
import SwapUI from "@/app/components/SwapUI"
import TradeView from "@/app/components/TradeView"
import { useParams } from "next/navigation"
import TradesTape from "../../components/TradesTape"
import OrderForm from "../../components/OrderForm"
export default function MarketsPage() {
    const { market } = useParams()
    const sym = Array.isArray(market)? market[0] : (market as string)
    return (
        <div className="w-full">
            {/* Top symbol bar */}
            <div className="mb-2">
                <MarketBar symbol={sym} />
            </div>

            {/* Pro 3-column grid */}
            <div className="grid grid-cols-12 gap-3">
                {/* Left: Chart */}
                <section className="col-span-12 lg:col-span-7 xl:col-span-7 card p-2">
                    <div className="h-[540px]">
                        <TradeView market={sym} />
                    </div>
                </section>

                {/* Middle: Book + Trades */}
                <section className="col-span-12 lg:col-span-3 xl:col-span-3 flex flex-col gap-3">
                    <div className="card p-0 h-[340px] overflow-hidden">
                        <Depth market={sym} />
                    </div>
                    <div className="card p-0 h-[240px] overflow-hidden">
                        <TradesTape market={sym} />
                    </div>
                </section>

                {/* Right: Order panel */}
                <aside className="col-span-12 lg:col-span-2 xl:col-span-2 card p-3 h-full">
                    <OrderForm market={sym} />
                    <div className="mt-3 hidden xl:block">
                        <SwapUI />
                    </div>
                </aside>
            </div>
        </div>
    )
}