export default function Asktables({ asks: ask }: { asks: [string, string][] | [] }) {
    let asks = ask.slice(0, 15)
    asks = [...asks]
    const totalVolume = asks.reduce((acc, [, volume]) => acc + parseFloat(volume), 0)
    let tempTotal = 0;
    const arr = asks.map(([ask0, ask1], index) =>
        {
            tempTotal += parseFloat(ask1);
            return(
            <div key={index} className="w-full relative">
                <div style={{
                    "transition": "width 0.3s ease-in-out",
                    "width": `${(tempTotal*50/totalVolume).toFixed(0)}%`
                }} className={`right-0 absolute h-full bg-red-500 opacity-15 rounded-l-md`}>
                </div>
                <div style={{
                    "width": `${(parseFloat(ask1)*50/totalVolume).toFixed(0)}%`,
                     "transition": "width 0.3s ease-in-out",

                }} className={`right-0 absolute h-full bg-red-500 opacity-35 rounded-l-md`}>
                </div>
                <div key={index} className="grid grid-cols-3 px-3 py-1 ">
                    <div className="text-left text-red-500">
                        {ask0}
                    </div>
                    <div className="text-right">
                        {ask1}
                    </div>
                    <div className="text-right">
                        {tempTotal.toFixed(4)}
                    </div>
                </div>
            </div>
        )}
        )
    return <>
        {
            arr.reverse().map((item)=>(
                
                item
            ))
        }
    </>
}