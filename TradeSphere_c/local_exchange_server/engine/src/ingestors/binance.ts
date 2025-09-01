/* Binance WebSocket ingestor -> publishes to Redis WS channels
   Env:
   - EXTERNAL_MARKET (default: BTCUSDT)
   - MARKET_ALIAS (default: BTC_USDC)  // the channel symbol we publish under
*/

// Use require to avoid needing @types/ws immediately
// eslint-disable-next-line @typescript-eslint/no-var-requires
const WebSocket = require('ws');
import { RedisManager } from "../RedisManager";

export class BinanceIngestor {
  private ws: any;
  private symbol: string;
  private alias: string;

  constructor(symbol?: string, alias?: string) {
    this.symbol = (symbol || process.env.EXTERNAL_MARKET || 'BTCUSDT').toLowerCase();
    this.alias = alias || process.env.MARKET_ALIAS || 'BTC_USDC';
  }

  start() {
    const streams = [
      `${this.symbol}@depth5@100ms`,
      `${this.symbol}@trade`,
      `${this.symbol}@ticker`,
    ].join('/');

    const url = `wss://stream.binance.com:9443/stream?streams=${streams}`;
    this.ws = new WebSocket(url);

    this.ws.on('open', () => {
      console.log('[BinanceIngestor] connected to', url);
    });

    this.ws.on('message', (raw: Buffer) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (!msg || !msg.stream || !msg.data) return;
        const stream: string = msg.stream;
        const data = msg.data;

        if (stream.endsWith('@depth5@100ms')) {
          this.handleDepth(data);
        } else if (stream.endsWith('@trade')) {
          this.handleTrade(data);
        } else if (stream.endsWith('@ticker')) {
          this.handleTicker(data);
        }
      } catch (e) {
        console.error('[BinanceIngestor] parse error', e);
      }
    });

    this.ws.on('close', () => {
      console.log('[BinanceIngestor] connection closed, retrying in 3s...');
      setTimeout(() => this.start(), 3000);
    });

    this.ws.on('error', (err: Error) => {
      console.error('[BinanceIngestor] ws error', err);
      try { this.ws.close(); } catch {}
    });
  }

  stop() {
    try { this.ws?.close(); } catch {}
  }

  private handleDepth(d: any) {
    // Binance depth payload has bids/asks arrays: [[price, qty], ...]
    const b: [string, string][] = (d.bids || []).slice(0, 25);
    const a: [string, string][] = (d.asks || []).slice(0, 25);

    const channel = `depth.${this.alias}`;
    RedisManager.getInstance().publishMessage(channel, {
      stream: channel,
      data: { b, a, e: 'depth' },
    });
  }

  private handleTrade(d: any) {
    // Fields: p(price), q(qty), m(isBuyerMaker), t(tradeId), T(timestamp)
    const channel = `trade.${this.alias}`;
    RedisManager.getInstance().publishMessage(channel, {
      stream: channel,
      data: {
        e: 'trade',
        t: d.t,
        m: d.m,
        p: String(d.p),
        q: String(d.q),
        s: this.alias,
      },
    });
  }

  private handleTicker(d: any) {
    // 24hr rolling ticker; we need strings for c/h/l/v/V and numeric id
    const channel = `ticker.${this.alias}`;
    RedisManager.getInstance().publishMessage(channel, {
      stream: channel,
      data: {
        e: 'ticker',
        s: this.alias,
        h: String(d.h ?? d.highPrice ?? ''),
        l: String(d.l ?? d.lowPrice ?? ''),
        c: String(d.c ?? d.lastPrice ?? ''),
        v: String(d.v ?? d.volume ?? ''),
        V: String(d.q ?? d.quoteVolume ?? ''),
        id: Date.now(),
      },
    });
  }
}
