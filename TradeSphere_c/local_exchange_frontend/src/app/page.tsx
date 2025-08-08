"use client"
import markets from "./utils/markets";
import MarketShow from "./components/MarketShow";


export default function Home() {
  return (
    <div className="box-border flex flex-col justify-between items-center text-white h-[100vh] p-[10px] bg-[#0E0F14] ">
          <div className="w-full h-full flex flex-col items-center md:px-[100px]">
            <div className="bg-[#14151B] my-[100px] mx-[200px] w-full rounded-lg py-2">
                <div className="px-5 py-3 flex flex-row  items-center justify-between border-b-[1px] border-slate-800">
                    <div className="text-md text-slate-400 w-[40%]">
                        Name
                    </div>
                    <div className="text-md text-slate-400 flex-grow grid grid-cols-4">
                        <div className="mx-2 flex flex-row items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-arrow-down h-4 w-4"><path d="M12 5v14"></path><path d="m19 12-7 7-7-7"></path></svg> Price
                        </div>
                        <div className="mx-2 ">
                          Market Cap
                        </div>
                        <div className="mx-2 ">
                          24H Volume
                        </div>
                        <div className="mx-2 ">
                          24H Change
                        </div>
                    </div>
                </div>
                {
                  markets.map((market, index)=>{
                    return (
                    <MarketShow key={index} market={market} />
                  )})
                }
            </div>
          </div>
    </div>
    
  );
}
