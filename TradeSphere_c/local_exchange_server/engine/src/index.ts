import 'dotenv/config';
import { createClient, } from "redis";
import { Engine } from "./trade/Engine";
import { Orderbook } from "./trade/Orderbook";
import { RedisManager } from "./RedisManager";
import { BinanceIngestor } from "./ingestors/binance";

async function main() {
    const engine = new Engine(); 
    const redisClient = createClient();
    await redisClient.connect();
    console.log("connected to redis");

    // Ensure we have at least one market so we can publish snapshots continuously
    if (!engine.orderbooks.find(o => o.ticker() === "BTC_USDC")) {
        engine.addOrderBook(new Orderbook("BTC", [], [], 0, 140));
    }

    // External feed (preferred): start Binance ingestor if configured
    const externalFeed = (process.env.EXTERNAL_FEED || '').toLowerCase();
    if (externalFeed === 'binance') {
        const ingestor = new BinanceIngestor();
        ingestor.start();
        console.log('[Engine] External feed enabled: Binance');
    } else if (process.env.DEMO_MODE === 'true') {
        // Periodically publish depth and a simple ticker snapshot to WS channels (demo only)
        setInterval(() => {
            try {
                engine.orderbooks.forEach((ob) => {
                    const depth = ob.getDepth();
                    const channel = `depth.${ob.ticker()}`;
                    RedisManager.getInstance().publishMessage(channel, {
                        stream: channel,
                        data: {
                            b: depth.bids.slice(0, 25),
                            a: depth.asks.slice(0, 25),
                            e: "depth",
                        },
                    });

                    const bestBid = depth.bids.length ? parseFloat(depth.bids[0][0]) : ob.currentPrice;
                    const bestAsk = depth.asks.length ? parseFloat(depth.asks[0][0]) : ob.currentPrice;
                    const mid = (bestBid && bestAsk) ? (bestBid + bestAsk) / 2 : ob.currentPrice;
                    const tChannel = `ticker.${ob.ticker()}`;
                    RedisManager.getInstance().publishMessage(tChannel, {
                        stream: tChannel,
                        data: {
                            e: "ticker",
                            s: ob.ticker(),
                            h: mid.toString(),
                            l: mid.toString(),
                            c: mid.toString(),
                            v: "0",
                            V: "0",
                            id: Date.now(),
                        },
                    });
                });
            } catch (err) {
                console.error("Error publishing periodic snapshots", err);
            }
        }, 1000);
        console.log('[Engine] DEMO_MODE publisher enabled');
    }

    while (true) {
        const response = await redisClient.rPop("messages" as string)
        if (!response) {

        }  else {
            engine.process(JSON.parse(response));
        }        
    }

}

main();