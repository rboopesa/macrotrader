// ── Point-in-time indicator computations (no look-ahead) ──────

/** EMA — seeded from first close, no nulls */
export function computeEMA(closes, period) {
  if (!closes || closes.length === 0) return [];
  const k = 2 / (period + 1);
  const result = [];
  let ema = closes[0];
  for (let i = 0; i < closes.length; i++) {
    ema = closes[i] * k + ema * (1 - k);
    result.push(parseFloat(ema.toFixed(4)));
  }
  return result;
}

/** Bollinger Bands — null for first period-1 bars */
export function computeBollingerBands(closes, period = 20, stdDevMult = 2) {
  const upper = [], mid = [], lower = [];
  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      upper.push(null); mid.push(null); lower.push(null);
      continue;
    }
    const slice = closes.slice(i - period + 1, i + 1);
    const mean = slice.reduce((a, b) => a + b, 0) / period;
    const variance = slice.reduce((a, b) => a + (b - mean) ** 2, 0) / period;
    const sd = Math.sqrt(variance);
    upper.push(parseFloat((mean + stdDevMult * sd).toFixed(4)));
    mid.push(parseFloat(mean.toFixed(4)));
    lower.push(parseFloat((mean - stdDevMult * sd).toFixed(4)));
  }
  return { upper, mid, lower };
}

/** RSI using Wilder's smoothing — null for first period bars */
export function computeRSI(closes, period = 14) {
  if (closes.length <= period) return closes.map(() => null);
  const result = Array(period).fill(null);
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff; else losses -= diff;
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  const rs0 = avgLoss === 0 ? 100 : avgGain / avgLoss;
  result.push(parseFloat((100 - 100 / (1 + rs0)).toFixed(2)));
  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    result.push(parseFloat((100 - 100 / (1 + rs)).toFixed(2)));
  }
  return result;
}

/** MACD (12, 26, 9) */
export function computeMACD(closes, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  const fastEMA = computeEMA(closes, fastPeriod);
  const slowEMA = computeEMA(closes, slowPeriod);
  const macdLine = closes.map((_, i) =>
    i < slowPeriod - 1 ? null : parseFloat((fastEMA[i] - slowEMA[i]).toFixed(6))
  );
  // Signal: EMA of valid MACD values only
  const validMacd = macdLine.filter(v => v !== null);
  const signalEMA = computeEMA(validMacd, signalPeriod);
  let validIdx = 0;
  const signal = macdLine.map(v => {
    if (v === null) return null;
    return signalEMA[validIdx++] ?? null;
  });
  const histogram = macdLine.map((v, i) =>
    v === null || signal[i] === null ? null : parseFloat((v - signal[i]).toFixed(6))
  );
  return { line: macdLine, signal, histogram };
}

/** Convert unix timestamp → 'YYYY-MM-DD' */
export function tsToDate(ts) {
  return new Date(ts * 1000).toISOString().slice(0, 10);
}
