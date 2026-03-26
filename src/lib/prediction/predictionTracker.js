// Prediction accuracy tracking

export const LAGGING_THRESHOLD = 0.015;  // 1.5% beyond band edge
export const BROKEN_THRESHOLD  = 0.035;  // 3.5% beyond band edge

/**
 * Update tracking points on an existing PredictionRecord by matching
 * each point's timestamp to actual candle close prices.
 *
 * @param {PredictionRecord} record  – record to update
 * @param {OHLCV[]}          candles – recent candle data
 * @returns {PredictionRecord}       – updated record (immutable copy)
 */
export function updateTrackingPoints(record, candles) {
  // Build timestamp → candle lookup
  const candleMap = {};
  for (const c of candles) candleMap[c.time] = c;

  let resolvedCount = 0, withinBandCount = 0, correctDirCount = 0, tightCount = 0;
  let totalMAE = 0;
  let worstStatus = 'on_track';

  const updatedPoints = record.trackingPoints.map(tp => {
    // Already resolved
    if (tp.actualPrice !== null) {
      resolvedCount++;
      if (tp.status === 'on_track') withinBandCount++;
      if (tp.directionCorrect) correctDirCount++;
      if (Math.abs(tp.deviationPct || 0) < 0.005) tightCount++;
      totalMAE += Math.abs(tp.deviationPct || 0);
      if (tp.status === 'broken' && worstStatus !== 'broken') worstStatus = 'broken';
      else if (tp.status === 'lagging' && worstStatus === 'on_track') worstStatus = 'lagging';
      return tp;
    }

    const candle = candleMap[tp.timestamp];
    if (!candle) return tp;

    const actualPrice   = candle.close;
    const deviationPct  = (actualPrice - tp.expectedMid) / (tp.expectedMid || 1);
    const excess        = Math.abs(deviationPct) - (tp.bandWidth || 0.01);
    const status        = excess < 0                ? 'on_track'
                        : excess < BROKEN_THRESHOLD ? 'lagging'
                        :                            'broken';
    const directionCorrect = record.direction === 'up'
      ? actualPrice > tp.expectedMid
      : actualPrice < tp.expectedMid;

    resolvedCount++;
    if (status === 'on_track') withinBandCount++;
    if (directionCorrect) correctDirCount++;
    if (Math.abs(deviationPct) < 0.005) tightCount++;
    totalMAE += Math.abs(deviationPct);
    if (status === 'broken' && worstStatus !== 'broken') worstStatus = 'broken';
    else if (status === 'lagging' && worstStatus === 'on_track') worstStatus = 'lagging';

    return { ...tp, actualPrice, deviationPct: +deviationPct.toFixed(6), status, directionCorrect };
  });

  const accuracy = resolvedCount > 0 ? {
    mae:              +(totalMAE / resolvedCount).toFixed(6),
    withinBandRate:   +(withinBandCount / resolvedCount).toFixed(3),
    directionAccuracy:+(correctDirCount  / resolvedCount).toFixed(3),
    tightAccuracy:    +(tightCount        / resolvedCount).toFixed(3),
  } : record.accuracy;

  return { ...record, trackingPoints: updatedPoints, accuracy, finalStatus: worstStatus };
}
