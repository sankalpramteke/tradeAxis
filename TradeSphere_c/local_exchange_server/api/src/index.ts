import express from "express"
import cors from "cors"
import dotenv from "dotenv"

import {Client} from "pg"

// Load environment variables
dotenv.config()

// Debug: Print database configuration
console.log('Database Config:', {
    user: process.env.DB_USER || "postgres",
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'tradesphere_db',
    port: parseInt(process.env.DB_PORT || '5432')
});
import { tradeRouter } from "./routes/trades"
import { orderRouter } from "./routes/order"
import { depthRouter } from "./routes/depth"
import { tickerRouter } from "./routes/ticker"
import { klineRouter } from "./routes/kline"
import { balanceRouter } from "./routes/balance"

export const pgClient = new Client({
    user: process.env.DB_USER || "postgres",
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'tradesphere_db',
    password: process.env.DB_PASSWORD || 'Post',
    port: parseInt(process.env.DB_PORT || '5432')
})

pgClient.connect()
const app = express()
const PORT = parseInt(process.env.PORT || '3000')
app.use(cors())
app.use(express.json())

app.use('/api/v1/order', orderRouter)
app.use('/api/v1/trade', tradeRouter)
app.use('/api/v1/depth', depthRouter)
app.use('/api/v1/ticker', tickerRouter)
app.use('/api/v1/kline', klineRouter)
app.use('/api/v1/balance', balanceRouter)

app.listen(PORT, ()=>{
    console.log("Listening on port: ", PORT)
})