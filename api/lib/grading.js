// Grading gate — combines confidence cap + factor-scorecard alignment + data
// completeness into a code-decided letter grade and trade authorization.
// Pure functions only — no I/O, no side effects. The AI cannot grade its own
// trade: this runs after the thesis (and red-team pass) are already text.

const GRADE_FLOOR = 'C' // below this, TRADE AUTHORIZATION prints NO
const GRADE_ORDER = ['D', 'C', 'B', 'A']

function scoreConfidenceCap(cap) {
  return cap === 'HIGH' ? 3 : cap === 'MEDIUM' ? 2 : 0
}

function scoreCompleteness(validCount, totalCount) {
  const ratio = totalCount > 0 ? validCount / totalCount : 0
  return ratio >= 0.9 ? 2 : ratio >= 0.6 ? 1 : 0
}

// factorScorecard always has exactly 4 entries (dxy, wti, spx, cot) per
// buildFactorScorecard() in factor-scorecard.js.
function scoreAlignment(factorScorecard, direction) {
  const entries = Object.values(factorScorecard)
  const total = entries.length
  const aligned = entries.filter(v => v === `CONFIRMS-${direction}`).length
  const oppositeLabel = direction === 'LONG' ? 'CONFIRMS-SHORT' : 'CONFIRMS-LONG'
  const conflicting = entries.filter(v => v === oppositeLabel).length
  // More factors actively contradicting the thesis than confirming it is a
  // hard red flag — the thesis is fighting its own evidence.
  if (conflicting > aligned) return -3
  const fraction = total > 0 ? aligned / total : 0
  if (fraction >= 0.75) return 3
  if (fraction >= 0.5) return 2
  if (fraction >= 0.25) return 1
  return 0
}

function scoreToGrade(score) {
  if (score >= 7) return 'A'
  if (score >= 5) return 'B'
  if (score >= 3) return 'C'
  return 'D'
}

/**
 * Extracts the BIAS line from thesis markdown (the "## SETUP VERDICT" section).
 * @param {string} thesisText
 * @returns {'LONG'|'SHORT'|'STAND ASIDE'|null}
 */
export function parseBias(thesisText) {
  const match = thesisText.match(/BIAS:\s*([A-Za-z ]+)/)
  if (!match) return null
  const raw = match[1].trim().toUpperCase()
  if (raw.startsWith('LONG')) return 'LONG'
  if (raw.startsWith('SHORT')) return 'SHORT'
  if (raw.startsWith('STAND ASIDE')) return 'STAND ASIDE'
  return null
}

/**
 * Extracts the mandatory invalidation line. Returns null if the model omitted
 * it or left the template placeholder unfilled — callers must treat null as
 * "brief incomplete", per the no-kill-switch-no-ship rule.
 * @param {string} thesisText
 * @returns {string|null}
 */
export function parseInvalidationLine(thesisText) {
  const match = thesisText.match(/INVALIDATION:\s*(.+)/)
  if (!match) return null
  const value = match[1].trim()
  if (!value || /^\[.*\]$/.test(value)) return null
  return value
}

/**
 * Combines confidence cap + scorecard alignment + data completeness into a
 * final letter grade and trade authorization.
 * @param {object} params
 * @param {'HIGH'|'MEDIUM'|'LOW'} params.confidenceCap
 * @param {{dxy:string,wti:string,spx:string,cot:string}} params.factorScorecard
 * @param {number} params.validCount
 * @param {number} params.totalCount
 * @param {'LONG'|'SHORT'|'STAND ASIDE'|null} params.bias
 * @param {string|null} params.invalidationLine
 * @returns {{grade:'A'|'B'|'C'|'D', authorized:boolean, reason:string}}
 */
export function gradeBrief({ confidenceCap, factorScorecard, validCount, totalCount, bias, invalidationLine }) {
  if (!invalidationLine) {
    return {
      grade: 'D',
      authorized: false,
      reason: 'Missing invalidation line — brief has no kill switch and is marked incomplete.',
    }
  }
  if (bias === 'STAND ASIDE' || !bias) {
    return {
      grade: 'D',
      authorized: false,
      reason: bias === 'STAND ASIDE'
        ? 'Model recommends standing aside — no directional trade to authorize.'
        : 'Could not parse a trade bias from the thesis output.',
    }
  }

  const score = scoreConfidenceCap(confidenceCap) + scoreCompleteness(validCount, totalCount) + scoreAlignment(factorScorecard, bias)
  const grade = scoreToGrade(score)
  const authorized = GRADE_ORDER.indexOf(grade) >= GRADE_ORDER.indexOf(GRADE_FLOOR)
  const reason = authorized
    ? `Grade ${grade} meets the ${GRADE_FLOOR} floor.`
    : `Grade ${grade} is below the ${GRADE_FLOOR} floor — confidence cap, factor alignment, or data completeness too weak to authorize.`

  return { grade, authorized, reason }
}

/**
 * Renders the code-decided authorization block. Never model-authored.
 * @param {{grade:string, authorized:boolean, reason:string}} gradeResult
 */
export function buildAuthorizationBlock({ grade, authorized, reason }) {
  const authLine = authorized
    ? `TRADE AUTHORIZATION: YES — ${reason}`
    : `TRADE AUTHORIZATION: NO — ${reason}`
  return `## TRADE AUTHORIZATION\n${authLine}\nGRADE: ${grade}`
}
