import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { useLeftPanelChart } from '../../hooks/useLeftPanelChart.js';
import { tsToDate } from '../../lib/indicators/compute.js';
import { AnalysisPanel } from './AnalysisPanel.jsx';

const INTERVALS = ['1H', '4H', '1D', '1W'];

const DEFAULT_OVERLAYS = {
  ema20: true, ema50: true, bollinger: false,
  fibonacci: true, srZones: true, trendline: true,
  aiHistBand: false, forecast: true, trackMarkers: true, stopTarget: false,
};
const OVERLAY_LABELS = {
  ema20: 'EMA20', ema50: 'EMA50', bollinger: 'Bollinger',
  fibonacci: 'Fib', srZones: 'S/R', trendline: 'Trend',
  aiHistBand: 'AI band', forecast: 'Forecast', trackMarkers: 'Track', stopTarget: 'Stop/Tgt',
};
const OVERLAY_COLORS = {
  ema20: '#EF9F27', ema50: '#D85A30', bollinger: '#378ADD',
  fibonacci: '#7F77DD', srZones: '#1D9E75', trendline: '#EF9F27',
  aiHistBand: '#7F77DD', forecast: '#E24B4A', trackMarkers: '#EF9F27', stopTarget: '#E24B4A',
};

/**
 * LeftPanel — Lightweight Charts 4-pane analysis chart.
 * Replaces the TradingView iframe on the left column.
 *
 * Props:
 *   asset         string
 *   currentPrice  number
 *   candles       [{time (unix), open, high, low, close, volume}]
 *   forecast      [{time (YYYY-MM-DD), mid, upper, lower}]
 *   trackingMarkers [{time, price, status}]
 *   newsEvents    [{time, headline, sentiment, impact}]
 *   overlays      {fibLevels, srZones, trendline, aiHistoricalMid}
 *   stopLoss      number
 *   target        number
 *   interval      '1H'|'4H'|'1D'|'1W'
 *   onIntervalChange fn
 *   activeScenario 'escalation'|'chop'|'deescalation'
 */
export function LeftPanel({
  asset = '',
  currentPrice = 0,
  candles = [],
  forecast = [],
  trackingMarkers = [],
  newsEvents = [],
  overlays = {},
  stopLoss = 0,
  target = 0,
  interval = '1D',
  onIntervalChange,
  activeScenario = 'escalation',
  signal = null,
}) {
  const containerRef = useRef(null);
  const [mode, setMode]               = useState('trader');   // 'clean' | 'trader'
  const [overlayState, setOverlayState] = useState(DEFAULT_OVERLAYS);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const chart = useLeftPanelChart(containerRef, 'light');

  // ── CANDLE DATA ───────────────────────────────────────────────
  useEffect(() => {
    if (candles.length > 0) chart.updateCandles(candles);
  }, [candles]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── FORECAST ─────────────────────────────────────────────────
  // Always load data when forecast arrives; toggleOverlay handles show/hide separately
  useEffect(() => {
    if (forecast.length > 0) {
      chart.updateForecast(forecast, activeScenario);
    }
  }, [forecast]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scenario change → recolor without destroy/recreate
  useEffect(() => {
    chart.recolorForecast(activeScenario);
  }, [activeScenario]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── STRUCTURE OVERLAYS ────────────────────────────────────────
  useEffect(() => {
    if (!candles.length) return;
    const filtered = {
      fibLevels:      overlayState.fibonacci  ? (overlays.fibLevels || [])      : [],
      srZones:        overlayState.srZones    ? (overlays.srZones || [])         : [],
      trendline:      overlayState.trendline  ? (overlays.trendline || null)     : null,
      aiHistoricalMid:overlayState.aiHistBand ? (overlays.aiHistoricalMid || []) : [],
    };
    chart.updateStructureOverlays(filtered, candles, forecast);
  }, [overlays, overlayState, candles, forecast]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── MARKERS ───────────────────────────────────────────────────
  useEffect(() => {
    chart.updateMarkers(
      overlayState.trackMarkers ? trackingMarkers : [],
      newsEvents
    );
  }, [trackingMarkers, newsEvents, overlayState.trackMarkers]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── OVERLAY TOGGLE ────────────────────────────────────────────
  const handleOverlayToggle = useCallback((key) => {
    const next = !overlayState[key];
    setOverlayState(prev => ({ ...prev, [key]: next }));
    chart.toggleOverlay(key, next);
  }, [overlayState, chart]);

  // ── MODE CHANGE ───────────────────────────────────────────────
  const handleModeChange = useCallback((newMode) => {
    setMode(newMode);
    if (newMode === 'clean') {
      Object.keys(overlayState).forEach(k => {
        chart.toggleOverlay(k, ['ema20', 'ema50', 'forecast'].includes(k));
      });
    } else {
      Object.entries(overlayState).forEach(([k, v]) => chart.toggleOverlay(k, v));
    }
  }, [overlayState, chart]);

  // ── PRICE CHANGE ─────────────────────────────────────────────
  const priceChange = useMemo(() => {
    if (candles.length < 2) return 0;
    const prev = candles[candles.length - 2].close;
    return ((currentPrice - prev) / prev) * 100;
  }, [candles, currentPrice]);
  const isPos = priceChange >= 0;

  // ── STYLES ───────────────────────────────────────────────────
  const S = {
    root: {
      display: 'flex', flexDirection: 'column', height: '100%',
      background: '#ffffff', borderRadius: 12,
      border: '0.5px solid #E5E0D5', overflow: 'hidden',
    },
    header: {
      padding: '10px 14px 8px', borderBottom: '0.5px solid #E5E0D5',
      flexShrink: 0,
    },
    row1: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: 8,
    },
    assetName: { fontSize: 13, fontWeight: 700, color: '#0F1F3D', marginRight: 10 },
    price: { fontSize: 20, fontWeight: 700, color: '#0F1F3D', fontFamily: 'monospace' },
    pctChange: { fontSize: 12, fontWeight: 600, marginLeft: 6, color: isPos ? '#059669' : '#DC2626' },
    controls: { display: 'flex', gap: 4, alignItems: 'center' },
    pill: (active) => ({
      fontSize: 10, padding: '3px 9px', borderRadius: 20, cursor: 'pointer',
      border: `0.5px solid ${active ? '#1a1a2e' : '#E5E0D5'}`,
      background: active ? '#1a1a2e' : 'transparent',
      color: active ? '#fff' : '#78716C',
      fontWeight: active ? 500 : 400,
      minHeight: 28,
    }),
    modeWrap: {
      display: 'flex', borderRadius: 20,
      border: '0.5px solid #E5E0D5', overflow: 'hidden', marginLeft: 6,
    },
    modeBtn: (active) => ({
      fontSize: 10, padding: '3px 10px', cursor: 'pointer', border: 'none',
      background: active ? '#1a1a2e' : 'transparent',
      color: active ? '#fff' : '#78716C',
      fontWeight: active ? 500 : 400,
    }),
    overlayRow: { display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 4 },
    overlayPill: (on, color) => ({
      display: 'flex', alignItems: 'center', gap: 3,
      fontSize: 10, padding: '2px 7px', borderRadius: 12, cursor: 'pointer',
      border: `0.5px solid ${on ? color + '66' : '#E5E0D5'}`,
      background: on ? color + '18' : 'transparent',
      color: on ? '#1C1917' : '#78716C',
    }),
    dot: (color) => ({
      width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0,
    }),
    chartWrap: { flex: 1, minHeight: 0 },
    analysisPill: (active) => ({
      fontSize: 10, padding: '3px 9px', borderRadius: 20, cursor: 'pointer',
      border: `0.5px solid ${active ? '#7C3AED' : '#E5E0D5'}`,
      background: active ? '#7C3AED' : 'transparent',
      color: active ? '#fff' : '#78716C',
      fontWeight: active ? 500 : 400,
      marginLeft: 4,
    }),
  };

  return (
    <div style={S.root}>
      {/* ── HEADER ─────────────────────────────────────── */}
      <div style={S.header}>
        <div style={S.row1}>
          <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 2 }}>
            <span style={S.assetName}>{asset}</span>
            <span style={S.price}>
              {currentPrice >= 1000
                ? currentPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })
                : currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span style={S.pctChange}>{isPos ? '+' : ''}{priceChange.toFixed(2)}%</span>
          </div>
          <div style={S.controls}>
            {INTERVALS.map(iv => (
              <button key={iv} onClick={() => onIntervalChange?.(iv)} style={S.pill(interval === iv)}>
                {iv}
              </button>
            ))}
            <div style={S.modeWrap}>
              {['clean', 'trader'].map(m => (
                <button key={m} onClick={() => handleModeChange(m)} style={S.modeBtn(mode === m)}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
            <button onClick={() => setShowAnalysis(v => !v)} style={S.analysisPill(showAnalysis)}>
              Analysis
            </button>
          </div>
        </div>

        {/* Overlay pills — trader mode only */}
        {mode === 'trader' && (
          <div style={S.overlayRow}>
            {Object.keys(overlayState).map(key => {
              const on = overlayState[key];
              const color = OVERLAY_COLORS[key];
              return (
                <button key={key} onClick={() => handleOverlayToggle(key)} style={S.overlayPill(on, color)}>
                  <span style={S.dot(color)} />
                  {OVERLAY_LABELS[key]}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── CHART CANVAS ─────────────────────────────────── */}
      <div ref={containerRef} style={S.chartWrap} />

      {/* ── ANALYSIS REASONING PANEL ─────────────────────── */}
      {showAnalysis && (
        <div style={{ flexShrink: 0, maxHeight: 420, overflowY: 'auto', borderTop: '0.5px solid #E5E0D5' }}>
          <AnalysisPanel signal={signal} asset={asset} />
        </div>
      )}
    </div>
  );
}

export default LeftPanel;
