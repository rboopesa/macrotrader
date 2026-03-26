// Chart engine — orchestrates all technical overlays for a given candle set + prediction

import { detectSwings, getLatestSwingPair }         from './indicators/swingDetector.js';
import { calculateFibonacci }                         from './indicators/fibonacci.js';
import { buildSRZones, checkForecastZoneInteraction } from './indicators/supportResistance.js';
import { detectTrendline, assessForecastVsTrendline } from './indicators/trendline.js';
import { updateTrackingPoints }                       from './prediction/predictionTracker.js';

const LOOKBACK = { '2w': 3, '1m': 5, '3m': 7, '6m': 10 };

/**
 * Main orchestration function.
 *
 * @param {OHLCV[]}            candles           – sliced to timeframe already
 * @param {RawPrediction|null} prediction        – optional forecast
 * @param {Timeframe}          timeframe         – '2w'|'1m'|'3m'|'6m'
 * @param {PredictionRecord[]} predictionHistory – persisted tracking records
 * @returns {ChartEngineOutput}
 */
export function runChartEngine(candles, prediction, timeframe, predictionHistory = []) {
  const EMPTY = {
    overlays: {
      fibonacci:  null,
      srZones:    { support: [], resistance: [] },
      trendlines: { primary: null },
    },
    structureAssessment: {
      overallSignal:     'neutral',
      fibRespected:      false,
      srRespected:       false,
      trendContinuation: false,
      score:             0,
    },
    predictionHistory,
  };

  if (!candles || candles.length < 10) return EMPTY;

  const lookback      = LOOKBACK[timeframe] || 5;
  const forecastPrices = prediction?.forecastPrices || [];

  // --- Swings -------------------------------------------------------
  const swings    = detectSwings(candles, lookback);
  const swingPair = getLatestSwingPair(swings, candles);

  // --- Fibonacci ----------------------------------------------------
  let fibonacci = null;
  if (swingPair) {
    fibonacci = calculateFibonacci(
      swingPair.swingHigh.price,
      swingPair.swingLow.price,
      forecastPrices,
    );
  }

  // --- S/R zones ----------------------------------------------------
  const srZones = buildSRZones(swings);
  for (const z of [...srZones.resistance, ...srZones.support]) {
    z.forecastInteraction = checkForecastZoneInteraction(z, forecastPrices);
  }

  // --- Trendlines ---------------------------------------------------
  const uptrendLine   = detectTrendline(swings, candles, 'uptrend');
  const downtrendLine = detectTrendline(swings, candles, 'downtrend');

  let primaryTrendline = null;
  if (uptrendLine && downtrendLine) {
    primaryTrendline = uptrendLine.r2 >= downtrendLine.r2 ? uptrendLine : downtrendLine;
  } else {
    primaryTrendline = uptrendLine || downtrendLine;
  }

  const forecastStartIndex = candles.length;
  const trendAssessment    = primaryTrendline
    ? assessForecastVsTrendline(primaryTrendline, forecastStartIndex, forecastPrices)
    : 'continuation';

  // --- Structure assessment -----------------------------------------
  const fibRespected      = fibonacci?.levels?.some(l => l.isKey && l.forecastRespected) ?? false;
  const srRespected       = [...srZones.resistance, ...srZones.support]
                              .some(z => z.forecastInteraction === 'respects');
  const trendContinuation = trendAssessment === 'continuation';
  const score             = [fibRespected, srRespected, trendContinuation].filter(Boolean).length;
  const overallSignal     = score >= 2 ? 'with_structure' : score === 0 ? 'against_structure' : 'neutral';

  // --- Update tracking history --------------------------------------
  const updatedHistory = predictionHistory.map(r => updateTrackingPoints(r, candles));

  return {
    overlays: {
      fibonacci,
      srZones,
      trendlines: { primary: primaryTrendline },
    },
    structureAssessment: { overallSignal, fibRespected, srRespected, trendContinuation, score },
    predictionHistory: updatedHistory,
  };
}
