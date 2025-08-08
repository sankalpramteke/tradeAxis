import { authOptions } from "@/app/utils/authOptions";
import NextAuth from "next-auth/next";

const handler = NextAuth(authOptions)

export const GET = handler
export const POST = handler