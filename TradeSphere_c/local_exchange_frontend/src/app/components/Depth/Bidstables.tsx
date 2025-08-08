
export default function Bidstables({ bids: bid }: { bids: [string, string][] | [] }) {

    bid = [...bid].reverse()
    const bids = bid.slice(0, 15)
    const totalVolume = bids.reduce((acc, [, volume]) => acc + parseFloat(volume), 0)
    let tempTotal = 0;
    return <>
        {

            bids.map(([bid0, bid1], index) => {
                tempTotal += parseFloat(bid1);
                return (
                    <div key={index} className="w-full relative">
                        <div style={{
                            "width": `${(tempTotal * 50 / totalVolume).toFixed(0)}%`,
                            "transition": "width 0.3s ease-in-out",

                        }} className={`right-0 absolute h-full bg-green-500 opacity-15 rounded-l-md `}>
                        </div>
                        <div style={{
                            "width": `${((parseFloat(bid1) * 50 / totalVolume)).toFixed(0)}%`,
                            "transition": "width 0.3s ease-in-out",

                        }} className={`right-0 absolute h-full bg-green-500 opacity-35 w-[${(parseFloat(bid1) * 50 / totalVolume).toFixed(0)}%] rounded-l-md`}>
                        </div>
                        <div key={index} className={`grid grid-cols-3 px-3 py-1 `}>
                            <div className="text-left text-green-500 ">
                                {bid0}
                            </div>
                            <div className="text-right">
                                {bid1}
                            </div>
                            <div className="text-right">
                                {tempTotal.toFixed(4)}
                            </div>
                        </div>
                    </div>
                )
            }
            )
        }
    </>
}