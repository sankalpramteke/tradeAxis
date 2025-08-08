import { useEffect, useRef } from "react";
import ChartManager from "../utils/ChartManager";
import { getKlines } from "../utils/HttpClient";
import { KLine } from "../utils/Types";
import { SignallingManager } from "../utils/SignallingManager";

export default function TradeView({
  market,
}: {
  market: string;
}) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartManagerRef = useRef<ChartManager>(null);

  useEffect(() => {
    let cbId: string | null = null;
    let depthCbId: string | null = null;
    let tradeCbId: string | null = null;
    const init = async () => {
      let klineData: KLine[] = [];
      try {
        klineData = await getKlines(market, "1m", Math.floor((new Date().getTime() - 1000 * 60 * 60 * 24 * 7)), Math.floor(new Date().getTime())); 
        console.log("klineData: ", klineData)
    } catch (e) { 
      console.log(e)
    }

      if (chartRef) {
        if (chartManagerRef.current) {
          chartManagerRef.current.destroy();
        }
        console.log(klineData)
        const chartManager = new ChartManager(
          chartRef.current,
          [
            ...klineData?.map((x) => ({
              close: parseFloat(x.close),
              high: parseFloat(x.high),
              low: parseFloat(x.low),
              open: parseFloat(x.open),
              // Use epoch milliseconds (number). ChartManager divides by 1000.
              timestamp: new Date(x.end).getTime(), 
            })),
          ].sort((x, y) => (x.timestamp < y.timestamp ? -1 : 1)) || [],
          {
            background: "#0e0f14",
            color: "white",
          }
        );
        chartManagerRef.current = chartManager;

        // Live updates via WS ticker stream
        cbId = `TICKER-CHART-${market}`
        SignallingManager.getInstance().registerCallback("ticker", (tick: any) => {
          if(!chartManagerRef.current) return;
          const p = parseFloat(String(tick.lastPrice ?? tick.c ?? 0)) || 0
          if(!p) return;
          chartManagerRef.current.update({
            open: p,
            high: p,
            low: p,
            close: p,
            newCandleInitiated: false,
            time: Date.now()
          })
        }, cbId)
        SignallingManager.getInstance().sendMessage({ method: "SUBSCRIBE", params: [`ticker.${market}`] })

        // Fallback: drive chart from depth midpoint if ticker not available
        depthCbId = `DEPTH-CHART-${market}`
        SignallingManager.getInstance().registerCallback("depth", (d: any) => {
          if(!chartManagerRef.current) return;
          const bestBid = Number(d.b?.[0]?.[0] ?? d.bids?.[0]?.[0] ?? 0)
          const bestAsk = Number(d.a?.[0]?.[0] ?? d.asks?.[0]?.[0] ?? 0)
          const p = bestBid && bestAsk ? (bestBid + bestAsk)/2 : (bestBid || bestAsk)
          if(!p) return;
          chartManagerRef.current.update({
            open: p,
            high: p,
            low: p,
            close: p,
            newCandleInitiated: false,
            time: Date.now()
          })
        }, depthCbId)
        SignallingManager.getInstance().sendMessage({ method: "SUBSCRIBE", params: [`depth.${market}`] })

        // Also react to trades
        tradeCbId = `TRADE-CHART-${market}`
        SignallingManager.getInstance().registerCallback("trade", (t: any) => {
          if(!chartManagerRef.current) return;
          const p = Number(t.price ?? t.p ?? 0)
          if(!p) return;
          chartManagerRef.current.update({
            open: p,
            high: p,
            low: p,
            close: p,
            newCandleInitiated: false,
            time: Date.now()
          })
        }, tradeCbId)
        SignallingManager.getInstance().sendMessage({ method: "SUBSCRIBE", params: [`trade.${market}`] })
      }
    };
    void init();
    // Cleanup on market change/unmount
    return () => {
      if (cbId) {
        try {
          SignallingManager.getInstance().derigisterCallback("ticker", cbId)
          SignallingManager.getInstance().sendMessage({ method: "UNSUBSCRIBE", params: [`ticker.${market}`] })
        } catch {}
      }
      if (depthCbId) {
        try {
          SignallingManager.getInstance().derigisterCallback("depth", depthCbId)
          SignallingManager.getInstance().sendMessage({ method: "UNSUBSCRIBE", params: [`depth.${market}`] })
        } catch {}
      }
      if (tradeCbId) {
        try {
          SignallingManager.getInstance().derigisterCallback("trade", tradeCbId)
          SignallingManager.getInstance().sendMessage({ method: "UNSUBSCRIBE", params: [`trade.${market}`] })
        } catch {}
      }
      if (chartManagerRef.current) {
        chartManagerRef.current.destroy();
        chartManagerRef.current = null as any;
      }
    }
  }, [market, chartRef]);

  return (
    <>
      <div ref={chartRef} style={{ height: "520px", width: "100%", marginTop: 4 }}></div>
    </>
  );
}
