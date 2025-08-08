import { Router, Request, Response } from "express";
import { pgClient } from "..";
export const tradeRouter = Router()



tradeRouter.get('/', async (req: Request, res: Response): Promise<void> => {
    const { symbol: market }  = req.query as {symbol?: string};
    console.log("Requested market: ", market)

    if(!market){
        res.status(200).json({ data: [] })
        return
    }

    try {
        const base = market.split('_')[0]
        const table = `${base}_prices`

        // Ensure table exists
        const existsQ = `SELECT to_regclass($1) as t`;
        const exists = await pgClient.query(existsQ, [table])
        if(!exists.rows[0]?.t){
            res.status(200).json({ data: [] })
            return
        }

        const query = `SELECT 
        isbuyermaker AS isBuyerMaker,
        price,
        volume AS quantity,
        volume AS quoteQuantity,
        time as timestamp
        FROM ${table} ORDER BY time DESC LIMIT 100`;
        const result = await pgClient.query(query)
        console.log(result.rows[0])
        res.json({data: result.rows})
        return
    } catch (error) {
        console.error('trades query error:', error)
        res.status(200).json({data: []})
        return
    }
})