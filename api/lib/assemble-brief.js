// Reassembles the final brief into a fixed render order:
// DATA INTEGRITY header -> TRADE AUTHORIZATION + grade -> regime/thesis ->
// BULL/BEAR/FLIPS block -> structure/zones -> invalidation line.
// Pure — no I/O, no side effects. Splits the thesis markdown by its own
// "## " headers and reorders known sections; unrecognized or missing
// sections are simply skipped rather than crashing the assembly.

const REGIME_THESIS_HEADERS = [
  'WHAT IS DRIVING GOLD RIGHT NOW',
  'ACTIVE REGIME',
  'MACRO ALIGNMENT',
  'NEWS AND CREDIBILITY CHECK',
]

const STRUCTURE_ZONES_HEADERS = [
  'MARKET STRUCTURE',
  'KEY ZONES — H4',
  'VOLUME READING',
  'INTRADAY LEVELS',
  'SWING OUTLOOK',
  'SETUP VERDICT',
  'WHAT WOULD CHANGE THIS VIEW',
]

function splitSections(markdown) {
  const chunks = markdown.split(/\n(?=## )/)
  const sections = {}
  for (const chunk of chunks) {
    const match = chunk.match(/^## (.+)/)
    if (match) sections[match[1].trim()] = chunk.trim()
  }
  return sections
}

function joinSections(sections, headers) {
  return headers.map(h => sections[h]).filter(Boolean).join('\n\n')
}

/**
 * @param {object} params
 * @param {string} params.dataIntegrityHeader
 * @param {string} params.authorizationBlock - code-generated "## TRADE AUTHORIZATION" text
 * @param {string} params.thesisText - AI thesis markdown, post confidence-cap enforcement
 * @param {string|null} params.redTeamText - AI red-team markdown ("## RED TEAM REVIEW..."), or null on failure
 * @param {string|null} params.invalidationLine - extracted invalidation text, or null if missing
 * @returns {string}
 */
export function assembleBrief({ dataIntegrityHeader, authorizationBlock, thesisText, redTeamText, invalidationLine }) {
  const sections = splitSections(thesisText)
  const regimeBlock = joinSections(sections, REGIME_THESIS_HEADERS)
  const structureBlock = joinSections(sections, STRUCTURE_ZONES_HEADERS)
  const redTeamBlock = redTeamText?.trim()
    || '## RED TEAM REVIEW\nRed-team review unavailable this session — the adversarial pass failed or returned nothing.'
  const invalidationBlock = invalidationLine
    ? `## INVALIDATION\nINVALIDATION: ${invalidationLine}`
    : '## INVALIDATION\nINVALIDATION: MISSING — the model did not provide a kill switch. This brief is marked incomplete.'

  return [dataIntegrityHeader, authorizationBlock, regimeBlock, redTeamBlock, structureBlock, invalidationBlock]
    .filter(Boolean)
    .join('\n\n')
}
