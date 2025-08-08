"use client";
import { useMemo, useState } from "react";

export default function OrderForm({ market }: { market: string }) {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [price, setPrice] = useState<string>("");
  const [qty, setQty] = useState<string>("");

  const total = useMemo(() => {
    const p = Number(price);
    const q = Number(qty);
    if (!p || !q) return 0;
    return p * q;
  }, [price, qty]);

  const pctFill = (pct: number) => {
    // placeholder: set qty to a simple % for demo; real impl should use balance
    const q = Number(qty) || 1;
    setQty(((q * pct) / 100).toString());
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Wire to backend create-order API in Phase 2
    console.log("submit order", { market, side, price, qty, total });
  };

  return (
    <form onSubmit={onSubmit} className="text-xs">
      {/* header */}
      <div className="flex items-center gap-2 px-1 pb-2 border-b border-border/60 mb-3">
        <button
          type="button"
          onClick={() => setSide("buy")}
          className={`px-2 py-1 rounded-md border text-xs ${side === "buy" ? "bg-emerald-600/20 text-emerald-300 border-emerald-600/50" : "bg-secondary text-foreground/80 border-border"}`}
        >
          Buy
        </button>
        <button
          type="button"
          onClick={() => setSide("sell")}
          className={`px-2 py-1 rounded-md border text-xs ${side === "sell" ? "bg-red-600/20 text-red-300 border-red-600/50" : "bg-secondary text-foreground/80 border-border"}`}
        >
          Sell
        </button>
        <div className="ml-auto text-[11px] text-muted-foreground">{market}</div>
      </div>

      <div className="space-y-2">
        <label className="block text-[11px] text-muted-foreground">Price</label>
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          inputMode="decimal"
          placeholder="0.00"
          className="w-full h-8 rounded-md bg-secondary border border-border px-2 outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="space-y-2 mt-3">
        <label className="block text-[11px] text-muted-foreground">Quantity</label>
        <input
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          inputMode="decimal"
          placeholder="0.0000"
          className="w-full h-8 rounded-md bg-secondary border border-border px-2 outline-none focus:ring-1 focus:ring-primary"
        />
        <div className="grid grid-cols-4 gap-2 text-[11px]">
          {[25, 50, 75, 100].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => pctFill(p)}
              className="rounded-md bg-secondary hover:bg-secondary/80 border border-border py-1"
            >
              {p}%
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 text-[11px] text-muted-foreground flex justify-between">
        <span>Order Value</span>
        <span className="text-foreground">{total.toLocaleString(undefined, { maximumFractionDigits: 8 })}</span>
      </div>

      <button
        type="submit"
        className={`mt-3 w-full rounded-md h-9 font-medium ${
          side === "buy"
            ? "bg-emerald-600 hover:bg-emerald-500 text-black"
            : "bg-red-600 hover:bg-red-500 text-black"
        }`}
      >
        {side === "buy" ? "Place Buy Order" : "Place Sell Order"}
      </button>
    </form>
  );
}
