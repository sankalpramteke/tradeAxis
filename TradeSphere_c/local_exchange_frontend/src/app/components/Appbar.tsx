"use client"
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const Appbar = () => {
  const router = useRouter()
  const session = useSession()
  const [authLoading, setAuthLoading] = useState(false)

  const logHandler = async () => {
    try{
      setAuthLoading(true)
      if (session.status === "authenticated"){
        await signOut({ callbackUrl: "/" })
      } else {
        // Prefer Google sign-in for simplicity; NextAuth will redirect
        await signIn("google", { callbackUrl: "/" })
      }
    } finally {
      setAuthLoading(false)
    }
  }

  const signUpHandler = async () => {
    try{
      setAuthLoading(true)
      // For "Sign Up", also route through Google with an explicit prompt
      await signIn("google", { callbackUrl: "/", prompt: "select_account" })
    } finally {
      setAuthLoading(false)
    }
  }

  return (
    <div className="z-10 fixed top-0 w-full h-14 flex flex-row justify-between items-center pl-[21px] pr-4 box-border p-2  bg-[#0E0F14] text-white">
      <div className="flex flex-row items-center ">
        <div className="h-8 w-8 rounded-full overflow-hidden">
          <Image src={`/images/LOGO.png`} alt="" height={200} width={200} />
        </div>
        <div onClick={()=>{ router.push("/") }} className="text-white text-xl font-bold mx-5 cursor-pointer" role="button" tabIndex={0}>
          Exchange
        </div>
        <div onClick={()=>{ router.push("/") }} className="flex flex-row items-center jusitfy-center  text-md text-gray-500 hover:text-gray-400 cursor-pointer mx-4 font-semibold" role="button" tabIndex={0}>
            Markets
        </div >
        <div onClick={()=>{ router.push("/trade/BTC_USDC") }} className="flex flex-row items-center jusitfy-center text-md text-gray-500 hover:text-gray-400 cursor-pointer mx-4 font-semibold" role="button" tabIndex={0}>
            Trade
        </div>
        <div onClick={()=>{ router.push("/") }} className="flex flex-row items-center jusitfy-center  text-md text-gray-500 hover:text-gray-400 cursor-pointer mx-4 font-semibold" role="button" tabIndex={0}>
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
        <button
          onClick={logHandler}
          disabled={authLoading}
          className={`ml-10 p-3 py-1.5 rounded-lg text-sm font-semibold hover:opacity-[90%] ${session.status === "authenticated" ? "bg-[#2a1b1b] text-red-300" : "bg-[#0C2922] text-[#02A367]"} ${authLoading ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          { authLoading ? (session.status === "authenticated" ? "Logging out..." : "Signing in...") : (session.status === "authenticated" ? "Logout" : "LogIn") }
        </button>
        {session.status === "authenticated" ? "" : (
          <button
            onClick={signUpHandler}
            disabled={authLoading}
            className={`ml-8 p-3 py-1.5 rounded-lg bg-[#18253A] text-[#4686E8] text-sm font-semibold hover:opacity-[90%] ${authLoading ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            { authLoading ? "Redirecting..." : "Sign Up" }
          </button>
        )}
      </div>
    </div>
  );
};
