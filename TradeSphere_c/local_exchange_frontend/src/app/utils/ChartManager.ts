import {
    ColorType,
    createChart as createLightWeightChart,
    CrosshairMode,
    ISeriesApi,
    UTCTimestamp,
  } from "lightweight-charts";
  
  export default class ChartManager {
    private candleSeries: ISeriesApi<"Candlestick">;
    private lastUpdateTime: number = 0;
    private chart;
    private container: HTMLElement;
    private tooltipEl: HTMLDivElement | null = null;
    private currentBar: {
      open: number | null;
      high: number | null;
      low: number | null;
      close: number | null;
    } = {
      open: null,
      high: null,
      low: null,
      close: null,
    };
  
    constructor(
      ref,
      initialData,
      layout: { background: string; color: string }
    ) {
        console.log("initialData", initialData)
      this.container = ref as HTMLElement;
      const chart = createLightWeightChart(ref, {
        autoSize: true,
        overlayPriceScales: {
          ticksVisible: true,
          borderVisible: true,
        },
        crosshair: {
          mode: CrosshairMode.Normal,
        },
        rightPriceScale: {
          visible: true,
          ticksVisible: true,
          entireTextOnly: true,
        },
        timeScale: {
          timeVisible: true,
          secondsVisible: true,
          fixLeftEdge: false,
          fixRightEdge: false,
          rightOffset: 5,
          barSpacing: 8,
          borderVisible: true,
        },
        grid: {
          horzLines: {
            visible: false,
          },
          vertLines: {
            visible: false,
          },
        },
        layout: {
          background: {
            type: ColorType.Solid,
            color: layout.background,
          },
          textColor: "white",
        },
      });
      this.chart = chart;
      this.candleSeries = chart.addCandlestickSeries();
  
      this.candleSeries.setData(
        initialData.map((data) => ({
          ...data,
          time: (data.timestamp / 1000) as UTCTimestamp,
        }))
      );

      // Add a TradingView-like floating tooltip that shows date/time and OHLC at crosshair
      this.createOrAttachTooltip();
      const fmt = new Intl.DateTimeFormat(undefined, {
        year: 'numeric', month: 'short', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
      this.chart.subscribeCrosshairMove((param) => {
        if (!this.tooltipEl) return;
        if (!param || !param.time) {
          this.tooltipEl.style.display = 'none';
          return;
        }

        const utcSec = (param.time as number) * 1000;
        const price = param.seriesData.get(this.candleSeries) as any;
        const o = price?.open ?? price?.o ?? '';
        const h = price?.high ?? price?.h ?? '';
        const l = price?.low ?? price?.l ?? '';
        const c = price?.close ?? price?.c ?? '';
        this.tooltipEl.style.display = 'block';
        this.tooltipEl.innerHTML = `
          <div><strong>${fmt.format(utcSec)}</strong></div>
          <div>O: ${Number(o).toLocaleString()} H: ${Number(h).toLocaleString()}</div>
          <div>L: ${Number(l).toLocaleString()} C: ${Number(c).toLocaleString()}</div>
        `;
        // position tooltip near crosshair
        const x = (param.point?.x ?? 0) + 12;
        const y = (param.point?.y ?? 0) + 12;
        this.tooltipEl.style.left = `${x}px`;
        this.tooltipEl.style.top = `${y}px`;
      });
    }
    public update(updatedPrice) {
      if (!this.lastUpdateTime) {
        this.lastUpdateTime = new Date().getTime();
      }
  
      this.candleSeries.update({
        time: (this.lastUpdateTime / 1000) as UTCTimestamp,
        close: updatedPrice.close,
        low: updatedPrice.low,
        high: updatedPrice.high,
        open: updatedPrice.open,
      });
  
      if (updatedPrice.newCandleInitiated) {
        this.lastUpdateTime = updatedPrice.time;
      }
    }
    public destroy() {
      if (this.tooltipEl && this.tooltipEl.parentElement) {
        this.tooltipEl.parentElement.removeChild(this.tooltipEl);
      }
      this.chart.remove();
    }

    private createOrAttachTooltip() {
      if (this.tooltipEl) return;
      const el = document.createElement('div');
      el.style.position = 'absolute';
      el.style.pointerEvents = 'none';
      el.style.zIndex = '2';
      el.style.background = 'rgba(0,0,0,0.7)';
      el.style.color = '#fff';
      el.style.padding = '6px 8px';
      el.style.borderRadius = '6px';
      el.style.fontSize = '12px';
      el.style.display = 'none';
      el.style.transform = 'translate(0, 0)';
      el.style.whiteSpace = 'nowrap';
      // ensure container is positioned
      const parent = this.container as HTMLElement;
      const pos = getComputedStyle(parent).position;
      if (pos === 'static') {
        parent.style.position = 'relative';
      }
      parent.appendChild(el);
      this.tooltipEl = el;
    }
  }