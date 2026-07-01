// Track-record scorer endpoint. Runs on a schedule (see vercel.json cron) and
// can also be hit on demand. Evaluates every OPEN call record against the
// latest Daily close for its instrument — Daily close only, never intraday.

export const config = { maxDuration: 30 }

import { evaluateCallRecord, loadOpenCallRecords, resolveCallRecord } from './lib/track-record.js'

async function fetchLatestDailyCandle(instrument, apiKey) {
  const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(instrument)}&interval=1day&outputsize=2&apikey=${apiKey}`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000)
  try {
    const r = await fetch(url, { signal: controller.signal })
    clearTimeout(timer)
    if (!r.ok) return null
    const data = await r.json()
    const values = data?.values ?? []
    return values[0] ?? null
  } catch (e) {
    clearTimeout(timer)
    return null
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const kvUrl = process.env.KV_REST_API_URL
  const kvToken = process.env.KV_REST_API_TOKEN
  const tdKey = process.env.TWELVE_key

  if (!kvUrl || !kvToken) {
    return res.status(500).json({ error: true, message: 'Redis not configured' })
  }

  try {
    const openRecords = await loadOpenCallRecords(kvUrl, kvToken)
    if (openRecords.length === 0) {
      return res.status(200).json({ scored: 0, resolved: [], stillOpen: [] })
    }

    // One Daily-candle fetch per distinct instrument, reused across all its open records.
    const instruments = [...new Set(openRecords.map(r => r.instrument))]
    const candleByInstrument = {}
    for (const instrument of instruments) {
      candleByInstrument[instrument] = tdKey ? await fetchLatestDailyCandle(instrument, tdKey) : null
    }

    const resolved = []
    const stillOpen = []

    for (const record of openRecords) {
      const candle = candleByInstrument[record.instrument]
      const updated = evaluateCallRecord(record, candle)
      if (updated.status === 'WIN' || updated.status === 'LOSS') {
        try {
          await resolveCallRecord(kvUrl, kvToken, updated)
        } catch (e) {
          // Redis write failure for this one record must not stop the rest of the batch.
        }
        resolved.push(updated)
      } else {
        stillOpen.push(updated)
      }
    }

    return res.status(200).json({
      scored: openRecords.length,
      resolved: resolved.map(r => ({ id: r.id, instrument: r.instrument, status: r.status, outcome: r.outcome })),
      stillOpen: stillOpen.map(r => ({ id: r.id, instrument: r.instrument, primaryBias: r.primaryBias })),
    })
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message })
  }
}
