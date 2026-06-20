export const config = { maxDuration: 120 }

const fetchWithTimeout = async (url, options = {}, timeoutMs = 8000) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    clearTimeout(timer)
    return res
  } catch (err) {
    clearTimeout(timer)
    if (err.name === 'AbortError') {
      console.log('Fetch timeout:', url)
      return null
    }
    throw err
  }
}

export default async function handler(req) {
  try {
    const urlParams = new URLSearchParams(req.url.split('?')[1] ?? '')
    const session = urlParams.get('session') ?? 'daily'

    const kvUrl = process.env.KV_REST_API_URL
    const kvToken = process.env.KV_REST_API_TOKEN

    if (!kvUrl || !kvToken) {
      return Response.json({
        error: true,
        message: 'Redis not configured — KV_REST_API_URL or KV_REST_API_TOKEN missing'
      }, { status: 500 })
    }

    // Fetch all data in parallel
    const safeJson = async (res) => {
      if (!res || !res.ok) return null
      try { return await res.json() } catch { return null }
    }

    const results = await Promise.all([
      fetchWithTimeout(`https://api.twelvedata.com/time_series?symbol=XAU%2FUSD&interval=4h&outputsize=100&apikey=${process.env.TWELVE_key}`),
      fetchWithTimeout(`https://api.twelvedata.com/time_series?symbol=XAU%2FUSD&interval=1day&outputsize=60&apikey=${process.env.TWELVE_key}`),
      fetchWithTimeout(`https://api.twelvedata.com/time_series?symbol=XAU%2FUSD&interval=1week&outputsize=52&apikey=${process.env.TWELVE_key}`),
      fetchWithTimeout(`https://api.twelvedata.com/time_series?symbol=DXY&interval=1day&outputsize=10&apikey=${process.env.TWELVE_key}`),
      fetchWithTimeout(`https://api.twelvedata.com/time_series?symbol=WTI%2FUSD&interval=1day&outputsize=10&apikey=${process.env.TWELVE_key}`),
      fetchWithTimeout(`https://api.twelvedata.com/time_series?symbol=SPX&interval=1day&outputsize=10&apikey=${process.env.TWELVE_key}`),
      fetchWithTimeout(`https://publicreporting.cftc.gov/resource/jun7-fc8e.json?$where=market_and_exchange_names=%27GOLD%20-%20COMMODITY%20EXCHANGE%20INC.%27&$order=report_date_as_yyyy_mm_dd%20DESC&$limit=2`),
      fetchWithTimeout(`https://gnews.io/api/v4/search?q=gold+OR+iran+OR+federal+reserve+OR+oil&lang=en&max=5&token=${process.env.GNEWS_key}`)
    ])

    const h4Data = await safeJson(results[0])
    const dailyData = await safeJson(results[1])
    const weeklyData = await safeJson(results[2])
    const dxyData = await safeJson(results[3])
    const oilData = await safeJson(results[4])
    const spxData = await safeJson(results[5])
    const cotData = await safeJson(results[6])
    const newsData = await safeJson(results[7])

    // Process data
    const h4Values = h4Data?.values ?? []
    const dailyValues = dailyData?.values ?? []
    const weeklyValues = weeklyData?.values ?? []
    const dxyValues = dxyData?.values ?? []
    const oilValues = oilData?.values ?? []
    const spxValues = spxData?.values ?? []

    const currentPrice = h4Values[0]?.close ?? 'unavailable'

    const last20H4 = h4Values.slice(0, 20).map(v =>
      `${v.datetime} O:${v.open} H:${v.high} L:${v.low} C:${v.close} V:${v.volume}`
    ).join('\n')

    const last20Daily = dailyValues.slice(0, 20).map(v =>
      `${v.datetime} O:${v.open} H:${v.high} L:${v.low} C:${v.close} V:${v.volume}`
    ).join('\n')

    const last10Weekly = weeklyValues.slice(0, 10).map(v =>
      `${v.datetime} O:${v.open} H:${v.high} L:${v.low} C:${v.close} V:${v.volume}`
    ).join('\n')

    const findSwingHighs = (values, count) => {
      const highs = []
      for (let i = 2; i < values.length - 2; i++) {
        if (values[i].high > values[i-1].high &&
            values[i].high > values[i-2].high &&
            values[i].high > values[i+1].high &&
            values[i].high > values[i+2].high) {
          highs.push(`${values[i].datetime}: ${values[i].high}`)
          if (highs.length >= count) break
        }
      }
      return highs
    }

    const findSwingLows = (values, count) => {
      const lows = []
      for (let i = 2; i < values.length - 2; i++) {
        if (values[i].low < values[i-1].low &&
            values[i].low < values[i-2].low &&
            values[i].low < values[i+1].low &&
            values[i].low < values[i+2].low) {
          lows.push(`${values[i].datetime}: ${values[i].low}`)
          if (lows.length >= count) break
        }
      }
      return lows
    }

    const h4SwingHighs = findSwingHighs(h4Values, 3)
    const h4SwingLows = findSwingLows(h4Values, 3)
    const dailySwingHighs = findSwingHighs(dailyValues, 3)
    const dailySwingLows = findSwingLows(dailyValues, 3)

    const recentVol = h4Values.slice(0, 10).reduce((s, v) => s + parseFloat(v.volume || 0), 0) / 10
    const avgVol = h4Values.slice(10, 50).reduce((s, v) => s + parseFloat(v.volume || 0), 0) / 40
    const volumeVsAvg = avgVol > 0 ? ((recentVol - avgVol) / avgVol * 100).toFixed(1) + '%' : 'unavailable'

    const lastDailyHigh = Math.max(...dailyValues.slice(0, 5).map(v => parseFloat(v.high))).toFixed(2)
    const lastDailyLow = Math.min(...dailyValues.slice(0, 5).map(v => parseFloat(v.low))).toFixed(2)
    const dailyBias = parseFloat(dailyValues[0]?.close) > parseFloat(dailyValues[4]?.close)
      ? 'Making HH/HL — BULLISH'
      : 'Making LH/LL — BEARISH'

    const lastWeeklyHigh = weeklyValues[0]?.high ?? 'unavailable'
    const lastWeeklyLow = weeklyValues[0]?.low ?? 'unavailable'
    const weeklyBias = parseFloat(weeklyValues[0]?.close) > parseFloat(weeklyValues[3]?.close)
      ? 'BULLISH'
      : 'BEARISH'

    const dxyCurrent = parseFloat(dxyValues[0]?.close ?? 0).toFixed(3)
    const dxyChange = dxyValues.length >= 10
      ? ((parseFloat(dxyValues[0].close) - parseFloat(dxyValues[9].close)) / parseFloat(dxyValues[9].close) * 100).toFixed(2)
      : 'unavailable'

    const oilCurrent = parseFloat(oilValues[0]?.close ?? 0).toFixed(2)
    const oilChange = oilValues.length >= 10
      ? ((parseFloat(oilValues[0].close) - parseFloat(oilValues[9].close)) / parseFloat(oilValues[9].close) * 100).toFixed(2)
      : 'unavailable'

    const spxCurrent = parseFloat(spxValues[0]?.close ?? 0).toFixed(2)
    const spxChange = spxValues.length >= 10
      ? ((parseFloat(spxValues[0].close) - parseFloat(spxValues[9].close)) / parseFloat(spxValues[9].close) * 100).toFixed(2)
      : 'unavailable'

    const goldChange = h4Values.length >= 10
      ? ((parseFloat(h4Values[0].close) - parseFloat(h4Values[9].close)) / parseFloat(h4Values[9].close) * 100).toFixed(2)
      : '0'
    const goldVsSpx = (parseFloat(goldChange) > 0 && parseFloat(spxChange) > 0)
      ? 'Both rising — possible risk-on correlation'
      : (parseFloat(goldChange) > 0 && parseFloat(spxChange) < 0)
      ? 'Gold up, SPX down — safe haven / risk-off bid'
      : (parseFloat(goldChange) < 0 && parseFloat(spxChange) > 0)
      ? 'Gold down, SPX up — risk-on, Gold as hedge unwinding'
      : 'Both declining — broad risk-off or liquidation'

    const cotCurrent = cotData?.[0] ?? null
    const cotPrev = cotData?.[1] ?? null
    const smNet = cotCurrent
      ? parseInt(cotCurrent.noncomm_positions_long_all || 0) - parseInt(cotCurrent.noncomm_positions_short_all || 0)
      : null
    const smNetPrev = cotPrev
      ? parseInt(cotPrev.noncomm_positions_long_all || 0) - parseInt(cotPrev.noncomm_positions_short_all || 0)
      : null
    const smChange = smNet !== null && smNetPrev !== null ? smNet - smNetPrev : null
    const smStance = smNet !== null ? (smNet > 0 ? 'NET LONG' : 'NET SHORT') : 'unavailable'
    const smNetStr = smNet !== null ? (smNet > 0 ? '+' : '') + smNet.toLocaleString() + ' contracts' : 'unavailable'
    const smChangeStr = smChange !== null ? (smChange > 0 ? '+' : '') + smChange.toLocaleString() + ' contracts vs last week' : 'unavailable'

    const headlines = newsData?.articles
      ? newsData.articles.map((a, i) =>
          `${i+1}. ${a.title} — ${a.source?.name ?? 'Unknown'} — ${a.publishedAt}`
        ).join('\n')
      : 'Headlines unavailable'

    const sgtTime = new Date().toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })
    const isMonday = session === 'monday'

    // Build prompts
    const systemPrompt = `You are Auxiron, a senior institutional macro trader and technical analyst specialising in Gold (XAU/USD). You have deep expertise in Supply and Demand zone analysis, Smart Money Concepts (SMC), and macro-driven swing trading. You think like a prop firm trader — disciplined, data-driven, and focused only on high-probability A+ setups. You never give generic analysis. Every output is specific, actionable, and tied directly to the data provided. You use professional trader terminology naturally mixed with clear English so the report is both precise and easy to act on. You do NOT use Fair Value Gaps (FVG) in your analysis. You DO use: Supply and Demand zones, Order Blocks, Break of Structure (BOS), Change of Character (CHoCH), liquidity sweeps, market structure highs and lows, and volume confirmation. The trader you are writing for is a Gold macro swing trader based in Singapore who trades the NY session. They hold positions for 20+ days. They use H4 Supply and Demand zones for entries, Daily and Weekly structure for bias, and H1/M15 for confirmation. They do NOT use FVG. They care about: regime, volume, market structure, zone quality, and news credibility. They want a clear actionable verdict — not generic commentary.`

    const userPrompt = `Generate a complete Auxiron Brief for ${isMonday ? 'Monday Extended' : 'Daily NY'} session.
Current SGT time: ${sgtTime}

PRICE DATA:
XAU/USD current price: ${currentPrice}

H4 CANDLE DATA (last 20 bars, newest first):
${last20H4}

DAILY CANDLE DATA (last 20 bars):
${last20Daily}

WEEKLY CANDLE DATA (last 10 bars):
${last10Weekly}

H4 SWING POINTS:
Recent highs: ${h4SwingHighs.join(' | ')}
Recent lows: ${h4SwingLows.join(' | ')}

DAILY SWING POINTS:
Recent highs: ${dailySwingHighs.join(' | ')}
Recent lows: ${dailySwingLows.join(' | ')}

DAILY STRUCTURE:
Bias: ${dailyBias}
Last daily high: ${lastDailyHigh}
Last daily low: ${lastDailyLow}

WEEKLY STRUCTURE:
Bias: ${weeklyBias}
Last weekly high: ${lastWeeklyHigh}
Last weekly low: ${lastWeeklyLow}

VOLUME:
H4 current vs 40-bar average: ${volumeVsAvg}

CORRELATED ASSETS:
DXY: ${dxyCurrent}, 10-day change: ${dxyChange}%
WTI Oil: ${oilCurrent}, 10-day change: ${oilChange}%
SPX: ${spxCurrent}, 10-day change: ${spxChange}%
Gold vs SPX relationship: ${goldVsSpx}

COT POSITIONING:
Smart Money net: ${smNetStr}
${smChangeStr}
Stance: ${smStance}

LATEST HEADLINES:
${headlines}

${isMonday ? 'This is a Monday Extended brief. Include weekend geopolitical developments, progression since Friday close, and a full week-ahead outlook covering all high-impact events.' : ''}

Generate the brief using EXACTLY this structure with these exact section headers:

## WHAT IS DRIVING GOLD RIGHT NOW
[One clear paragraph — the single dominant driver today. A verdict with reasoning from the data. Not a list.]

## ACTIVE REGIME
DOMINANT REGIME: [Geopolitical Premium / Inflation / Risk Asset Correlation / Safe Haven / Mixed]
SECONDARY REGIME: [if applicable, otherwise write None]
REGIME CONFIDENCE: [HIGH / MEDIUM / LOW]
[One paragraph explaining which regime is winning and what it means for the trading bias today]

## MACRO ALIGNMENT
DXY: [current reading + 10-day direction] → [SUPPORTS / CONFLICTS Gold long — one sentence why]
Oil (WTI): [current reading + 10-day direction] → [SUPPORTS / CONFLICTS via geo premium — one sentence why]
SPX: [current reading + direction] → [moving WITH Gold / AGAINST Gold — note if SPX-Gold correlation is breaking or holding]
COT Smart Money: [net position + weekly change] → [SUPPORTS / NEUTRAL / CONFLICTS — one sentence why]
MACRO SCORE: [X]/4 factors aligned for [LONG / SHORT]

## NEWS AND CREDIBILITY CHECK
Headline: [most relevant headline from the data]
Credibility: [HIGH / MEDIUM / LOW] — [one sentence explaining why]
Market reaction: [how has price reacted to this headline — rising, falling, muted]
Verdict: [Is this structural and tradeable, or noise that will fade in 24-48 hours? Does it change the bias?]

## MARKET STRUCTURE
Weekly bias: [BULLISH / BEARISH / RANGING] — [note last weekly BOS or CHoCH if visible]
Daily bias: [BULLISH / BEARISH / RANGING] — [note last daily BOS or CHoCH if visible]
H4 bias: [BULLISH / BEARISH / RANGING] — [current H4 structure read]
Key structural levels:
- Last Weekly High: [price]
- Last Weekly Low: [price]
- Last Daily High: [price]
- Last Daily Low: [price]
Structure verdict: [Is the trend intact and clean, or showing CHoCH risk that warrants caution?]

## KEY ZONES — H4
DEMAND ZONES (potential long entries):
Zone 1: [specific price range e.g. 3,180 - 3,195] — [FRESH / TESTED] — [why this zone is significant — what caused it]
Zone 2: [specific price range] — [FRESH / TESTED] — [why significant]
SUPPLY ZONES (potential short entries or long exits):
Zone 1: [specific price range] — [FRESH / TESTED] — [why significant]
Zone 2: [specific price range] — [FRESH / TESTED] — [why significant]
BULLISH ORDER BLOCK: [specific price range] — [UNMITIGATED / MITIGATED]
BEARISH ORDER BLOCK: [specific price range] — [UNMITIGATED / MITIGATED]
LIQUIDITY:
Buy-side liquidity above: [price level — what created it e.g. equal highs at X]
Sell-side liquidity below: [price level — what created it e.g. equal lows at X]

## VOLUME READING
H4 volume vs 40-bar average: [X% above / below average]
Volume verdict: [CONFIRMING institutional participation / LOW CONVICTION — wait for volume expansion / SUSPICIOUS — price moving without volume backing]
[One sentence on what the volume tells you about the conviction behind the current move]

## INTRADAY LEVELS
Current price: [X]
Immediate resistance: [price] — [why this level matters]
Immediate support: [price] — [why this level matters]
NY open watch: [specific price action or level to watch in the first 30 minutes of NY session — what a break above or below means]

## SWING OUTLOOK
Daily (next 1-5 days): [directional bias + key level that confirms or denies the move]
Weekly (next 1-4 weeks): [directional bias + target price if bias is confirmed]
Monthly (next 1-3 months): [structural bias based on current macro regime]
Quarter (3-6 months): [macro-driven structural view — where is Gold heading if regime continues]
Year-end 2026: [if current regime and trajectory continues, projected Gold range by December 2026]

## SETUP VERDICT
BIAS: [LONG / SHORT / STAND ASIDE]
GRADE: [A+ / A / B / NO TRADE]
CONFIDENCE: [HIGH / MEDIUM / LOW]
Entry zone: [specific H4 demand or supply zone price range]
LTF confirmation to wait for: [specific H1 or M15 price action signal that confirms entry — e.g. bullish engulfing on H1 reacting to zone, or BOS on M15]
Stop loss zone: [last structural low for longs / last structural high for shorts — specific price]
Target: [last HTF high or low or key S&R — specific price]
Wait for: [the one specific condition that must be met before entering]
Stand aside if: [the one specific thing that would invalidate this entire setup]

## WHAT WOULD CHANGE THIS VIEW
1. [Specific bearish scenario — event or price level that flips bias from bullish to bearish]
2. [Specific bullish confirmation — event or price level that confirms full bullish continuation]
3. [Regime change scenario — geopolitical or macro development that changes the entire regime]`

    // Call Anthropic
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      })
    })

    const anthropicData = await anthropicRes.json()
    const briefContent = anthropicData.content?.[0]?.text ?? 'Brief generation failed'

    const generatedAt = new Date().toISOString()

    // Store in Upstash Redis
    try {
      await fetch(`${kvUrl}/set/brief:${session}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${kvToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: briefContent,
          generatedAt: new Date().toISOString(),
          session,
          goldPrice: currentPrice
        })
      })
      await fetch(`${kvUrl}/expire/brief:${session}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${kvToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(28800)
      })
    } catch (storeError) {
      console.log('Cache store failed:', storeError.message)
    }

    return Response.json({ ok: true, session, generatedAt })

  } catch (error) {
    return Response.json({ error: true, message: error.message }, { status: 500 })
  }
}
