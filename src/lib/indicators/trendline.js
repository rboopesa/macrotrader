// Trendline detection via least-squares regression on swing points

function linearRegression(xs, ys) {
  const n = xs.length;
  if (n < 2) return null;
  const sumX  = xs.reduce((a, b) => a + b, 0);
  const sumY  = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((s, x, i) => s + x * ys[i], 0);
  const sumX2 = xs.reduce((s, x) => s + x * x, 0);
  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return null;
  const slope     = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  const yMean     = sumY / n;
  const ssTot     = ys.reduce((s, y) => s + (y - yMean) ** 2, 0);
  const ssRes     = ys.reduce((s, y, i) => s + (y - (slope * xs[i] + intercept)) ** 2, 0);
  const r2        = ssTot === 0 ? 0 : 1 - ssRes / ssTot;
  return { slope, intercept, r2: +r2.toFixed(4) };
}

/**
 * Fit a trendline to the last 6 swing lows (uptrend) or highs (downtrend).
 * Returns null if insufficient swings.
 */
export function detectTrendline(swings, candles, type) {
  const relevant = type === 'uptrend'
    ? swings.filter(s => s.type === 'low').slice(-6)
    : swings.filter(s => s.type === 'high').slice(-6);

  if (relevant.length < 2) return null;

  const xs  = relevant.map(s => s.index);
  const ys  = relevant.map(s => s.price);
  const reg = linearRegression(xs, ys);
  if (!reg) return null;

  const { slope, intercept, r2 } = reg;

  // Check if broken in last 10 bars
  const last10    = candles.slice(-10);
  const startIdx  = candles.length - 10;
  let broken = false;
  for (let i = 0; i < last10.length; i++) {
    const barIdx    = startIdx + i;
    const linePrice = slope * barIdx + intercept;
    const c = last10[i];
    if (type === 'uptrend'   && c.close < linePrice) { broken = true; break; }
    if (type === 'downtrend' && c.close > linePrice) { broken = true; break; }
  }

  return {
    type,
    slope,
    intercept,
    r2,
    broken,
    startIndex: relevant[0].index,
    endIndex:   relevant[relevant.length - 1].index,
    priceAt: (index) => slope * index + intercept,
  };
}

/**
 * Assess how the forecast compares to the trendline.
 * '>50% of forecast bars violate the line' → 'breakdown_risk'
 * 'trendline.broken'                        → 'broken'
 * otherwise                                 → 'continuation'
 */
export function assessForecastVsTrendline(trendline, forecastStartIndex, forecastPrices) {
  if (!trendline || !forecastPrices.length) return 'continuation';
  if (trendline.broken) return 'broken';

  let violations = 0;
  for (let i = 0; i < forecastPrices.length; i++) {
    const linePrice = trendline.priceAt(forecastStartIndex + i);
    const violated  = trendline.type === 'uptrend'
      ? forecastPrices[i] < linePrice
      : forecastPrices[i] > linePrice;
    if (violated) violations++;
  }
  return violations / forecastPrices.length > 0.5 ? 'breakdown_risk' : 'continuation';
}
