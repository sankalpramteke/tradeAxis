
import { Trade } from "../utils/Types";

export default function Trades({market, trade}: {market: string, trade: Trade[]}){


    return (
        <div className="flex flex-col px-4 h-[95%]">
            <div className="grid grid-cols-3 py-1 h-auto">
                <div className="text-xs text-slate-400 text-left">
                    Price(USDC)
                </div>
                <div className="text-xs text-slate-400 text-right">
                    {`Qty(${market.split('_')[0]})`}
                </div>
            </div>
           {allTrades(trade || [])}
        </div>
    )

}

function allTrades(trades: Trade[]): React.ReactNode{
    console.log(trades)
    return (
        <div id="depth" className="flex flex-col flex-grow overflow-auto space-y-0 ">
            {   
                trades.map(trade =>( 
                    <div key={trade.timestamp + trade.id} className="grid grid-cols-3 py-1">
                        <div className={`text-left ${trade.isbuyermaker === true? 'text-green-500' : 'text-red-500'}`}>{trade.price}</div>    
                        <div   className="text-right">{parseFloat(trade.quantity).toFixed(2)}</div>    
                        <div  className="text-right">{formatTimestamp(trade.timestamp)}</div>    
                    </div>
                ))
            }
        </div>
    )
}

function formatTimestamp(timestamp: number) {
    // If the timestamp is in seconds, convert it to milliseconds

    const time = new Date(timestamp).toISOString().split('T')[1].split('.')[0];
  
    return time;
  }