// Support & Resistance zone detection via swing-point clustering

/**
 * Cluster nearby swing points into S/R zones.
 *
 * @param {SwingPoint[]} swings           – output of detectSwings()
 * @param {number}       clusterThreshold – max relative distance to merge points (default 0.8%)
 * @param {number}       maxZones         – max zones to return per side (default 2)
 * @returns {{ support: SRZone[], resistance: SRZone[] }}
 */
export function buildSRZones(swings, clusterThreshold = 0.008, maxZones = 2) {
  const cluster = (points) => {
    const zones = [];
    const used  = new Set();

    for (let i = 0; i < points.length; i++) {
      if (used.has(i)) continue;
      const group = [points[i]];
      used.add(i);

      for (let j = i + 1; j < points.length; j++) {
        if (used.has(j)) continue;
        if (Math.abs(points[j].price - points[i].price) / (points[i].price || 1) < clusterThreshold) {
          group.push(points[j]);
          used.add(j);
        }
      }

      const centerPrice  = group.reduce((s, p) => s + p.price, 0) / group.length;
      const maxPrice     = Math.max(...group.map(p => p.price));
      const minPrice     = Math.min(...group.map(p => p.price));
      const margin       = centerPrice * clusterThreshold;
      const touches      = group.length;
      const strength     = touches >= 3 ? 'strong' : touches >= 2 ? 'moderate' : 'weak';
      const lastTouchIndex = Math.max(...group.map(p => p.index));

      zones.push({
        centerPrice:    +centerPrice.toFixed(4),
        upperBound:     +Math.max(maxPrice, centerPrice + margin).toFixed(4),
        lowerBound:     +Math.min(minPrice, centerPrice - margin).toFixed(4),
        touches,
        strength,
        lastTouchIndex,
      });
    }

    // Return top zones by touch count
    return zones.sort((a, b) => b.touches - a.touches).slice(0, maxZones);
  };

  return {
    resistance: cluster(swings.filter(s => s.type === 'high')),
    support:    cluster(swings.filter(s => s.type === 'low')),
  };
}

/**
 * Check how a forecast price series interacts with a zone.
 * 'respects' – forecast entered the zone and did not exit
 * 'breaks'   – forecast entered and then exited
 * 'none'     – forecast never entered
 */
export function checkForecastZoneInteraction(zone, forecastPrices) {
  if (!forecastPrices || !forecastPrices.length) return 'none';
  let entered = false;
  for (let i = 0; i < forecastPrices.length; i++) {
    const inZone = forecastPrices[i] >= zone.lowerBound && forecastPrices[i] <= zone.upperBound;
    if (inZone) { entered = true; }
    else if (entered) { return 'breaks'; }
  }
  return entered ? 'respects' : 'none';
}
