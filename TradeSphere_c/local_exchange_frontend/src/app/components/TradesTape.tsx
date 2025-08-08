"use client";
import { useEffect, useRef, useState } from "react";
import { SignallingManager } from "../utils/SignallingManager";

type TradeRow = {
  p: number; // price
  q?: number; // qty (optional, if provided)
  s?: string; // side: buy/sell (optional)
  t: number; // time
};

export default function TradesTape({ market }: { market: string }) {
  const [rows, setRows] = useState<TradeRow[]>([]);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    const cbId = `TRADES-TAPE-${market}`;

    const onTrade = (t: any) => {
      const price = Number(t.price ?? t.p ?? 0);
      const qty = Number(t.qty ?? t.q ?? 0);
      const side: string | undefined = t.side ?? t.S;
      if (!price) return;
      const row: TradeRow = { p: price, q: qty || undefined, s: side, t: Date.now() };
      setRows((prev) => {
        const next = [row, ...prev];
        return next.slice(0, 200);
      });
    };

    SignallingManager.getInstance().registerCallback("trade", onTrade, cbId);
    SignallingManager.getInstance().sendMessage({ method: "SUBSCRIBE", params: [`trade.${market}`] });

    return () => {
      try {
        SignallingManager.getInstance().derigisterCallback("trade", cbId);
        SignallingManager.getInstance().sendMessage({ method: "UNSUBSCRIBE", params: [`trade.${market}`] });
      } catch {}
      mounted.current = false;
    };
  }, [market]);

  return (
    <div className="panel h-full w-full text-xs">
      {/* header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/60 text-muted-foreground">
        <span className="uppercase tracking-wide text-[11px]">Trades</span>
        <span className="ml-auto hidden sm:inline text-[11px]">{market}</span>
      </div>
      {/* body */}
      <div className="min-h-0 flex-1 overflow-auto">
        <div className="grid grid-cols-3 px-3 py-2 text-[11px] text-muted-foreground">
          <div>Price</div>
          <div className="text-right">Size</div>
          <div className="text-right">Time</div>
        </div>
        <div className="pb-2">
          {rows.map((r, idx) => {
            const color = r.s === "sell" ? "text-red-400" : r.s === "buy" ? "text-emerald-400" : "text-foreground";
            return (
              <div key={idx} className="grid grid-cols-3 px-3 py-1 text-[12px]">
                <div className={`${color}`}>{r.p.toLocaleString(undefined, { maximumFractionDigits: 8 })}</div>
                <div className="text-right text-muted-foreground">{r.q ? r.q.toLocaleString(undefined, { maximumFractionDigits: 8 }) : "-"}</div>
                <div className="text-right text-muted-foreground">{new Date(r.t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</div>
              </div>
            );
          })}
          {rows.length === 0 && (
            <div className="px-3 py-6 text-center text-[11px] text-muted-foreground">Waiting for trades…</div>
          )}
        </div>
      </div>
    </div>
  );
}
