// Validation layer for all market data feeds.
// Every feed passes through here before reaching any AI call.
// INVALID and STALE values are logged and excluded — never passed downstream.
//
// Sentinel convention:
//   undefined  → feed was not requested for this session (not counted in totalCount)
//   null       → feed was requested but the fetch failed (counted as MISSING)
//   object     → data received; validate range + staleness

const PRICE_RANGES = {
  XAU:    { floor: 1000,  ceiling: 5500  },  // Gold $/oz
  DXY:    { floor: 70,    ceiling: 130   },  // Dollar index
  WTI:    { floor: 10,    ceiling: 250   },  // Oil $/bbl
  SPX:    { floor: 500,   ceiling: 7500  },  // S&P 500 index points
  NDX:    { floor: 1000,  ceiling: 30000 },
  DJI:    { floor: 5000,  ceiling: 60000 },
  DAX:    { floor: 2000,  ceiling: 25000 },
  FTSE:   { floor: 3000,  ceiling: 12000 },
  NI225:  { floor: 10000, ceiling: 60000 },
  VIX:    { floor: 5,     ceiling: 90    },
  SILVER: { floor: 5,     ceiling: 200   },  // Silver $/oz
  US10Y:  { floor: 0.01,  ceiling: 25    },  // % yield
  US02Y:  { floor: 0.01,  ceiling: 25    },
  US30Y:  { floor: 0.01,  ceiling: 25    },
  EURUSD: { floor: 0.80,  ceiling: 1.60  },
  GBPUSD: { floor: 1.00,  ceiling: 2.00  },
  USDJPY: { floor: 80,    ceiling: 200   },
  AUDUSD: { floor: 0.40,  ceiling: 1.20  },
  USDCAD: { floor: 0.80,  ceiling: 2.00  },
  USDCHF: { floor: 0.50,  ceiling: 1.50  },
  NZDUSD: { floor: 0.30,  ceiling: 1.00  },
}

// Max age per feed type before it is marked STALE
const STALE_WINDOWS_MS = {
  h4:     8  * 3600 * 1000,       // 8 h  (one H4 bar + buffer)
  m30:    2  * 3600 * 1000,       // 2 h  (four M30 bars + buffer)
  daily:  72 * 3600 * 1000,       // 3 d  (weekends accounted for)
  weekly: 9  * 24 * 3600 * 1000,  // 9 d
  cot:    9  * 24 * 3600 * 1000,  // 9 d  (Friday release + weekend)
  wgc:    35 * 24 * 3600 * 1000,  // 35 d (monthly)
  news:   24 * 3600 * 1000,       // 24 h
}

function inRange(instrument, rawValue) {
  const range = PRICE_RANGES[instrument]
  if (!range) return { ok: true }
  const v = parseFloat(rawValue)
  if (isNaN(v)) return { ok: false, reason: `non-numeric: ${rawValue}` }
  if (v < range.floor || v > range.ceiling) {
    return { ok: false, reason: `${v} outside plausible range [${range.floor}, ${range.ceiling}]` }
  }
  return { ok: true, value: v }
}

function notStale(datetimeStr, windowType) {
  if (!datetimeStr) return { ok: false, reason: 'no timestamp' }
  // TwelveData uses "YYYY-MM-DD HH:MM:SS"; ISO needs T separator
  const dt = new Date(String(datetimeStr).replace(' ', 'T'))
  if (isNaN(dt.getTime())) return { ok: false, reason: `unparseable timestamp: ${datetimeStr}` }
  const ageMs = Date.now() - dt.getTime()
  const windowMs = STALE_WINDOWS_MS[windowType]
  if (ageMs > windowMs) {
    const ageH = (ageMs / 3600000).toFixed(1)
    return { ok: false, reason: `${ageH}h old — window is ${windowMs / 3600000}h` }
  }
  return { ok: true }
}

function entry(status, rawValue = null, reason = null) {
  return { status, rawValue, reason }
}

function validatePriceSeries(instrument, values, windowType) {
  const close = values?.[0]?.close
  const datetime = values?.[0]?.datetime
  if (!close) return entry('MISSING')
  const range = inRange(instrument, close)
  if (!range.ok) {
    console.error(`[validate] ${instrument} INVALID — ${range.reason}`)
    return entry('INVALID', close, range.reason)
  }
  const stale = notStale(datetime, windowType)
  if (!stale.ok) {
    console.warn(`[validate] ${instrument} STALE — ${stale.reason}`)
    return entry('STALE', close, stale.reason)
  }
  return entry('VALID', range.value)
}

/**
 * Validates all data feeds before they reach any AI call.
 *
 * Callers must pass `undefined` (not null) for feeds that were not requested
 * this session. Pass `null` only when a feed was requested but the fetch failed.
 *
 * @param {object} feeds
 * @returns {{ manifest: object, validCount: number, totalCount: number }}
 *
 * manifest keys: xau_h4 | xau_daily | xau_weekly | dxy | wti | spx | cot | news | m30
 * Each value: { status: 'VALID'|'INVALID'|'STALE'|'MISSING', rawValue, reason }
 */
export function validateFeeds({
  h4Data,
  dailyData,
  weeklyData,
  dxyData,
  oilData,
  spxData,
  cotData,
  newsData,
  m30Data,
}) {
  const manifest = {}
  let validCount = 0
  let totalCount = 0

  // assess() registers one feed result. Skip entirely if undefined (not this session).
  function assess(key, feedResult) {
    if (feedResult === undefined) return
    totalCount++
    if (feedResult === null) {
      manifest[key] = entry('MISSING')
      return
    }
    manifest[key] = feedResult
    if (feedResult.status === 'VALID') validCount++
  }

  // Wrapper so null data (failed fetch) produces MISSING; undefined skips.
  function assessSeries(key, data, instrument, windowType) {
    if (data === undefined) { assess(key, undefined); return }
    if (data === null)      { assess(key, null);      return }
    assess(key, validatePriceSeries(instrument, data?.values, windowType))
  }

  assessSeries('xau_h4',    h4Data,     'XAU', 'h4')
  assessSeries('xau_daily', dailyData,  'XAU', 'daily')
  assessSeries('xau_weekly', weeklyData, 'XAU', 'weekly')
  assessSeries('dxy',       dxyData,    'DXY', 'daily')
  assessSeries('wti',       oilData,    'WTI', 'daily')
  assessSeries('spx',       spxData,    'SPX', 'daily')
  assessSeries('m30',       m30Data,    'XAU', 'm30')

  // COT — array of report objects; report_date_as_yyyy_mm_dd is the timestamp
  if (cotData !== undefined) {
    totalCount++
    const cotEntry = (Array.isArray(cotData) ? cotData[0] : null) ?? null
    const dateStr  = cotEntry?.report_date_as_yyyy_mm_dd ?? null
    if (!cotEntry || !dateStr) {
      manifest.cot = entry('MISSING')
    } else {
      const stale = notStale(dateStr, 'cot')
      if (!stale.ok) {
        console.warn(`[validate] cot STALE — ${stale.reason}`)
        manifest.cot = entry('STALE', dateStr, stale.reason)
      } else {
        manifest.cot = entry('VALID', dateStr)
        validCount++
      }
    }
  }

  // News — GNews articles array; publishedAt is the timestamp
  if (newsData !== undefined) {
    totalCount++
    const articles    = newsData?.articles ?? []
    const latest      = articles[0] ?? null
    const publishedAt = latest?.publishedAt ?? null
    if (!latest || !publishedAt) {
      manifest.news = entry('MISSING')
    } else {
      const stale = notStale(publishedAt, 'news')
      if (!stale.ok) {
        console.warn(`[validate] news STALE — ${stale.reason}`)
        manifest.news = entry('STALE', publishedAt, stale.reason)
      } else {
        manifest.news = entry('VALID', publishedAt)
        validCount++
      }
    }
  }

  return { manifest, validCount, totalCount }
}
