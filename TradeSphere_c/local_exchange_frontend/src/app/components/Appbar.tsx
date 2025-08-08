"use client"
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export const Appbar = () => {
  const router = useRouter()
  const session = useSession()

  const logHandler = () => {
    if (session.status === "authenticated"){
      signOut()
    } else {
      signIn()
    }
  }

  return (
    <div className="z-10 fixed top-0 w-full h-14 flex flex-row justify-between items-center pl-[21px] pr-4 box-border p-2  bg-[#0E0F14] text-white">
      <div className="flex flex-row items-center ">
        <div className="h-8 w-8 rounded-full overflow-hidden">
          <Image src={`/images/LOGO.png`} alt="" height={200} width={200} />
        </div>
        <div onClick={()=>{
          router.push("/")
        }} className="text-white text-xl font-bold mx-5 cursor-pointer">Exchange</div>
        <div className="flex flex-row items-center jusitfy-center  text-md text-gray-500 hover:text-gray-400 cursor-pointer mx-4 font-semibold">
            Markets
        </div >
        <div className="flex flex-row items-center jusitfy-center text-md text-gray-500 hover:text-gray-400 cursor-pointer mx-4 font-semibold">
            Trade
        </div>
        <div className="flex flex-row items-center jusitfy-center  text-md text-gray-500 hover:text-gray-400 cursor-pointer mx-4 font-semibold">
            <p>More</p>
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"></path></svg>
        </div>
      </div>
      <div id="search-bar">
        <div className="mx-4 rounded-full w-80 h-8 flex items-center bg-[#202127] px-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search h-4 w-4 text-slate-400"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
        <input type="text" className="text-slate-400 text-sm  bg-transparent outline-none w-full pl-2" placeholder="Search markets" />
        </div>
      </div>
      <div id="user-menu" className="flex flex-row items-center pl-8">
        <button onClick={()=>{
          logHandler()
        }} className="ml-10 p-3 py-1.5 rounded-lg bg-[#0C2922] text-[#02A367] text-sm font-semibold hover:opacity-[90%]">
          { session.status === "authenticated" ? "Logout" : "LogIn"}
        </button>
        {session.status === "authenticated" ? "" : <button onClick={()=>{
        }} className="ml-8 p-3 py-1.5 rounded-lg bg-[#18253A] text-[#4686E8] text-sm font-semibold hover:opacity-[90%]">
          Sign Up
        </button>}
      </div>
    </div>
  );
};
