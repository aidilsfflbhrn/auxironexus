export const config = { maxDuration: 30 };

import { findOpenRecordForInstrument, kvGetJson } from './lib/track-record.js';
import { classifyDxyPillar, classifyUsdJpyPillar, classifyEdgeFinderPillar, checkEdgeFinderStaleness, updatePillarSnapshot } from './lib/pillars.js';

async function kvGet(baseUrl, token, key) {
  try {
    const r = await fetch(`${baseUrl}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!r.ok) return null;
    const d = await r.json();
    return d.result ?? null;
  } catch (e) {
    return null;
  }
}

async function kvSet(baseUrl, token, key, value, ttl) {
  try {
    const val = typeof value === 'object' ? JSON.stringify(value) : String(value);
    const url = ttl
      ? `${baseUrl}/set/${encodeURIComponent(key)}/${encodeURIComponent(val)}/ex/${ttl}`
      : `${baseUrl}/set/${encodeURIComponent(key)}/${encodeURIComponent(val)}`;
    await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (e) {
    // ignore — Redis write failure should not crash the agent
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' });

  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  if (!kvUrl || !kvToken) {
    return res.status(500).json({ error: 'Redis not configured' });
  }

  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('agent_timeout')), 25000)
  );

  try {
    const result = await Promise.race([runAgent(kvUrl, kvToken), timeout]);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(200).json({
      error: e.message,
      timestamp: new Date().toISOString()
    });
  }
}

async function runAgent(kvUrl, kvToken) {
  const tdKey = process.env.TWELVE_key;
  const gnewsKey = process.env.GNEWS_key;
  const anthropicKey = process.env.ANTHROPIC_key;

  // ── STEP 1: READ STATE FROM REDIS ─────────────────────────────
  const [
    lastGoldRaw, lastDxyRaw, lastVixRaw,
    lastCotDate, lastNewsHash,
    cooldownPrice, cooldownNews, cooldownCot,
    cotRetryCountRaw, latestAlertRaw
  ] = await Promise.all([
    kvGet(kvUrl, kvToken, 'agent:gold_price'),
    kvGet(kvUrl, kvToken, 'agent:dxy'),
    kvGet(kvUrl, kvToken, 'agent:vix'),
    kvGet(kvUrl, kvToken, 'agent:cot_date'),
    kvGet(kvUrl, kvToken, 'agent:news_hash'),
    kvGet(kvUrl, kvToken, 'agent:cooldown:price'),
    kvGet(kvUrl, kvToken, 'agent:cooldown:news'),
    kvGet(kvUrl, kvToken, 'agent:cooldown:cot'),
    kvGet(kvUrl, kvToken, 'agent:cot_retry_count'),
    kvGet(kvUrl, kvToken, 'agent:latest_alert'),
  ]);

  const lastGold = lastGoldRaw ? parseFloat(lastGoldRaw) : null;
  const lastDxy = lastDxyRaw ? parseFloat(lastDxyRaw) : null;
  const lastVix = lastVixRaw ? parseFloat(lastVixRaw) : null;
  const cotRetryCount = cotRetryCountRaw ? parseInt(cotRetryCountRaw) : 0;
  const now = Date.now();
  const isFirstRun = (lastGold === null);

  const priceCooldownActive = cooldownPrice && (now - parseInt(cooldownPrice)) < 1800000;
  const newsCooldownActive = cooldownNews && (now - parseInt(cooldownNews)) < 1200000;
  const cotCooldownActive = cooldownCot && (now - parseInt(cooldownCot)) < 21600000;

  let existingAlert = null;
  try { if (latestAlertRaw) existingAlert = JSON.parse(latestAlertRaw); } catch (e) {}

  // ── STEP 2: FETCH FRESH DATA IN PARALLEL ──────────────────────
  let currentGold = null, currentDxy = null, currentVix = null, currentUsdJpy = null;
  let cotDate = null, cotError = null;
  let newsHeadlines = [], newsHash = null, newsFetchError = null;

  const todayDay = new Date().getUTCDay(); // 0=Sun, 1=Mon, 5=Fri, 6=Sat

  const [pricesResult, cotResult, newsResult] = await Promise.allSettled([
    // A) Prices via TwelveData batch
    (async () => {
      if (!tdKey) return null;
      const syms = ['XAU/USD', 'DX', 'VIX', 'USD/JPY'];
      const url = `https://api.twelvedata.com/price?symbol=${encodeURIComponent(syms.join(','))}&apikey=${tdKey}`;
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 8000);
      try {
        const r = await fetch(url, { signal: ctrl.signal });
        clearTimeout(tid);
        if (!r.ok) throw new Error('TwelveData HTTP ' + r.status);
        return await r.json();
      } catch (e) {
        clearTimeout(tid);
        if (e.name === 'AbortError') return null;
        throw e;
      }
    })(),

    // B) COT via CFTC (Gold)
    (async () => {
      const url = 'https://publicreporting.cftc.gov/resource/jun7-fc8e.json' +
        '?$where=' + encodeURIComponent("market_and_exchange_names='GOLD - COMMODITY EXCHANGE INC.'") +
        '&$order=report_date_as_yyyy_mm_dd+DESC&$limit=1';
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 8000);
      try {
        const r = await fetch(url, { headers: { Accept: 'application/json' }, signal: ctrl.signal });
        clearTimeout(tid);
        if (!r.ok) throw new Error('CFTC HTTP ' + r.status);
        return await r.json();
      } catch (e) {
        clearTimeout(tid);
        if (e.name === 'AbortError') return null;
        throw e;
      }
    })(),

    // C) News via GNews
    (async () => {
      if (!gnewsKey) return null;
      const url = `https://gnews.io/api/v4/search?q=gold+forex+oil+market&lang=en&max=3&sortby=publishedAt&apikey=${gnewsKey}`;
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 8000);
      try {
        const r = await fetch(url, { signal: ctrl.signal });
        clearTimeout(tid);
        if (!r.ok) throw new Error('GNews HTTP ' + r.status);
        return await r.json();
      } catch (e) {
        clearTimeout(tid);
        if (e.name === 'AbortError') return null;
        throw e;
      }
    })(),
  ]);

  // Parse prices
  if (pricesResult.status === 'fulfilled' && pricesResult.value) {
    const d = pricesResult.value;
    if (d['XAU/USD']?.price) currentGold = parseFloat(d['XAU/USD'].price);
    if (d['DX']?.price) currentDxy = parseFloat(d['DX'].price);
    if (d['VIX']?.price) currentVix = parseFloat(d['VIX'].price);
    if (d['USD/JPY']?.price) currentUsdJpy = parseFloat(d['USD/JPY'].price);
  }

  // Parse COT
  if (cotResult.status === 'fulfilled' && Array.isArray(cotResult.value) && cotResult.value.length > 0) {
    cotDate = cotResult.value[0].report_date_as_yyyy_mm_dd || null;
  } else if (cotResult.status === 'rejected') {
    cotError = cotResult.reason?.message || 'COT fetch failed';
  }

  // Parse news
  if (newsResult.status === 'fulfilled' && newsResult.value?.articles) {
    newsHeadlines = newsResult.value.articles.slice(0, 3);
    const titles = newsHeadlines.map(a => a.title || '').join('|');
    newsHash = titles.split('').reduce((a, c) => a + c.charCodeAt(0), 0).toString();
  } else if (newsResult.status === 'rejected') {
    newsFetchError = newsResult.reason?.message || 'News fetch failed';
  }

  // ── STEP 3: CALCULATE DIFFS AND FLAGS ─────────────────────────
  const goldDiff = (currentGold !== null && lastGold !== null) ? Math.abs(currentGold - lastGold) : 0;
  const dxyDiff = (currentDxy !== null && lastDxy !== null) ? Math.abs(currentDxy - lastDxy) : 0;
  const vixPct = (lastVix && lastVix > 0 && currentVix !== null) ? ((currentVix - lastVix) / lastVix) * 100 : 0;

  let PRICE_ALERT = false;
  let NEWS_UPDATED = false;
  let COT_UPDATED = false;
  let COT_RETRY = false;

  if (!isFirstRun && !priceCooldownActive) {
    if (currentGold !== null && goldDiff > 8) PRICE_ALERT = true;
    if (currentDxy !== null && dxyDiff > 0.3) PRICE_ALERT = true;
    if (currentVix !== null && Math.abs(vixPct) > 10) PRICE_ALERT = true;
  }

  if (newsHash && newsHash !== lastNewsHash && !newsCooldownActive && !isFirstRun) {
    NEWS_UPDATED = true;
  }

  if (cotDate && cotDate !== lastCotDate && !cotCooldownActive && !isFirstRun) {
    COT_UPDATED = true;
  }

  if (!COT_UPDATED && (todayDay === 5 || todayDay === 6 || todayDay === 0 || todayDay === 1) && !cotCooldownActive) {
    COT_RETRY = true;
  }

  // ── STEP 4: AI TRIAGE ─────────────────────────────────────────
  let triage = null;
  let triageError = null;

  if ((PRICE_ALERT || NEWS_UPDATED || COT_UPDATED) && anthropicKey) {
    const newHeadlineStr = newsHeadlines.map((a, i) => `${i + 1}. ${a.title}`).join(' | ');
    const userContent = [
      PRICE_ALERT ? `Gold moved $${goldDiff.toFixed(1)}, DXY moved ${dxyDiff.toFixed(2)}, VIX change ${vixPct.toFixed(1)}%` : '',
      NEWS_UPDATED ? `New headlines: ${newHeadlineStr}` : '',
      COT_UPDATED ? `New COT report detected: ${cotDate}` : '',
    ].filter(Boolean).join('\n');

    try {
      const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5',
          max_tokens: 400,
          system: 'You are a real-time market triage AI for a professional Gold and FX trader based in Singapore. Analyse the market changes provided and decide if they warrant an immediate alert. Be direct and concise. Respond ONLY with valid JSON.',
          messages: [{
            role: 'user',
            content: `Market changes detected:\n${userContent}\n\nRespond with JSON only:\n{"severity":"CRITICAL or NOTABLE or IGNORE","reason":"1 sentence why","alert_title":"8 words max alert title","alert_body":"2 sentences max, specific numbers, what trader should do or watch","instruments":["list of affected instruments"],"direction":"BULLISH_GOLD or BEARISH_GOLD or NEUTRAL"}`,
          }],
        }),
      });

      const anthropicData = await anthropicRes.json();
      const text = (anthropicData.content || []).map(x => x.type === 'text' ? x.text : '').join('');
      const si = text.indexOf('{'), ei = text.lastIndexOf('}');
      if (si !== -1 && ei > si) {
        triage = JSON.parse(text.slice(si, ei + 1));
      }
    } catch (e) {
      triageError = 'triage_failed';
    }
  }

  // ── STEP 5: TAKE ACTION ───────────────────────────────────────
  let alerted = false;
  let alertStored = null;

  if (triage) {
    const alertObj = {
      severity: triage.severity || 'IGNORE',
      title: triage.alert_title || '',
      body: triage.alert_body || '',
      instruments: triage.instruments || [],
      direction: triage.direction || 'NEUTRAL',
      reason: triage.reason || '',
      timestamp: now,
    };

    if (triage.severity === 'CRITICAL') {
      await kvSet(kvUrl, kvToken, 'agent:latest_alert', alertObj, 7200);
      alertStored = alertObj;
      alerted = true;
    }

    if (triage.severity === 'CRITICAL' || triage.severity === 'NOTABLE') {
      try {
        const existingLog = await kvGet(kvUrl, kvToken, 'agent:alert_log');
        const log = existingLog ? JSON.parse(existingLog) : [];
        log.unshift(alertObj);
        if (log.length > 20) log.splice(20);
        await kvSet(kvUrl, kvToken, 'agent:alert_log', log, 604800);
      } catch (e) { /* ignore log write failure */ }

      if (PRICE_ALERT) await kvSet(kvUrl, kvToken, 'agent:cooldown:price', String(now), 1800);
      if (NEWS_UPDATED) await kvSet(kvUrl, kvToken, 'agent:cooldown:news', String(now), 1200);
      alerted = true;
    }
  }

  if (COT_UPDATED && cotDate) {
    await kvSet(kvUrl, kvToken, 'agent:cot_date', cotDate, 604800);
    await kvSet(kvUrl, kvToken, 'agent:cot_retry_count', '0', 604800);
    await kvSet(kvUrl, kvToken, 'agent:latest_cot_alert', { date: cotDate, timestamp: now }, 604800);
  }

  if (COT_RETRY) {
    const newCount = cotRetryCount + 1;
    await kvSet(kvUrl, kvToken, 'agent:cot_retry_count', String(newCount), 604800);
    await kvSet(kvUrl, kvToken, 'agent:cot_last_retry', String(now), 604800);
    if (newCount > 48) {
      await kvSet(kvUrl, kvToken, 'agent:cot_delayed', 'true', 172800);
    }
  }

  // ── STEP 6: UPDATE STATE ──────────────────────────────────────
  const stateWrites = [];
  if (currentGold !== null) stateWrites.push(kvSet(kvUrl, kvToken, 'agent:gold_price', String(currentGold), 3600));
  if (currentDxy !== null) stateWrites.push(kvSet(kvUrl, kvToken, 'agent:dxy', String(currentDxy), 3600));
  if (currentVix !== null) stateWrites.push(kvSet(kvUrl, kvToken, 'agent:vix', String(currentVix), 3600));
  if (newsHash) stateWrites.push(kvSet(kvUrl, kvToken, 'agent:news_hash', newsHash, 3600));
  stateWrites.push(kvSet(kvUrl, kvToken, 'agent:last_run', String(now), 600));
  await Promise.allSettled(stateWrites);

  // ── STEP 6.5: THESIS-PILLAR CHECK (fast pillars only) ──────────
  // DXY correlation and USD/JPY carry-risk are pure price ratios, so this
  // 5-min cycle is the right cadence for them. Rate/data expectation and
  // market structure only change at brief-generation cadence and are
  // refreshed there instead (api/brief-generate.js) — see api/lib/pillars.js
  // for the full division of labour. Skipped entirely if no thesis is open;
  // there is nothing to monitor pillars for otherwise.
  let pillarShifts = [];
  try {
    const openRecord = await findOpenRecordForInstrument(kvUrl, kvToken, 'XAU/USD');
    if (openRecord) {
      const snapshot = await kvGetJson(kvUrl, kvToken, 'pillars:XAU/USD:snapshot');
      const ref = snapshot?.referencePrices;
      const dxyChangePct = (ref?.dxy && currentDxy !== null) ? ((currentDxy - ref.dxy) / ref.dxy) * 100 : null;
      const usdJpyChangePct = (ref?.usdJpy && currentUsdJpy !== null) ? ((currentUsdJpy - ref.usdJpy) / ref.usdJpy) * 100 : null;

      const edgeFinderStored = await kvGetJson(kvUrl, kvToken, 'edgefinder:latest');
      const edgeFinderState = checkEdgeFinderStaleness(edgeFinderStored?.receivedAt ?? null, edgeFinderStored?.read ?? null);

      pillarShifts = await updatePillarSnapshot(kvUrl, kvToken, 'XAU/USD', {
        dxyCorrelation: classifyDxyPillar(dxyChangePct),
        usdJpyCarryRisk: classifyUsdJpyPillar(usdJpyChangePct),
        edgeFinderRead: classifyEdgeFinderPillar(edgeFinderState),
      });
    }
  } catch (e) {
    // Pillar check failure must not crash the agent cycle.
  }

  // ── STEP 7: RETURN ────────────────────────────────────────────
  return {
    timestamp: new Date().toISOString(),
    prices: { gold: currentGold, dxy: currentDxy, vix: currentVix, usdJpy: currentUsdJpy },
    flags: { PRICE_ALERT, NEWS_UPDATED, COT_UPDATED, COT_RETRY },
    diffs: { gold: goldDiff, dxy: dxyDiff, vixPct },
    action: {
      alerted,
      severity: triage?.severity || 'NONE',
      alert: alertStored,
      latest_alert: existingAlert,
      ...(triageError ? { error: triageError } : {}),
    },
    pillarShifts,
    ...(cotError ? { cot_error: cotError } : {}),
    ...(newsFetchError ? { news_error: newsFetchError } : {}),
  };
}
