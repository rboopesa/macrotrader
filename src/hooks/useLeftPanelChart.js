import { useEffect, useRef, useCallback } from 'react';
import {
  createChart,
  ColorType,
  CrosshairMode,
  LineStyle,
} from 'lightweight-charts';
import {
  computeEMA,
  computeBollingerBands,
  computeRSI,
  computeMACD,
  tsToDate,
} from '../lib/indicators/compute.js';

export function useLeftPanelChart(containerRef, theme = 'light') {
  const chartRef        = useRef(null);
  const newsHeadlineMapRef = useRef(new Map());
  // Pane 0 — price
  const candleRef       = useRef(null);
  const ema20Ref        = useRef(null);
  const ema50Ref        = useRef(null);
  const bbUpperRef      = useRef(null);
  const bbMidRef        = useRef(null);
  const bbLowerRef      = useRef(null);
  const trendlineRef    = useRef(null);
  const aiHistRef       = useRef(null);
  const forecastMidRef  = useRef(null);
  const forecastBandRef = useRef(null);
  // Pane 1 — volume
  const volumeRef       = useRef(null);
  // Pane 2 — RSI
  const rsiRef          = useRef(null);
  // Pane 3 — MACD
  const macdLineRef     = useRef(null);
  const macdSignalRef   = useRef(null);
  const macdHistRef     = useRef(null);
  // Dynamic price lines (fib + SR)
  const fibLinesRef     = useRef([]);
  const srLinesRef      = useRef([]);

  const isDark = theme === 'dark';

  // tracks last historical bar time — used for TODAY marker
  const lastHistBarTimeRef = useRef(null);

  // ── INIT ──────────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const chart = createChart(el, {
      layout: {
        background: { type: ColorType.Solid, color: isDark ? '#0d0f14' : '#ffffff' },
        textColor: isDark ? '#8b8fa8' : '#6b7280',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' },
        horzLines: { color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)', style: LineStyle.Dashed, width: 1 },
        horzLine: { color: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)', style: LineStyle.Dashed, width: 1 },
      },
      rightPriceScale: { borderVisible: false, scaleMargins: { top: 0.08, bottom: 0.02 } },
      leftPriceScale: { visible: false },
      timeScale: { borderVisible: false, timeVisible: true, secondsVisible: false, fixLeftEdge: true, rightOffset: 12 },
      handleScroll: true,
      handleScale: true,
      width: el.clientWidth,
      height: el.clientHeight,
    });

    // ── PANE 0: main price ──
    const candle = chart.addCandlestickSeries({
      upColor: '#1D9E75', downColor: '#E24B4A',
      borderUpColor: '#1D9E75', borderDownColor: '#E24B4A',
      wickUpColor: '#1D9E75', wickDownColor: '#E24B4A',
      priceScaleId: 'right',
      pane: 0,
    });
    const ema20 = chart.addLineSeries({
      color: '#EF9F27', lineWidth: 1, priceLineVisible: false,
      lastValueVisible: false, crosshairMarkerVisible: false, title: 'EMA20', pane: 0,
    });
    const ema50 = chart.addLineSeries({
      color: '#D85A30', lineWidth: 1, priceLineVisible: false,
      lastValueVisible: false, crosshairMarkerVisible: false, title: 'EMA50', pane: 0,
    });
    const bbUpper = chart.addLineSeries({
      color: 'rgba(55,138,221,0.4)', lineWidth: 1, lineStyle: LineStyle.Dashed,
      priceScaleId: 'right', priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false, title: 'BB+', pane: 0,
    });
    const bbMid = chart.addLineSeries({
      color: 'rgba(55,138,221,0.25)', lineWidth: 1, lineStyle: LineStyle.Dotted,
      priceScaleId: 'right', priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false, title: 'BBmid', pane: 0,
    });
    const bbLower = chart.addLineSeries({
      color: 'rgba(55,138,221,0.4)', lineWidth: 1, lineStyle: LineStyle.Dashed,
      priceScaleId: 'right', priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false, title: 'BB-', pane: 0,
    });
    const trendline = chart.addLineSeries({
      color: '#EF9F27', lineWidth: 1, lineStyle: LineStyle.Dashed,
      priceLineVisible: false, lastValueVisible: false, title: 'Trend', pane: 0,
    });
    const aiHist = chart.addLineSeries({
      color: 'rgba(127,119,221,0.6)', lineWidth: 1, lineStyle: LineStyle.Dashed,
      priceLineVisible: false, lastValueVisible: false, title: 'AI', pane: 0,
    });
    const forecastBand = chart.addAreaSeries({
      topColor: 'rgba(226,75,74,0.12)', bottomColor: 'rgba(226,75,74,0.02)',
      lineColor: 'transparent', lineWidth: 0,
      priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false, pane: 0,
    });
    const forecastMid = chart.addLineSeries({
      color: '#E24B4A', lineWidth: 1, lineStyle: LineStyle.Dashed,
      priceLineVisible: false, lastValueVisible: true, crosshairMarkerVisible: true, title: 'Forecast', pane: 0,
    });

    // ── PANE 1: volume ──
    const volume = chart.addHistogramSeries({
      priceFormat: { type: 'volume' }, priceScaleId: 'vol',
      pane: 1,
    });
    chart.priceScale('vol').applyOptions({ scaleMargins: { top: 0.1, bottom: 0.0 }, visible: false });

    // ── PANE 2: RSI ──
    const rsi = chart.addLineSeries({
      color: '#7F77DD', lineWidth: 1.5,
      priceLineVisible: false, lastValueVisible: true, title: 'RSI 14', pane: 2,
      autoscaleInfoProvider: () => ({ priceRange: { minValue: 0, maxValue: 100 }, margins: { above: 0.05, below: 0.05 } }),
    });
    // RSI reference lines added after data set — stored for cleanup
    rsi.createPriceLine({ price: 70, color: 'rgba(226,75,74,0.4)', lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true, title: '70' });
    rsi.createPriceLine({ price: 50, color: 'rgba(136,135,128,0.25)', lineWidth: 1, lineStyle: LineStyle.Dotted, axisLabelVisible: false, title: '' });
    rsi.createPriceLine({ price: 30, color: 'rgba(29,158,117,0.4)', lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true, title: '30' });

    // ── PANE 3: MACD ──
    const macdLine = chart.addLineSeries({
      color: '#185FA5', lineWidth: 1,
      priceLineVisible: false, lastValueVisible: true, title: 'MACD (12,26,9)', pane: 3,
    });
    const macdSignal = chart.addLineSeries({
      color: '#E24B4A', lineWidth: 1, lineStyle: LineStyle.Dashed,
      priceLineVisible: false, lastValueVisible: false, pane: 3,
    });
    const macdHist = chart.addHistogramSeries({
      priceScaleId: 'macd', pane: 3,
    });

    // Store refs
    chartRef.current        = chart;
    candleRef.current       = candle;
    ema20Ref.current        = ema20;
    ema50Ref.current        = ema50;
    bbUpperRef.current      = bbUpper;
    bbMidRef.current        = bbMid;
    bbLowerRef.current      = bbLower;
    trendlineRef.current    = trendline;
    aiHistRef.current       = aiHist;
    forecastMidRef.current  = forecastMid;
    forecastBandRef.current = forecastBand;
    volumeRef.current       = volume;
    rsiRef.current          = rsi;
    macdLineRef.current     = macdLine;
    macdSignalRef.current   = macdSignal;
    macdHistRef.current     = macdHist;

    // Tooltip element for news marker headlines
    const tooltip = document.createElement('div');
    tooltip.style.cssText = 'display:none;position:absolute;z-index:10;background:#fff;border:0.5px solid #E5E0D5;border-radius:6px;padding:4px 10px;font-size:11px;color:#1C1917;pointer-events:none;max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-shadow:0 2px 8px rgba(0,0,0,0.08);';
    el.style.position = 'relative';
    el.appendChild(tooltip);

    chart.subscribeCrosshairMove(param => {
      if (!param.time) { tooltip.style.display = 'none'; return; }
      const headline = newsHeadlineMapRef.current.get(String(param.time));
      if (headline && param.point) {
        tooltip.style.display = 'block';
        tooltip.textContent = headline;
        tooltip.style.left = Math.min(param.point.x, el.clientWidth - 230) + 'px';
        tooltip.style.top = '6px';
      } else {
        tooltip.style.display = 'none';
      }
    });

    // Resize observer
    const ro = new ResizeObserver(() => {
      if (el) chart.applyOptions({ width: el.clientWidth, height: el.clientHeight });
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      fibLinesRef.current = [];
      srLinesRef.current  = [];
      if (el.contains(tooltip)) el.removeChild(tooltip);
      chart.remove();
      chartRef.current = null;
    };
  }, [isDark]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── UPDATE CANDLES + ALL DERIVED INDICATORS ──────────────────
  const updateCandles = useCallback((rawCandles) => {
    if (!candleRef.current || !rawCandles.length) return;

    // Convert raw candles (unix ts) → LightweightCharts format
    const lc = rawCandles.map(c => ({
      time: typeof c.time === 'number' ? tsToDate(c.time) : c.time,
      open: c.open, high: c.high, low: c.low, close: c.close,
    }));
    candleRef.current.setData(lc);

    // Track last historical bar time for TODAY marker
    if (lc.length) lastHistBarTimeRef.current = lc[lc.length - 1].time;

    // Volume
    volumeRef.current?.setData(rawCandles.map(c => ({
      time: typeof c.time === 'number' ? tsToDate(c.time) : c.time,
      value: c.volume || 0,
      color: c.close >= c.open ? 'rgba(29,158,117,0.5)' : 'rgba(226,75,74,0.5)',
    })));

    const closes = rawCandles.map(c => c.close);
    const times  = lc.map(c => c.time);

    // EMAs
    ema20Ref.current?.setData(computeEMA(closes, 20).map((v, i) => ({ time: times[i], value: v })));
    ema50Ref.current?.setData(computeEMA(closes, 50).map((v, i) => ({ time: times[i], value: v })));

    // Bollinger
    const bb = computeBollingerBands(closes, 20, 2);
    bbUpperRef.current?.setData(bb.upper.flatMap((v, i) => v === null ? [] : [{ time: times[i], value: v }]));
    bbMidRef.current?.setData(bb.mid.flatMap((v, i) => v === null ? [] : [{ time: times[i], value: v }]));
    bbLowerRef.current?.setData(bb.lower.flatMap((v, i) => v === null ? [] : [{ time: times[i], value: v }]));

    // RSI
    const rsiVals = computeRSI(closes, 14);
    rsiRef.current?.setData(rsiVals.flatMap((v, i) => v === null ? [] : [{ time: times[i], value: v }]));

    // MACD
    const { line, signal, histogram } = computeMACD(closes, 12, 26, 9);
    macdLineRef.current?.setData(line.flatMap((v, i) => v === null ? [] : [{ time: times[i], value: v }]));
    macdSignalRef.current?.setData(signal.flatMap((v, i) => v === null ? [] : [{ time: times[i], value: v }]));
    macdHistRef.current?.setData(histogram.flatMap((v, i) => v === null ? [] : [{
      time: times[i], value: v,
      color: v >= 0 ? 'rgba(29,158,117,0.6)' : 'rgba(226,75,74,0.6)',
    }]));

    chartRef.current?.timeScale().fitContent();
  }, []);

  // ── UPDATE FORECAST ───────────────────────────────────────────
  const updateForecast = useCallback((forecastBars, scenario) => {
    if (!forecastMidRef.current || !forecastBandRef.current) return;
    const colors = {
      escalation:   { line: '#E24B4A', top: 'rgba(226,75,74,0.12)', bottom: 'rgba(226,75,74,0.02)' },
      chop:         { line: '#888780', top: 'rgba(136,135,128,0.10)', bottom: 'rgba(136,135,128,0.02)' },
      deescalation: { line: '#1D9E75', top: 'rgba(29,158,117,0.12)', bottom: 'rgba(29,158,117,0.02)' },
    };
    const c = colors[scenario] || colors.escalation;
    // IMPORTANT: update colors WITHOUT recreating series
    forecastMidRef.current.applyOptions({ color: c.line });
    forecastBandRef.current.applyOptions({ topColor: c.top, bottomColor: c.bottom });
    forecastMidRef.current.setData(forecastBars.map(f => ({ time: f.time, value: f.mid })));
    // Band: upper line of the area (lower values are handled by area fill)
    forecastBandRef.current.setData(forecastBars.map(f => ({ time: f.time, value: f.upper })));
  }, []);

  // ── RECOLOR FORECAST (scenario change — no destroy) ───────────
  const recolorForecast = useCallback((scenario) => {
    if (!forecastMidRef.current || !forecastBandRef.current) return;
    const colors = {
      escalation:   { line: '#E24B4A', top: 'rgba(226,75,74,0.12)', bottom: 'rgba(226,75,74,0.02)' },
      chop:         { line: '#888780', top: 'rgba(136,135,128,0.10)', bottom: 'rgba(136,135,128,0.02)' },
      deescalation: { line: '#1D9E75', top: 'rgba(29,158,117,0.12)', bottom: 'rgba(29,158,117,0.02)' },
    };
    const c = colors[scenario] || colors.escalation;
    // applyOptions is the lightweight-charts equivalent of
    // chartInstance.data.datasets[x].backgroundColor = newColor + chart.update('none')
    forecastMidRef.current.applyOptions({ color: c.line });
    forecastBandRef.current.applyOptions({ topColor: c.top, bottomColor: c.bottom });
  }, []);

  // ── UPDATE STRUCTURE OVERLAYS ─────────────────────────────────
  const updateStructureOverlays = useCallback((overlays, rawCandles, forecastBars) => {
    const candle = candleRef.current;
    if (!candle) return;

    // Clear existing fib price lines
    fibLinesRef.current.forEach(pl => { try { candle.removePriceLine(pl); } catch {} });
    fibLinesRef.current = [];
    // Clear existing SR price lines
    srLinesRef.current.forEach(({ upper, lower }) => {
      try { candle.removePriceLine(upper); candle.removePriceLine(lower); } catch {}
    });
    srLinesRef.current = [];

    // Fib price lines (extend across full chart via price scale)
    (overlays.fibLevels || []).forEach(level => {
      const pl = candle.createPriceLine({
        price: level.price,
        color: level.ratio === 0.618 ? 'rgba(127,119,221,0.85)' : 'rgba(127,119,221,0.45)',
        lineWidth: level.ratio === 0.618 ? 1.5 : 1,
        lineStyle: level.ratio === 0.618 ? LineStyle.Solid : LineStyle.Dashed,
        axisLabelVisible: true,
        title: `Fib ${level.label || (level.ratio * 100).toFixed(1) + '%'}`,
      });
      fibLinesRef.current.push(pl);
    });

    // SR zone boundary lines
    (overlays.srZones || []).forEach(zone => {
      const color = zone.type === 'resistance' ? 'rgba(226,75,74,0.6)' : 'rgba(29,158,117,0.6)';
      const upper = candle.createPriceLine({
        price: zone.upperBound, color, lineWidth: 1, lineStyle: LineStyle.Dotted,
        axisLabelVisible: false, title: '',
      });
      const lower = candle.createPriceLine({
        price: zone.lowerBound, color, lineWidth: 1, lineStyle: LineStyle.Dotted,
        axisLabelVisible: true,
        title: zone.type === 'resistance' ? `R · ${zone.strength || ''}` : `S · ${zone.strength || ''}`,
      });
      srLinesRef.current.push({ upper, lower });
    });

    // Trendline
    if (overlays.trendline && trendlineRef.current && rawCandles.length) {
      const tl = overlays.trendline;
      trendlineRef.current.applyOptions({ color: tl.broken ? '#E24B4A' : '#EF9F27' });
      const allTimes = [
        ...rawCandles.map(c => typeof c.time === 'number' ? tsToDate(c.time) : c.time),
        ...(forecastBars || []).map(f => f.time),
      ];
      trendlineRef.current.setData(
        allTimes.map((time, i) => ({ time, value: tl.priceAt(i) }))
      );
    }

    // AI historical mid
    if (aiHistRef.current && (overlays.aiHistoricalMid || []).length) {
      aiHistRef.current.setData(overlays.aiHistoricalMid.map(d => ({
        time: typeof d.time === 'number' ? tsToDate(d.time) : d.time,
        value: d.value,
      })));
    }
  }, []);

  // ── TRACKING + NEWS MARKERS ───────────────────────────────────
  const updateMarkers = useCallback((trackingMarkers, newsEvents) => {
    if (!candleRef.current) return;

    newsHeadlineMapRef.current.clear();
    (newsEvents || []).forEach(e => {
      if (e.headline) newsHeadlineMapRef.current.set(String(e.time), e.headline);
    });

    // TODAY marker — pin to the last historical bar
    const todayMarkers = lastHistBarTimeRef.current ? [{
      time: lastHistBarTimeRef.current,
      position: 'aboveBar',
      color: '#1a1a2e',
      shape: 'arrowDown',
      size: 1,
      text: 'TODAY',
    }] : [];

    const merged = [
      ...todayMarkers,
      ...(trackingMarkers || []).map(m => ({
        time: m.time,
        position: 'inBar',
        color: m.status === 'on_track' ? '#1D9E75' : m.status === 'lagging' ? '#EF9F27' : '#E24B4A',
        shape: 'circle',
        size: 1,
        text: '',
      })),
      ...(newsEvents || []).map(e => ({
        time: e.time,
        position: 'belowBar',
        color: e.sentiment === 'positive' ? '#1D9E75' : e.sentiment === 'negative' ? '#E24B4A' : '#888780',
        shape: 'arrowUp',
        size: e.impact === 'high' ? 2 : 1,
        text: '',
      })),
    ].sort((a, b) => {
      const ta = String(a.time);
      const tb = String(b.time);
      return ta < tb ? -1 : ta > tb ? 1 : 0;
    });
    candleRef.current.setMarkers(merged);
  }, []);

  // ── TOGGLE OVERLAY VISIBILITY ─────────────────────────────────
  const toggleOverlay = useCallback((key, visible) => {
    const map = {
      ema20: ema20Ref.current,
      ema50: ema50Ref.current,
      trendline: trendlineRef.current,
      aiHistBand: aiHistRef.current,
      forecast: forecastMidRef.current,
    };
    if (map[key]) map[key].applyOptions({ visible });
    if (key === 'bollinger') {
      bbUpperRef.current?.applyOptions({ visible });
      bbMidRef.current?.applyOptions({ visible });
      bbLowerRef.current?.applyOptions({ visible });
    }
    if (key === 'forecast') {
      forecastBandRef.current?.applyOptions({ visible });
    }
  }, []);

  const fitContent = useCallback(() => {
    chartRef.current?.timeScale().fitContent();
  }, []);

  return { chartRef, updateCandles, updateForecast, recolorForecast, updateStructureOverlays, updateMarkers, toggleOverlay, fitContent, newsHeadlineMapRef };
}
