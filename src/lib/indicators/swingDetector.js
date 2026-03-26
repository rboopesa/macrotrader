// Swing point detection

/**
 * Detect swing highs and lows using a rolling lookback window.
 * A swing high is where candles[i].high is the maximum in [i-lookback, i+lookback].
 * A swing low  is where candles[i].low  is the minimum in the same window.
 * @param {Array}  candles  – array of {time, open, high, low, close}
 * @param {number} lookback – half-window size (default 5)
 * @returns {Array<SwingPoint>}
 */
export function detectSwings(candles, lookback = 5) {
  const swings = [];
  for (let i = lookback; i < candles.length - lookback; i++) {
    const window = candles.slice(i - lookback, i + lookback + 1);
    const windowHighs = window.map(c => c.high);
    const windowLows  = window.map(c => c.low);
    const maxHigh = Math.max(...windowHighs);
    const minLow  = Math.min(...windowLows);
    const avgHigh = windowHighs.reduce((a, b) => a + b, 0) / windowHighs.length;
    const avgLow  = windowLows.reduce((a, b) => a + b, 0)  / windowLows.length;

    if (candles[i].high >= maxHigh) {
      const strength = avgHigh > 0 ? (candles[i].high - avgHigh) / avgHigh : 0;
      swings.push({
        index:     i,
        timestamp: candles[i].time,
        price:     candles[i].high,
        type:      'high',
        strength:  +Math.abs(strength).toFixed(6),
      });
    }

    if (candles[i].low <= minLow) {
      const strength = avgLow > 0 ? (avgLow - candles[i].low) / avgLow : 0;
      swings.push({
        index:     i,
        timestamp: candles[i].time,
        price:     candles[i].low,
        type:      'low',
        strength:  +Math.abs(strength).toFixed(6),
      });
    }
  }
  return swings;
}

/**
 * From a swing array, return the single highest-scored high and lowest-scored low.
 * Score = strength * 0.6 + (index / N) * 0.4  (recency matters)
 */
export function getLatestSwingPair(swings, candles) {
  if (!swings.length || !candles.length) return null;
  const N = candles.length;
  const score = s => s.strength * 0.6 + (s.index / N) * 0.4;

  const highs = swings.filter(s => s.type === 'high');
  const lows  = swings.filter(s => s.type === 'low');
  if (!highs.length || !lows.length) return null;

  const swingHigh = highs.reduce((best, s) => score(s) > score(best) ? s : best);
  const swingLow  = lows.reduce( (best, s) => score(s) > score(best) ? s : best);
  return { swingHigh, swingLow };
}
