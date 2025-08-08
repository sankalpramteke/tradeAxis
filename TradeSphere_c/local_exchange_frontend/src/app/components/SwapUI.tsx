"use client";
import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { getBalance, getOpenOrders, postOnRamp, postOrder } from "../utils/HttpClient";
import { useParams } from "next/navigation";
import { Order } from "../utils/Types";
import OpenOrders from "./OpenOrders";

export default function SwapUI() {
    const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
    const [type, setType] = useState<"limit" | "market" | "orders">("limit");
    const [price, setPrice] = useState<string>("");
    const [quantity, setQuantity] = useState<string>("");
    const [balance, setBalance] = useState<{[key: string]: {available: string, locked: string}}>({});
    const [deposit, setDeposit] = useState<string>("")
    const [openOrders, setOpenOrders] = useState<Order[]>([]);
    const session = useSession()
    const { market  } = useParams()
    console.log(market)

    const value = parseFloat(price) * parseFloat(quantity);

    function placeOrder(){
        if(parseFloat(price) == 0 || parseFloat(quantity) == 0){
            alert("Please enter valid values for price and quantity")
            return;
        }
        if(session.status === "authenticated" && session?.data != null && (session?.data?.user as {id: string}).id != null){
            postOrder(market as string, price, quantity, activeTab,  (session.data?.user as {id: string}).id )
            getBalance((session.data?.user as {id: string}).id).then((b) => {
                setBalance(b as {[key: string]: {available: string, locked: string}});
            })
        }
        reloadOpenOrders()
    }

    function rampBalance(){
        if(session.status === "authenticated" && session?.data != null && (session?.data?.user as {id: string}).id != null){
            if(parseFloat(deposit)  && parseFloat(deposit) > 0){
                postOnRamp((session.data?.user as {id: string}).id, parseFloat(deposit)).then((deposit: string)=>{
                    console.log(typeof(deposit))
                    setBalance(b => {
                        const newBalance = {...b};
                        newBalance[(market as string).split("_")[1]] = {
                            available: deposit,
                            locked: newBalance[(market as string).split("_")[1]].locked
                        }
                        console.log(newBalance)
                        return newBalance
                    })
                })
               
            } else {
                alert("Please enter a valid deposit amount")
            }
        } else {
            alert("Please sign in to ramp your balance")    
        }
    }

    function reloadOpenOrders(){
        getOpenOrders(market as string, (session.data?.user as {id: string}).id).then(o => {
            setOpenOrders(o as Order[]);
        })
    }

    function reloadBalance(){
        getBalance((session.data?.user as {id: string}).id).then(b => {
            setBalance(b as {[key: string]: {available: string, locked: string}});
        })
    }

    useEffect(()=>{
        if(session.status === "authenticated"){
            console.log("Retrieving Balance")
            reloadBalance()
            reloadOpenOrders()
        }
    }, [session.status])

    return (
        <div className="w-full h-full flex flex-col justify-start items-center text-white">
            <div className="w-full h-[60px] flex flex-row">
                <BuyButton activeTab={activeTab} setActiveTab={setActiveTab} />
                <SellButton activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>

            <div className="px-3 flex flex-col w-full mb-4">
                <div className="w-full h-[40px] flex flex-row justify-start items-center space-x-4">
                    <LimitButton type={type} setType={setType} />
                    <MarketButton type={type} setType={setType} />
                    <OrderButton type={type} setType={setType}  />
                </div>
            </div>

           {
            type === "orders" ? (
               <OpenOrders openOrders={openOrders} reloadOpenOrders={reloadOpenOrders} reloadBalance={reloadBalance} />
            ) : <>
                <div className="px-3 w-full flex flex-row justify-between items-center  mb-4">
                <p className="text-xs text-slate-400">Available Balance</p>
                <p className="text-sm text-white">{activeTab === "sell" ? (balance[(market as string).split("_")[0]]?.available || 0) + " " + (market as string).split("_")[0] :( balance[(market as string).split("_")[1]]?.available || 0) + " " + (market as string).split("_")[1]}</p>
                </div>
 
            {type === "limit" ? <div className="px-3 w-full flex flex-col justify-between items-center">
                <div className="text-xs text-slate-400 leading-none w-full">
                    Increase Balance
                </div>
                <div className=" py-2 rounded-md w-full flex flex-row justify-between items-center gap-[20px]">
                    <div onClick={()=>{
                        rampBalance()
                    }} className="w-[70px] h-[30px] rounded-md bg-white flex justify-center items-center text-black text-xs font-semibold hover:bg-transparent hover:text-white cursor-pointer transition-colors duration-200">
                            Deposit
                    </div>
                    <div className=" flex flex-grow h-[30px]">
                        <input onChange={(e) => setDeposit(e.target.value)} type="text" className="text-sm h-full w-full bg-transparent text-white rounded-md border-[1px] border-slate-800 focus:outline-none focus:border-blue-500"/>
                    </div>
                </div>
            </div> : null}

            {type === "limit" ? <div className="px-3 w-full flex flex-col items-center">
                    <div className="w-full space-y-2 mb-4">
                        <p className="text-xs text-slate-400">Price</p>
                        <input onChange={(e) => {
                             const value = e.target.value;
    
                             // Allow empty string or valid number with optional decimal point
                             if (value === "" || /^\d*\.?\d*$/.test(value)) {
                               setPrice(value);
                             }
                        }} type="text" className="w-full text-2xl text-right px-2 py-2 border-[1px] border-slate-800 rounded-md text-white bg-transparent" value={price || ""} />
                    </div>
                    <div className="w-full space-y-2 mb-4">
                        <p className="text-xs text-slate-400">Quantity</p>
                        <input onChange={(e) => {
                            const value = e.target.value;
    
                            // Allow empty string or valid number with optional decimal point
                            if (value === "" || /^\d*\.?\d*$/.test(value)) {
                              setQuantity(value);
                            }
                        }} type="text" className="w-full text-2xl text-right px-2 py-2 border-[1px] border-slate-800 rounded-md text-white bg-transparent" value={quantity || ""} />
                    </div>
    
                    <div className="w-full space-y-2 mb-4">
                        <p className="text-xs text-slate-400">Order Value</p>
                        <input
                          type="text"
                          readOnly
                          className="w-full text-2xl text-right px-2 py-2 border-[1px] border-slate-800 rounded-md text-white bg-transparent"
                          value={Number.isFinite(value) ? value : 0}
                        />
                    </div>
    
                    <div onClick={()=>{
                        if(session.status === "authenticated"){
                            if(price == "" || quantity == ""){
                                alert("Please enter valid values for price and quantity")
                            } else {
                                placeOrder()
                            }
                        } else {
                            signIn()
                        }
                    }} className="text-lg text-black py-3 font-semibold mt-4 px-3 w-full flex justify-center items-center bg-white rounded-lg cursor-pointer hover:opacity-80 transition-opacity duration-200">
                        {`${session.status === "authenticated" ? "Place Order" : "Sign in to trade"}`}
                    </div>
                </div> : <div className="px-3 w-full flex flex-col justify-between items-center  mb-4">
                    <div className="w-full space-y-2 mb-4">
                        <p className="text-xs text-slate-400">Quantity</p>
                        <input
                          onChange={(e) => {
                            const v = e.target.value;
                            if (v === "" || /^\d*\.?\d*$/.test(v)) {
                              setQuantity(v);
                            }
                          }}
                          type="text"
                          className="w-full text-2xl text-right px-2 py-2 border-[1px] border-slate-800 rounded-md text-white bg-transparent"
                          value={quantity || ""}
                        />
                    </div>
                    <div className="px-3 w-full flex justify-end text-xs text-slate-400">
                    {activeTab === "sell" ? (balance[(market as string).split("_")[0]]?.available || 0) + " " + (market as string).split("_")[0] : (balance[(market as string).split("_")[1]]?.available || 0) + " " + (market as string).split("_")[1]}
                    </div>
    
                    <div onClick={()=>{
                        if(session.status === "authenticated"){
                            placeOrder()
                        } else {
                            signIn()
                        }
                    }} className="text-lg text-black py-3 font-semibold mt-4 px-3 w-full flex justify-center items-center bg-white rounded-lg cursor-pointer hover:opacity-80">
                        {`${session.status === "authenticated" ? "Place Order" : "Sign in to trade"}`}
                    </div>
                </div>}
                </>
           }
        </div>
    );
}

function BuyButton({
    activeTab,
    setActiveTab,
}: {
    activeTab: "buy" | "sell";
    setActiveTab: (tab: "buy" | "sell") => void;
}) {
    return (
        <button
            onClick={() => setActiveTab("buy")}
            className={`w-1/2 h-full flex justify-center items-center border-b-2 text-[#01B571] ${activeTab === "buy"
                ? "bg-[#0D1C1B] border-[#01B571] "
                : "border-slate-800"
                }`}
        >
            Buy
        </button>
    );
}

function SellButton({
    activeTab,
    setActiveTab,
}: {
    activeTab: "buy" | "sell";
    setActiveTab: (tab: "buy" | "sell") => void;
}) {
    return (
        <button
            onClick={() => setActiveTab("sell")}
            className={`w-1/2 h-full flex justify-center items-center border-b-[1px] text-[#FD4B4E] ${activeTab === "sell"
                ? "bg-[#281419] border-[#FD4B4E] "
                : "border-slate-800"
                }`}
        >
            Sell
        </button>
    );
}

function MarketButton({
    type,
    setType,
}: {
    type: "limit" | "market" | "orders";
    setType: (type: "limit" | "market" | "orders") => void;
}) {
    return (
        <div
            onClick={() => setType("market")}
            className={`text-sm border-b-2 cursor-pointer font-medium ${type === "market"
                ? "text-white border-blue-500"
                : "text-slate-400 border-transparent hover:text-white hover:border-white"
                } `}
        >
            Market
        </div>
    );
}

function LimitButton({
    type,
    setType,
}: {
    type: "limit" | "market" | "orders";
    setType: (type: "limit" | "market" | "orders") => void;
}) {
    return (
        <div
            onClick={() => setType("limit")}
            className={`text-sm border-b-2 cursor-pointer font-medium ${type === "limit"
                ? "text-white border-blue-500"
                : "text-slate-400 border-transparent hover:text-white hover:border-white"
                } `}
        >
            Limit
        </div>
    );
}

function OrderButton({type, setType}: {type: "limit" | "market" | "orders", setType: (type: "limit" | "market" | "orders") => void}){
    return (
        <div
            onClick={() => {
                setType("orders")
            }}
            className={`text-sm border-b-2 cursor-pointer font-medium ${type === "orders"
                ? "text-white border-blue-500"
                : "text-slate-400 border-transparent hover:text-white hover:border-white"
                } `}
        >
            Open Orders
        </div>
    );
}
