// Track-record scorer. Persists a call record when a brief opens a directional
// thesis, and scores open records against subsequent Daily closes.
//
// Parsing + scoring functions (top section) are pure — no I/O, no side effects.
// They are tested against a full assembled brief document, not an isolated
// snippet, because the regexes are anchored to line-start and a snippet can
// hide collisions with other "LABEL:" lines elsewhere in the document.
//
// I/O helpers (bottom section) talk to Upstash Redis via the REST API, using
// the same fetch + POST-body-as-value convention as brief-generate.js. Every
// Redis call is wrapped in its own try/catch so a store failure never crashes
// the caller — the brief itself must still ship even if the call record does not.

const DECISION_ZONE_RE = /^DECISION ZONE:\s*(.+)$/m
const PRIMARY_TARGET_RE = /^PRIMARY TARGET:\s*(.+)$/m
const ALTERNATE_RE = /^ALTERNATE:\s*(.+)$/m

function stripPlaceholder(value) {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  if (/^\[.*\]$/.test(trimmed)) return null
  if (/^N\/A/i.test(trimmed)) return null
  return trimmed
}

/**
 * Extracts the "DECISION ZONE: ..." line — the price range this call is based on.
 * @param {string} briefText - assembled brief markdown (full document)
 * @returns {string|null}
 */
export function parseDecisionZone(briefText) {
  const match = briefText.match(DECISION_ZONE_RE)
  return match ? stripPlaceholder(match[1]) : null
}

/**
 * Extracts the "PRIMARY TARGET: ..." line as a number.
 * @param {string} briefText
 * @returns {number|null}
 */
export function parsePrimaryTarget(briefText) {
  const match = briefText.match(PRIMARY_TARGET_RE)
  const raw = match ? stripPlaceholder(match[1]) : null
  if (!raw) return null
  const num = parseFloat(raw.replace(/,/g, ''))
  return Number.isNaN(num) ? null : num
}

/**
 * Extracts the "ALTERNATE: ..." line — direction plus the model's own
 * description of what would confirm it instead of the primary thesis.
 * @param {string} briefText
 * @returns {{direction: 'LONG'|'SHORT'|null, detail: string}|null}
 */
export function parseAlternate(briefText) {
  const match = briefText.match(ALTERNATE_RE)
  const raw = match ? stripPlaceholder(match[1]) : null
  if (!raw) return null
  const dirMatch = raw.match(/^(LONG|SHORT)\b/i)
  return { direction: dirMatch ? dirMatch[1].toUpperCase() : null, detail: raw }
}

/**
 * Assembles a call record from a generated brief. Returns null if the brief
 * has no directional bias, or the Daily structure levels needed to grade it
 * later are missing — a call record with no structure level can never be
 * scored, so it is not worth persisting.
 *
 * @param {object} params
 * @param {string} params.instrument - e.g. 'XAU/USD'
 * @param {string} params.session
 * @param {'LONG'|'SHORT'|'STAND ASIDE'|null} params.bias
 * @param {string} params.grade - e.g. 'A+' | 'A' | 'B' | 'D' — stored as setupType for later aggregation
 * @param {string} params.briefText - assembled brief markdown
 * @param {number|null} params.dailyStructureHigh - code-computed Last Daily High
 * @param {number|null} params.dailyStructureLow - code-computed Last Daily Low
 * @param {string} params.generatedAt - ISO timestamp
 * @returns {object|null}
 */
export function buildCallRecord({ instrument, session, bias, grade, briefText, dailyStructureHigh, dailyStructureLow, generatedAt }) {
  if (bias !== 'LONG' && bias !== 'SHORT') return null
  if (dailyStructureHigh == null || dailyStructureLow == null) return null
  if (Number.isNaN(dailyStructureHigh) || Number.isNaN(dailyStructureLow)) return null

  const decisionZone = parseDecisionZone(briefText)
  const primaryTarget = parsePrimaryTarget(briefText)
  const alternate = parseAlternate(briefText)
  const alternateDirection = bias === 'LONG' ? 'SHORT' : 'LONG'

  const id = `${instrument.replace(/[^A-Z0-9]/gi, '')}_${new Date(generatedAt).getTime()}`

  return {
    id,
    instrument,
    session,
    setupType: grade,
    createdAt: generatedAt,
    primaryBias: bias,
    decisionZone,
    primaryTarget,
    alternateDirection,
    alternateDetail: alternate?.detail ?? null,
    structureLevel: { dailyHigh: dailyStructureHigh, dailyLow: dailyStructureLow },
    status: 'OPEN',
    outcome: null,
  }
}

/**
 * Scores one open call record against the latest closed Daily candle. Uses
 * Daily close only — never intraday breaks. No fixed clock: a call stays
 * OPEN, however long that takes, until Daily price proves it right or wrong.
 *
 * WIN:  Daily close beyond the structure level in the thesis direction.
 * LOSS: Daily close beyond the structure level against the thesis (CHoCH
 *       against) — logged as "alternate confirmed".
 * Otherwise the record is returned unchanged (still OPEN).
 *
 * @param {object} record - a call record (from buildCallRecord() or previously stored)
 * @param {{datetime: string, close: number|string}} latestDailyCandle
 * @returns {object} the record, unchanged if still open or already resolved
 */
export function evaluateCallRecord(record, latestDailyCandle) {
  if (!record || record.status !== 'OPEN') return record
  if (!latestDailyCandle || latestDailyCandle.close == null) return record

  const close = parseFloat(latestDailyCandle.close)
  if (Number.isNaN(close)) return record

  const { dailyHigh, dailyLow } = record.structureLevel
  const { primaryBias } = record

  const winLevel = primaryBias === 'LONG' ? dailyHigh : dailyLow
  const lossLevel = primaryBias === 'LONG' ? dailyLow : dailyHigh
  const winBeyond = primaryBias === 'LONG' ? close > winLevel : close < winLevel
  const lossBeyond = primaryBias === 'LONG' ? close < lossLevel : close > lossLevel

  if (winBeyond) {
    return {
      ...record,
      status: 'WIN',
      outcome: {
        result: 'WIN',
        reason: `Daily close ${close} closed beyond the structure level (${winLevel}) in the thesis direction (${primaryBias}) — primary thesis validated.`,
        closedAt: new Date().toISOString(),
        closeDate: latestDailyCandle.datetime,
        closePrice: close,
      },
    }
  }

  if (lossBeyond) {
    return {
      ...record,
      status: 'LOSS',
      outcome: {
        result: 'LOSS',
        label: 'alternate confirmed',
        reason: `Daily close ${close} closed beyond the structure level (${lossLevel}) against the thesis (CHoCH against) — primary failed, alternate confirmed (${record.alternateDirection}).`,
        closedAt: new Date().toISOString(),
        closeDate: latestDailyCandle.datetime,
        closePrice: close,
      },
    }
  }

  return { ...record, status: 'OPEN' }
}

// ───────────────────────── I/O layer (Upstash Redis REST) ─────────────────────────

async function kvGetJson(kvUrl, kvToken, key) {
  try {
    const r = await fetch(`${kvUrl}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${kvToken}` },
    })
    if (!r.ok) return null
    const d = await r.json()
    if (d.result === null || d.result === undefined) return null
    return typeof d.result === 'string' ? JSON.parse(d.result) : d.result
  } catch (e) {
    return null
  }
}

async function kvSetJson(kvUrl, kvToken, key, value) {
  try {
    await fetch(`${kvUrl}/set/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${kvToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(value),
    })
  } catch (e) {
    // Redis write failure must not crash the caller.
  }
}

export { kvGetJson, kvSetJson }

/**
 * Returns the currently open call record for an instrument, or null.
 * Cheap: reads the small open-ids index, then each candidate record.
 */
export async function findOpenRecordForInstrument(kvUrl, kvToken, instrument) {
  const openIds = (await kvGetJson(kvUrl, kvToken, 'callrecord:open_ids')) ?? []
  for (const id of openIds) {
    const record = await kvGetJson(kvUrl, kvToken, `callrecord:${id}`)
    if (record && record.status === 'OPEN' && record.instrument === instrument) return record
  }
  return null
}

/**
 * Persists a newly opened call record and adds it to the open-record index.
 */
export async function storeCallRecord(kvUrl, kvToken, record) {
  await kvSetJson(kvUrl, kvToken, `callrecord:${record.id}`, record)
  const openIds = (await kvGetJson(kvUrl, kvToken, 'callrecord:open_ids')) ?? []
  if (!openIds.includes(record.id)) {
    openIds.unshift(record.id)
    await kvSetJson(kvUrl, kvToken, 'callrecord:open_ids', openIds)
  }
}

/**
 * Loads every open call record (for the scorer to evaluate each cycle).
 */
export async function loadOpenCallRecords(kvUrl, kvToken) {
  const openIds = (await kvGetJson(kvUrl, kvToken, 'callrecord:open_ids')) ?? []
  const records = []
  for (const id of openIds) {
    const record = await kvGetJson(kvUrl, kvToken, `callrecord:${id}`)
    if (record) records.push(record)
  }
  return records
}

/**
 * Persists a resolved (WIN/LOSS) record, moves its id out of the open index
 * into the closed index, and rolls the outcome into per-instrument,
 * per-setup-type aggregate hit-rate stats.
 */
export async function resolveCallRecord(kvUrl, kvToken, resolvedRecord) {
  await kvSetJson(kvUrl, kvToken, `callrecord:${resolvedRecord.id}`, resolvedRecord)

  const openIds = (await kvGetJson(kvUrl, kvToken, 'callrecord:open_ids')) ?? []
  const nextOpenIds = openIds.filter(id => id !== resolvedRecord.id)
  await kvSetJson(kvUrl, kvToken, 'callrecord:open_ids', nextOpenIds)

  const closedIds = (await kvGetJson(kvUrl, kvToken, 'callrecord:closed_ids')) ?? []
  if (!closedIds.includes(resolvedRecord.id)) {
    closedIds.unshift(resolvedRecord.id)
    await kvSetJson(kvUrl, kvToken, 'callrecord:closed_ids', closedIds)
  }

  const statsKey = `callrecord:stats:${resolvedRecord.instrument}:${resolvedRecord.setupType}`
  const stats = (await kvGetJson(kvUrl, kvToken, statsKey)) ?? { wins: 0, losses: 0 }
  if (resolvedRecord.status === 'WIN') stats.wins += 1
  else if (resolvedRecord.status === 'LOSS') stats.losses += 1
  await kvSetJson(kvUrl, kvToken, statsKey, stats)
}
