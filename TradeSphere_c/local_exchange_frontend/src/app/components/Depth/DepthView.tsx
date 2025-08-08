import Asktables from "./Asktables";
import Bidstables from "./Bidstables";
import { Depth, Trade } from "@/app/utils/Types";


export default function DepthView({depth, trade, market}: {market: string, depth: Depth | {asks: [string, string][], bids: [string, string][]}, trade: Trade | null}) {  
    const asks = depth.asks
    const bids = depth.bids
    return (
        <div className="h-full overflow-auto">
            <div className="w-full px-3 py-1 grid grid-cols-3">
                <div className="text-white text-xs">{`Price(${market.split("_")[1]})`}</div>
                <div className="text-slate-400 text-xs text-right">{`Size(${market.split("_")[0]})`}</div>
                <div className="text-slate-400 text-xs text-right">{`Total(${market.split("_")[0]})`}</div>

            </div>
            <div id="depth" className="text-white text-xs h-[95%] overflow-auto">
                <Asktables asks={asks}/>
                <div className={`text-lg px-3 py-1 ${trade?.isbuyermaker ? "text-green-500" : "text-red-500"}`}>{trade?.price}</div>
                <Bidstables bids= {bids}/>
            </div>
        </div>
    )
 }