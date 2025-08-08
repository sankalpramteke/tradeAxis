import { Router, type RequestHandler } from "express";
import { pgClient } from "..";

export const tickerRouter = Router()

const tickerHandler: RequestHandler = async (req, res): Promise<void> => {

    const {symbol: market} = req.query as {symbol?: string};

   try {
     const base = (market || '').split('_')[0];
     if(!base || !/^[A-Za-z0-9]+$/.test(base)){
       res.status(400).json({error: "Invalid or missing symbol parameter"});
       return;
     }

     // Ensure expected prices table exists; if not, return an empty ticker instead of 500
     const tableCheck = await pgClient.query<{exists: string | null}>(
       `SELECT to_regclass($1) as exists`,
       [`${base}_prices`]
     );
     if(!tableCheck.rows[0]?.exists){
       res.json({
         data: {
           low: 0,
           high: 0,
           firstPrice: 0,
           lastPrice: 0,
           priceChange: 0,
           priceChangePercent: 0,
           volume: 0,
           quoteVolume: 0,
           trades: 0,
           symbol: `${base}_USDC`
         }
       });
       return;
     }

     const query = `
       WITH window AS (
         SELECT price, volume, time
         FROM ${base}_prices
         WHERE time >= NOW() - INTERVAL '24 hours'
       ),
       first_row AS (
         SELECT price AS first_price FROM window ORDER BY time ASC NULLS LAST LIMIT 1
       ),
       last_row AS (
         SELECT price AS last_price FROM window ORDER BY time DESC NULLS LAST LIMIT 1
       )
       SELECT
         (SELECT MIN(price) FROM window) AS "low",
         (SELECT MAX(price) FROM window) AS "high",
         (SELECT first_price FROM first_row) AS "firstPrice",
         (SELECT last_price FROM last_row) AS "lastPrice",
         COALESCE((SELECT last_price FROM last_row) - (SELECT first_price FROM first_row), 0) AS "priceChange",
         ROUND(CAST(COALESCE(((SELECT last_price FROM last_row) - (SELECT first_price FROM first_row)) / NULLIF((SELECT first_price FROM first_row), 0) * 100, 0) AS NUMERIC), 2) AS "priceChangePercent",
         COALESCE((SELECT SUM(volume) FROM window), 0) AS "volume",
         COALESCE((SELECT SUM(volume * price) FROM window), 0) AS "quoteVolume",
         COALESCE((SELECT COUNT(*) FROM window), 0) AS "trades",
         '${base}_USDC' AS "symbol";
     `;

     const dbRes = await pgClient.query(query);

     const payload = dbRes.rows[0] || {
       low: 0,
       high: 0,
       firstPrice: 0,
       lastPrice: 0,
       priceChange: 0,
       priceChangePercent: 0,
       volume: 0,
       quoteVolume: 0,
       trades: 0,
       symbol: `${base}_USDC`
     };

     console.log("request for ticker from", market);
     console.log(payload);

     res.json({ data: payload });
     return;
   } catch (err) {
     console.error(err);
     // Graceful fallback instead of 500 to keep UI functional in dev
     const baseFallback = (market || '').split('_')[0] || 'UNKNOWN';
     res.json({
       data: {
         low: 0,
         high: 0,
         firstPrice: 0,
         lastPrice: 0,
         priceChange: 0,
         priceChangePercent: 0,
         volume: 0,
         quoteVolume: 0,
         trades: 0,
         symbol: `${baseFallback}_USDC`
       }
     });
     return;
   }
}

tickerRouter.get('/', tickerHandler)