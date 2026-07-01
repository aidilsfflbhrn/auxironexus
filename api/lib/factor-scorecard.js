// Classifies macro factors (DXY, WTI, SPX, COT) against a gold long/short bias.
// Computed here in code from validated feed values — never left to the model
// to judge. Pure — no I/O, no side effects.

// 10-day % change below this magnitude is treated as flat/no-signal rather
// than a noise-driven direction.
const EPSILON_PCT = 0.15

function classifyDirectional(entry, changePct, { risingConfirms, fallingConfirms }) {
  if (!entry || entry.status !== 'VALID' || changePct === null || Number.isNaN(changePct)) return 'ABSENT'
  if (changePct > EPSILON_PCT) return risingConfirms
  if (changePct < -EPSILON_PCT) return fallingConfirms
  return 'CONFLICTS'
}

function classifyCot(entry, net, change) {
  if (!entry || entry.status !== 'VALID' || net === null || Number.isNaN(net)) return 'ABSENT'
  // Net long and steady/adding confirms long; net long but actively unwinding
  // is a mixed signal, not a clean confirmation either way.
  if (net > 0 && (change === null || change >= 0)) return 'CONFIRMS-LONG'
  if (net < 0 && (change === null || change <= 0)) return 'CONFIRMS-SHORT'
  return 'CONFLICTS'
}

/**
 * @param {object} params
 * @param {object} params.manifest - from validateFeeds()
 * @param {number|null} params.dxyChangePct - 10-day % change
 * @param {number|null} params.oilChangePct - 10-day % change
 * @param {number|null} params.spxChangePct - 10-day % change
 * @param {number|null} params.cotNet - net non-commercial position (long - short)
 * @param {number|null} params.cotChange - week-over-week change in cotNet
 * @returns {{dxy:string, wti:string, spx:string, cot:string}} each one of
 *   CONFIRMS-LONG | CONFIRMS-SHORT | CONFLICTS | ABSENT
 */
export function buildFactorScorecard({ manifest, dxyChangePct, oilChangePct, spxChangePct, cotNet, cotChange }) {
  return {
    // Dollar strength is inverse to gold: DXY rising confirms short, falling confirms long.
    dxy: classifyDirectional(manifest.dxy, dxyChangePct, { risingConfirms: 'CONFIRMS-SHORT', fallingConfirms: 'CONFIRMS-LONG' }),
    // Oil up = inflation/geopolitical premium, historically supports gold long.
    wti: classifyDirectional(manifest.wti, oilChangePct, { risingConfirms: 'CONFIRMS-LONG', fallingConfirms: 'CONFIRMS-SHORT' }),
    // SPX falling = risk-off = safe-haven bid for gold (long); SPX rising = risk-on = confirms short.
    spx: classifyDirectional(manifest.spx, spxChangePct, { risingConfirms: 'CONFIRMS-SHORT', fallingConfirms: 'CONFIRMS-LONG' }),
    cot: classifyCot(manifest.cot, cotNet, cotChange),
  }
}

/**
 * Summarizes the scorecard into a single deterministic line the model must
 * reproduce verbatim — direction and factor count are never left to the model.
 * @param {{dxy:string, wti:string, spx:string, cot:string}} scorecard
 */
export function summarizeScorecard(scorecard) {
  const entries = Object.values(scorecard)
  const present = entries.filter(v => v !== 'ABSENT')
  const longCount = entries.filter(v => v === 'CONFIRMS-LONG').length
  const shortCount = entries.filter(v => v === 'CONFIRMS-SHORT').length
  const direction = longCount === shortCount ? 'MIXED' : (longCount > shortCount ? 'LONG' : 'SHORT')
  const aligned = Math.max(longCount, shortCount)
  return `MACRO SCORE: ${aligned}/${present.length} present factors aligned for ${direction}`
}
