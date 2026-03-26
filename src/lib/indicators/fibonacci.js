// Fibonacci retracement levels + forecast interaction detection

export const FIB_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];

/**
 * Calculate Fibonacci retracement levels between a swing high and swing low.
 * Also analyse how a forecast price array interacts with each level.
 *
 * @param {number}   swingHigh      – price of the swing high
 * @param {number}   swingLow       – price of the swing low
 * @param {number[]} forecastPrices – projected prices (may be empty)
 * @param {number}   tolerance      – relative proximity for "bounce" detection (default 0.3%)
 * @returns {FibResult}
 */
export function calculateFibonacci(swingHigh, swingLow, forecastPrices = [], tolerance = 0.003) {
  const range = swingHigh - swingLow;

  const levels = FIB_LEVELS.map(ratio => {
    const price = +(swingHigh - ratio * range).toFixed(4);
    const label = `${(ratio * 100).toFixed(1)}%`;
    const isKey  = ratio === 0.382 || ratio === 0.5 || ratio === 0.618;

    let forecastCrossed  = false;
    let forecastRespected = false;

    if (forecastPrices.length > 1) {
      for (let i = 1; i < forecastPrices.length; i++) {
        const prev = forecastPrices[i - 1];
        const curr = forecastPrices[i];
        // Crossed through the level
        if ((prev < price && curr > price) || (prev > price && curr < price)) {
          forecastCrossed = true;
        }
        // Came within tolerance and then moved away (bounce)
        if (!forecastCrossed && Math.abs(curr - price) / (price || 1) < tolerance) {
          const next = forecastPrices[i + 1];
          if (next !== undefined && Math.abs(next - price) > Math.abs(curr - price)) {
            forecastRespected = true;
          }
        }
      }
    }

    const forecastInteraction = forecastCrossed   ? 'crossed'
                              : forecastRespected ? 'respected'
                              :                     'none';

    return { ratio, price, label, isKey, forecastCrossed, forecastRespected, forecastInteraction };
  });

  return { swingHigh, swingLow, levels };
}
