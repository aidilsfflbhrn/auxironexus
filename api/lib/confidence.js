// Confidence capping + data-quality reporting, derived from the validation
// manifest produced by validate-feeds.js. Pure functions only — no I/O, no
// side effects. Consumed by brief-generate.js before and after the AI call.

const CONFIDENCE_RANK = { LOW: 0, MEDIUM: 1, HIGH: 2 }

// Factors considered "load-bearing" for macro thesis quality. If any of these
// are absent, confidence is capped at MEDIUM no matter how complete the rest
// of the feed set is.
// NOTE: 'yields' belongs in this list per spec but is omitted for now — no
// yields feed is ever fetched or passed into validateFeeds() yet (US10Y only
// exists as an unused range in validate-feeds.js's PRICE_RANGES). Add 'yields'
// here once a real yields feed is wired into brief-generate.js + validateFeeds().
const LOAD_BEARING_FACTORS = ['dxy', 'cot']

const FEED_LABELS = {
  xau_h4: 'XAU H4',
  xau_daily: 'XAU Daily',
  xau_weekly: 'XAU Weekly',
  dxy: 'DXY',
  wti: 'WTI',
  spx: 'SPX',
  cot: 'COT',
  news: 'News',
  m30: 'M30',
}

const STATUS_SUFFIX = { STALE: 'stale', MISSING: 'missing', INVALID: 'invalid' }

function rankToLabel(rank) {
  return Object.keys(CONFIDENCE_RANK).find(k => CONFIDENCE_RANK[k] === rank)
}

/**
 * Maps feed completeness + load-bearing presence to a maximum allowed confidence.
 * @param {object} manifest - from validateFeeds()
 * @param {number} validCount
 * @param {number} totalCount
 * @returns {'HIGH'|'MEDIUM'|'LOW'}
 */
export function getConfidenceCap(manifest, validCount, totalCount) {
  const ratio = totalCount > 0 ? validCount / totalCount : 0
  const ratioCapRank = ratio >= 0.9 ? CONFIDENCE_RANK.HIGH
    : ratio >= 0.6 ? CONFIDENCE_RANK.MEDIUM
    : CONFIDENCE_RANK.LOW

  const loadBearingMissing = LOAD_BEARING_FACTORS.some(key => manifest[key]?.status !== 'VALID')
  const loadBearingCapRank = loadBearingMissing ? CONFIDENCE_RANK.MEDIUM : CONFIDENCE_RANK.HIGH

  // Final cap is the stricter of the two independent ceilings.
  return rankToLabel(Math.min(ratioCapRank, loadBearingCapRank))
}

/**
 * Clamps a stated confidence down to the cap. Never raises it.
 * @param {string} stated
 * @param {'HIGH'|'MEDIUM'|'LOW'} cap
 */
export function clampConfidence(stated, cap) {
  const statedRank = CONFIDENCE_RANK[String(stated || '').trim().toUpperCase()] ?? CONFIDENCE_RANK.LOW
  const capRank = CONFIDENCE_RANK[cap] ?? CONFIDENCE_RANK.LOW
  return rankToLabel(Math.min(statedRank, capRank))
}

/**
 * Rewrites the "CONFIDENCE: X" line in AI-generated brief text so it never
 * exceeds the cap. This is structural enforcement — independent of whatever
 * the prompt asked the model to do.
 * @param {string} briefText
 * @param {'HIGH'|'MEDIUM'|'LOW'} cap
 */
export function enforceConfidenceCap(briefText, cap) {
  // Anchored to line-start so "REGIME CONFIDENCE: ..." (an earlier, unrelated
  // field in the brief template) can never be mistaken for this line — a
  // plain /CONFIDENCE:/ match is a substring of "REGIME CONFIDENCE:" too and
  // would grab that line first since it appears earlier in the document.
  const match = briefText.match(/^CONFIDENCE:\s*([A-Za-z]+)/m)
  if (!match) return { content: briefText, statedConfidence: null, finalConfidence: null }
  const stated = match[1].toUpperCase()
  const finalConfidence = clampConfidence(stated, cap)
  // Splice by the match's exact position rather than briefText.replace(match[0], ...) —
  // that does its own unanchored substring search and can still land on
  // "REGIME CONFIDENCE: ..." if the stated values happen to coincide.
  const content = finalConfidence === stated
    ? briefText
    : briefText.slice(0, match.index) + `CONFIDENCE: ${finalConfidence}` + briefText.slice(match.index + match[0].length)
  return { content, statedConfidence: stated, finalConfidence }
}

/**
 * Renders the data-integrity header from the manifest — never from model output.
 * @param {object} manifest - from validateFeeds()
 * @param {number} validCount
 * @param {number} totalCount
 * @returns {string}
 */
export function buildDataIntegrityHeader(manifest, validCount, totalCount) {
  const feedLines = Object.entries(manifest).map(([key, entry]) => {
    const label = FEED_LABELS[key] ?? key.toUpperCase()
    const mark = entry.status === 'VALID' ? '✓' : '✗'
    const suffix = STATUS_SUFFIX[entry.status]
    return suffix ? `${label} ${mark} ${suffix}` : `${label} ${mark}`
  })
  return `DATA INTEGRITY: ${validCount}/${totalCount} feeds valid\n${feedLines.join(' / ')}`
}
