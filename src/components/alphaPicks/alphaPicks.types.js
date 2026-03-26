/**
 * @typedef {'tracked'|'discovery'} PickType
 * @typedef {'today'|'2-3 days'|'swing'} PickHorizon
 * @typedef {'watch'|'buy_zone'|'avoid'} PickStatus
 *
 * @typedef {Object} AlphaPick
 * @property {string} id
 * @property {string} asset              - e.g. 'gold', 'btc'
 * @property {string} displayName        - e.g. 'Gold', 'Bitcoin'
 * @property {number} currentPrice
 * @property {PickType} type
 * @property {PickStatus} status
 * @property {number} issuedAt           - unix ms
 * @property {number} entryZoneLow
 * @property {number} entryZoneHigh
 * @property {number} upsidePercent      - e.g. 6.2
 * @property {number} upsideTarget       - absolute price
 * @property {number} downsidePercent    - e.g. -1.7 (stored as negative)
 * @property {number} downsideStop       - absolute price
 * @property {PickHorizon} horizon
 * @property {string} reason             - one sentence, max 80 chars
 * @property {number} confidence         - 0–100
 * @property {number} scenarioProbability - dominant scenario %
 */

// TODO: Phase 2 — manual_trade records will add:
//   actualEntryPrice: number
//   actualEntryDate: number
//   actualExitPrice: number | null
//   actualExitDate: number | null
//   notes: string
