// Thesis-pillar monitor. When a swing thesis is open, five pillars are
// tracked: (a) rate/data expectation, (b) market structure, (c) DXY
// correlation, (d) USD/JPY carry-risk, (e) EdgeFinder read. Each cycle a new
// snapshot is classified and diffed against the last stored one; a changed
// classification (not a raw price wiggle) is what fires an alert.
//
// Classification, diff, and alert-text functions below are pure — no I/O.
// They are tested against a full assembled brief document for the two
// parsers (parseDominantRegime / parseRegimeConfidence), per the same
// full-document rule as track-record.js.
//
// Division of labour (see brief-generate.js and agent.js):
//  - rateExpectation + marketStructure only change at brief-generation cadence
//    (they come from the AI thesis text / Daily-Weekly bias computed there),
//    so they are refreshed there.
//  - dxyCorrelation + usdJpyCarryRisk are pure price-derived ratios and are
//    refreshed every 5-minute agent.js cycle.
//  - edgeFinderRead is a timestamp check, refreshed wherever it's convenient
//    since it costs no fetch.
// All five live in one merged snapshot per instrument so a single diff pass
// catches whichever pillar changed most recently.

const EPSILON_PCT = 0.15 // same noise floor as factor-scorecard.js — a 5-min or
                          // since-thesis-open move smaller than this is not a signal.

export const PILLAR_LABELS = {
  rateExpectation: 'Rate/Data Expectation',
  marketStructure: 'Market Structure',
  dxyCorrelation: 'DXY Correlation',
  usdJpyCarryRisk: 'USD/JPY Carry-Risk',
  edgeFinderRead: 'EdgeFinder Read',
}

/**
 * @param {number|null} changePct - % change since thesis-open reference price
 * @returns {'CONFIRMS-LONG'|'CONFIRMS-SHORT'|'CONFLICTS'|'ABSENT'}
 */
export function classifyDxyPillar(changePct) {
  if (changePct === null || changePct === undefined || Number.isNaN(changePct)) return 'ABSENT'
  // Dollar strength is inverse to gold: DXY rising confirms short, falling confirms long.
  if (changePct > EPSILON_PCT) return 'CONFIRMS-SHORT'
  if (changePct < -EPSILON_PCT) return 'CONFIRMS-LONG'
  return 'CONFLICTS'
}

/**
 * @param {number|null} changePct - % change since thesis-open reference price
 * @returns {'CONFIRMS-LONG'|'CONFIRMS-SHORT'|'CONFLICTS'|'ABSENT'}
 */
export function classifyUsdJpyPillar(changePct) {
  if (changePct === null || changePct === undefined || Number.isNaN(changePct)) return 'ABSENT'
  // Rising USD/JPY = carry trade attractive = risk-on = historical headwind for gold (short-confirming).
  // Falling USD/JPY = carry unwind = risk-off = historical tailwind for gold (long-confirming).
  if (changePct > EPSILON_PCT) return 'CONFIRMS-SHORT'
  if (changePct < -EPSILON_PCT) return 'CONFIRMS-LONG'
  return 'CONFLICTS'
}

/**
 * @param {string|null} dailyBias - e.g. 'BULLISH' | 'BEARISH'
 * @param {string|null} weeklyBias
 * @returns {string}
 */
export function classifyStructurePillar(dailyBias, weeklyBias) {
  if (!dailyBias) return 'ABSENT'
  return weeklyBias ? `DAILY ${dailyBias} / WEEKLY ${weeklyBias}` : `DAILY ${dailyBias}`
}

/**
 * @param {string|null} dominantRegime
 * @param {string|null} regimeConfidence
 * @returns {string}
 */
export function classifyRateExpectationPillar(dominantRegime, regimeConfidence) {
  if (!dominantRegime) return 'ABSENT'
  return regimeConfidence ? `${dominantRegime} (${regimeConfidence})` : dominantRegime
}

/**
 * Reads EdgeFinder's stored staleness state into a display classification.
 * Never treats an aged read as live confirmation — the age is always shown.
 * @param {{status: 'FRESH'|'STALE'|'MISSING', ageDays: number|null, read: string|null}|null} edgeFinderState
 * @returns {string}
 */
export function classifyEdgeFinderPillar(edgeFinderState) {
  if (!edgeFinderState || edgeFinderState.status === 'MISSING') return 'ABSENT'
  const ageLabel = edgeFinderState.ageDays !== null ? `${edgeFinderState.ageDays}d old` : 'age unknown'
  const readLabel = edgeFinderState.read ?? 'no read stored'
  return `${edgeFinderState.status} (${ageLabel}) — ${readLabel}`
}

/**
 * Builds/updates a merged 5-pillar snapshot. Any field left undefined in
 * `updates` keeps its previous value from `previous` (or ABSENT if there is
 * no previous snapshot) — this is what lets agent.js update only the fast
 * pillars and brief-generate.js update only the slow ones without clobbering
 * each other.
 * @param {object|null} previous - last stored snapshot, or null
 * @param {object} updates - any subset of the 5 pillar keys
 * @returns {object} full merged snapshot
 */
export function mergePillarSnapshot(previous, updates) {
  const base = previous ?? {
    rateExpectation: 'ABSENT',
    marketStructure: 'ABSENT',
    dxyCorrelation: 'ABSENT',
    usdJpyCarryRisk: 'ABSENT',
    edgeFinderRead: 'ABSENT',
  }
  return { ...base, ...updates }
}

/**
 * Diffs two pillar snapshots. A pillar is only reported as "shifted" when
 * both the old and new classifications are known (ABSENT on either side is
 * a data gap, not a confirmed shift, so it is skipped).
 * @param {object|null} oldSnapshot
 * @param {object} newSnapshot
 * @returns {Array<{pillar: string, label: string, oldState: string, newState: string}>}
 */
export function diffPillars(oldSnapshot, newSnapshot) {
  if (!oldSnapshot) return []
  const shifts = []
  for (const key of Object.keys(PILLAR_LABELS)) {
    const oldState = oldSnapshot[key]
    const newState = newSnapshot[key]
    if (oldState === undefined || newState === undefined) continue
    if (oldState === 'ABSENT' || newState === 'ABSENT') continue
    if (oldState !== newState) {
      shifts.push({ pillar: key, label: PILLAR_LABELS[key], oldState, newState })
    }
  }
  return shifts
}

/**
 * Renders one "## THESIS PILLAR ALERT" block per shifted pillar. Deliberately
 * does NOT say "exit" and does NOT claim to distinguish reversal from
 * pullback — it flags that an input changed, nothing more.
 * @param {Array<{label:string, oldState:string, newState:string}>} shifts
 * @param {string} instrument
 * @param {'LONG'|'SHORT'} direction
 * @returns {string|null}
 */
export function buildPillarAlertBlock(shifts, instrument, direction) {
  if (!shifts || shifts.length === 0) return null
  return shifts
    .map(s =>
      `## THESIS PILLAR ALERT\n` +
      `PILLAR CHANGED: ${s.label}\n` +
      `PREVIOUS STATE: ${s.oldState}\n` +
      `CURRENT STATE: ${s.newState}\n` +
      `This pillar supported your open ${instrument} ${direction}. Re-examine — this may be a sentiment shift, not a pullback.`
    )
    .join('\n\n')
}

/**
 * Extracts "DOMINANT REGIME: ..." from the "## ACTIVE REGIME" section.
 * @param {string} briefText - full assembled/thesis brief markdown
 * @returns {string|null}
 */
export function parseDominantRegime(briefText) {
  const match = briefText.match(/^DOMINANT REGIME:\s*(.+)$/m)
  if (!match) return null
  const value = match[1].trim()
  return value ? value : null
}

/**
 * Extracts "REGIME CONFIDENCE: ..." from the "## ACTIVE REGIME" section.
 * @param {string} briefText
 * @returns {string|null}
 */
export function parseRegimeConfidence(briefText) {
  const match = briefText.match(/^REGIME CONFIDENCE:\s*(.+)$/m)
  if (!match) return null
  const value = match[1].trim()
  return value ? value : null
}

// ───────────────────────── EdgeFinder staleness ─────────────────────────
// Passes through the same STALE_WINDOWS_MS machinery every other feed uses
// (validate-feeds.js) rather than inventing a separate rule for this one input.

import { notStale } from './validate-feeds.js'
import { kvGetJson, kvSetJson } from './track-record.js'

// ───────────────────────── I/O layer (Upstash Redis REST) ─────────────────────────
// Snapshot keyed per instrument; reference prices are captured once when a
// thesis opens and held fixed until it closes, so "shift" always means
// "moved materially since this thesis was opened" — not 5-minute noise.

const snapshotKey = instrument => `pillars:${instrument}:snapshot`
const pendingKey = instrument => `pillars:${instrument}:pending_alerts`

/** @returns {object|null} the stored snapshot for an instrument, or null */
export async function loadPillarSnapshot(kvUrl, kvToken, instrument) {
  return kvGetJson(kvUrl, kvToken, snapshotKey(instrument))
}

/**
 * Applies `updates` on top of the stored snapshot, diffs against the
 * pre-update snapshot, stores the merged result, and appends any shifts to
 * the pending-alerts queue (read and cleared by brief-generate.js). Skips
 * diffing (but still stores) when there was no previous snapshot — opening a
 * thesis establishes a baseline, it does not fire an alert against itself.
 * @returns {Array} the shifts detected this call, if any
 */
export async function updatePillarSnapshot(kvUrl, kvToken, instrument, updates) {
  const previous = await loadPillarSnapshot(kvUrl, kvToken, instrument)
  const merged = mergePillarSnapshot(previous, updates)
  await kvSetJson(kvUrl, kvToken, snapshotKey(instrument), merged)

  if (!previous) return []
  const shifts = diffPillars(previous, merged)
  if (shifts.length > 0) {
    const pending = (await kvGetJson(kvUrl, kvToken, pendingKey(instrument))) ?? []
    await kvSetJson(kvUrl, kvToken, pendingKey(instrument), pending.concat(shifts))
  }
  return shifts
}

/** Replaces the snapshot outright — used when a new thesis opens (new reference prices). */
export async function resetPillarSnapshot(kvUrl, kvToken, instrument, snapshot) {
  await kvSetJson(kvUrl, kvToken, snapshotKey(instrument), snapshot)
  await kvSetJson(kvUrl, kvToken, pendingKey(instrument), [])
}

/** Reads and clears the pending-alert queue — called once per brief render. */
export async function consumePendingPillarAlerts(kvUrl, kvToken, instrument) {
  const pending = (await kvGetJson(kvUrl, kvToken, pendingKey(instrument))) ?? []
  if (pending.length > 0) await kvSetJson(kvUrl, kvToken, pendingKey(instrument), [])
  return pending
}

/**
 * @param {string|null} receivedAt - ISO timestamp of when the weekly EdgeFinder
 *   screenshot read was ingested (Sunday, in normal use)
 * @param {string|null} read - the stored summary text, if any
 * @returns {{status: 'FRESH'|'STALE'|'MISSING', ageDays: number|null, read: string|null}}
 */
export function checkEdgeFinderStaleness(receivedAt, read) {
  if (!receivedAt) return { status: 'MISSING', ageDays: null, read: read ?? null }
  const receivedMs = new Date(String(receivedAt).replace(' ', 'T')).getTime()
  if (Number.isNaN(receivedMs)) return { status: 'MISSING', ageDays: null, read: read ?? null }
  const ageDays = Number(((Date.now() - receivedMs) / (24 * 3600 * 1000)).toFixed(1))
  const stale = notStale(receivedAt, 'edgefinder')
  return { status: stale.ok ? 'FRESH' : 'STALE', ageDays, read: read ?? null }
}
