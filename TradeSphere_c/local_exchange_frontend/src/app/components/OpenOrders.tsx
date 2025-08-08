import { useParams } from "next/navigation";
import { deleteOrder } from "../utils/HttpClient";
import { Order } from "../utils/Types";

export default function OpenOrders({openOrders, reloadOpenOrders, reloadBalance} : {openOrders: Order[], reloadOpenOrders: () => void, reloadBalance: () => void}){

    const {market} = useParams()
    function cancelOrder(orderId: string){
        deleteOrder(market as string, orderId).then(()=>{
            reloadOpenOrders()
            reloadBalance()
            alert("Order cancelled successfully")
        })
    }

    return (
        <div className="w-full h-[80vh] flex flex-col justify-start items-center">
                    <div className="w-full h-full flex flex-col justify-start items-center overflow-auto">
                        <div className="w-full grid grid-cols-6 justify-start items-center p-1">
                                 <p className={`text-md `}>Side</p>
                                    <p className="text-md ">Price</p>
                                    <p className="text-md ">Qty</p>
                                    <p className="text-md ">Filled</p>
                               </div>
                        {
                            openOrders?.map((order, index) => (
                               <div key={index} className="w-full  grid grid-cols-6 justify-start items-center p-1">
                                    <p className={`text-md ${order.side === "buy"? "text-green-500" : "text-red-500"}`}>{order.side}</p>
                                        <p className="text-md ">{order.price}</p>
                                        <p className="text-md ">{order.quantity}</p>
                                        <p className="text-md ">{order.filled}</p>
                                        <div onClick={()=>{
                                            cancelOrder(order.orderId)
                                        }} className="p-1 border-[1px] border-slate-500 rounded-md col-span-2 flex justify-center items-center bg-transparent text-white hover:bg-slate-300 hover:text-black cursor-pointer transition-colors duration-300 font-md">
                                            Cancel
                                        </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
    )
}