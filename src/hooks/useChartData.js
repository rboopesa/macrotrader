// React hook — slices candles, runs chart engine, persists prediction history

import { useMemo, useEffect, useRef } from 'react';
import { runChartEngine } from '../lib/chartEngine.js';

const HISTORY_KEY  = 'predictionHistory';
const MAX_RECORDS  = 90;
const MAX_AGE_MS   = 180 * 86400000; // 180 days

const TIMEFRAME_BARS = { '2w': 14, '1m': 30, '3m': 90, '6m': 180 };

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const records = JSON.parse(raw);
    const cutoff  = Date.now() - MAX_AGE_MS;
    return records.filter(r => r.createdAt > cutoff).slice(0, MAX_RECORDS);
  } catch { return []; }
}

function saveHistory(records) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(records.slice(0, MAX_RECORDS)));
  } catch {}
}

/**
 * useChartData
 *
 * @param {OHLCV[]}            rawCandles   – full candle array from fetchPrice
 * @param {RawPrediction|null} rawPrediction – optional forecast object with id + forecastPrices
 * @param {Timeframe}          timeframe    – '2w'|'1m'|'3m'|'6m'
 * @returns {ChartEngineOutput|null}
 */
export function useChartData(rawCandles, rawPrediction, timeframe) {
  // Lazy-init history from localStorage
  const historyRef = useRef(null);
  if (historyRef.current === null) {
    historyRef.current = loadHistory();
  }

  const predId = rawPrediction?.id;

  // When a new prediction arrives, persist a tracking record
  useEffect(() => {
    if (!predId || !rawPrediction?.forecastPrices?.length) return;
    const exists = historyRef.current.some(r => r.id === predId);
    if (exists) return;

    const newRecord = {
      id:        predId,
      type:      'ai_prediction', // TODO: Phase 2 — manual_trade records will be added
      createdAt: Date.now(),
      direction: rawPrediction.direction || 'up',
      trackingPoints: rawPrediction.forecastPrices.map((price, i) => ({
        barIndex:    i,
        timestamp:   rawPrediction.forecastTimestamps?.[i] || 0,
        expectedMid: price,
        bandWidth:   rawPrediction.bandWidth || 0.01,
        actualPrice: null,
        deviationPct: null,
        status:      'pending',
        directionCorrect: null,
      })),
      accuracy:    null,
      finalStatus: 'pending',
    };

    historyRef.current = [newRecord, ...historyRef.current].slice(0, MAX_RECORDS);
    saveHistory(historyRef.current);
  }, [predId]); // eslint-disable-line react-hooks/exhaustive-deps

  const bars = TIMEFRAME_BARS[timeframe] || 90;

  const engineOutput = useMemo(() => {
    if (!rawCandles || rawCandles.length === 0) return null;
    const sliced = rawCandles.slice(-bars);
    return runChartEngine(sliced, rawPrediction, timeframe, historyRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawCandles.length, timeframe, predId]);

  return engineOutput;
}
