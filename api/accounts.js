export const config = { maxDuration: 30 };

const PROV_BASE = "https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai";
const CLIENT_BASE = "https://mt-client-api-v1.agiliumtrade.agiliumtrade.ai";

async function kvGet(key) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  try {
    const r = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const d = await r.json();
    return d.result || null;
  } catch { return null; }
}

async function kvSet(key, value) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return;
  try {
    await fetch(`${url}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch {}
}

async function findOrCreateAccount(apiToken, login, password, server, displayName) {
  const headers = { "auth-token": apiToken, "Content-Type": "application/json" };

  // Search existing accounts for matching login + server
  try {
    const listRes = await fetch(`${PROV_BASE}/users/current/accounts?limit=100&offset=0`, { headers });
    if (listRes.ok) {
      const data = await listRes.json();
      const items = Array.isArray(data) ? data : (data.items || []);
      const found = items.find(a => String(a.login) === String(login) && a.server === server);
      if (found) return found._id || found.id;
    }
  } catch {}

  // Create new account
  const createRes = await fetch(`${PROV_BASE}/users/current/accounts`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      login: String(login),
      password,
      server,
      platform: "mt5",
      name: displayName,
      magic: 0,
      type: "cloud-g2"
    })
  });

  if (!createRes.ok) {
    const errText = await createRes.text().catch(() => "");
    throw new Error(`MetaAPI provisioning failed (${createRes.status}): ${errText.slice(0, 200)}`);
  }

  const created = await createRes.json();
  const id = created._id || created.id;
  if (!id) throw new Error("MetaAPI did not return an account ID");
  return id;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: true, message: "Method not allowed", account: "" });

  const account = req.query.account;
  if (!["exness", "fundednext"].includes(account)) {
    return res.status(400).json({ error: true, message: "account must be 'exness' or 'fundednext'", account: account || "" });
  }

  const METAAPI_KEY = process.env.METAAPI_key;
  if (!METAAPI_KEY) {
    return res.status(500).json({ error: true, message: "METAAPI_key not configured", account });
  }

  let login, password, server, displayName;
  if (account === "exness") {
    login = process.env.EXNESS_LOGIN;
    password = process.env.EXNESS_PASSWORD;
    server = process.env.EXNESS_SERVER || "Exness-MT5Real5";
    displayName = "Exness Live";
  } else {
    login = process.env.FUNDEDNEXT_LOGIN;
    password = process.env.FUNDEDNEXT_PASSWORD;
    server = process.env.FUNDEDNEXT_SERVER || "FundedNext-Server2";
    displayName = "FundedNext";
  }

  if (!login || !password) {
    return res.status(500).json({ error: true, message: `${displayName} credentials not configured`, account });
  }

  const headers = { "auth-token": METAAPI_KEY, "Content-Type": "application/json" };

  try {
    // Step 1: Resolve MetaAPI account ID (Redis-cached)
    const cacheKey = `metaapi_account_id_${account}`;
    let accountId = await kvGet(cacheKey);

    if (!accountId) {
      accountId = await findOrCreateAccount(METAAPI_KEY, login, password, server, displayName);
      await kvSet(cacheKey, accountId);
    }

    // Step 2: Check deployment state
    const statusRes = await fetch(`${PROV_BASE}/users/current/accounts/${accountId}`, { headers });
    if (!statusRes.ok) {
      // Account disappeared — clear cache so next call re-provisions
      await kvSet(cacheKey, "");
      return res.status(200).json({ error: true, message: "Account not found in MetaAPI — please retry", account });
    }
    const statusData = await statusRes.json();

    if (statusData.state !== "DEPLOYED") {
      const stateMsg = statusData.state === "DEPLOYING"
        ? "connecting to MT5 — please retry in 60 seconds"
        : `state: ${statusData.state} — please retry shortly`;
      return res.status(200).json({ error: true, message: `Account ${stateMsg}`, account, state: statusData.state });
    }

    // Step 3: Fetch account information
    const infoRes = await fetch(`${CLIENT_BASE}/users/current/accounts/${accountId}/account-information`, { headers });
    if (!infoRes.ok) {
      return res.status(200).json({ error: true, message: "Failed to read account data from MT5", account });
    }
    const info = await infoRes.json();

    // Step 4: Fetch open positions
    const posRes = await fetch(`${CLIENT_BASE}/users/current/accounts/${accountId}/positions`, { headers });
    const positions = posRes.ok ? (await posRes.json() || []) : [];
    const posArr = Array.isArray(positions) ? positions : [];

    // Step 5: Fetch today's closed deals (UTC midnight → now)
    const todayUTC = new Date();
    todayUTC.setUTCHours(0, 0, 0, 0);
    const histRes = await fetch(
      `${CLIENT_BASE}/users/current/accounts/${accountId}/history-deals/time/${todayUTC.toISOString()}/${new Date().toISOString()}`,
      { headers }
    );
    const history = histRes.ok ? (await histRes.json() || []) : [];
    const histArr = Array.isArray(history) ? history : [];

    // Format open trades
    const openTrades = posArr.map(p => ({
      ticket: Number(p.id) || 0,
      symbol: p.symbol || "",
      type: p.type === "POSITION_TYPE_BUY" ? "BUY" : "SELL",
      lots: p.volume || 0,
      openPrice: p.openPrice || 0,
      currentPrice: p.currentPrice || 0,
      sl: p.stopLoss || 0,
      tp: p.takeProfit || 0,
      profit: p.profit || 0,
      openTime: p.time || "",
      comment: p.comment || ""
    }));

    // Only closing deals carry realised P&L
    const closingDeals = histArr.filter(d => d.entryType === "DEAL_ENTRY_OUT" && d.symbol);
    const closedToday = closingDeals.map(d => ({
      ticket: Number(d.id) || 0,
      symbol: d.symbol || "",
      type: d.type === "DEAL_TYPE_BUY" ? "BUY" : "SELL",
      lots: d.volume || 0,
      openPrice: d.price || 0,
      closePrice: d.price || 0,
      profit: d.profit || 0,
      openTime: d.time || "",
      closeTime: d.time || ""
    }));

    const realisedPnl = closingDeals.reduce((s, d) => s + (d.profit || 0), 0);
    const floatingPnl = posArr.reduce((s, p) => s + (p.profit || 0), 0);
    const todayPnl = realisedPnl + floatingPnl;
    const approxStartBalance = (info.balance || 0) - realisedPnl;
    const todayPnlPercent = approxStartBalance > 0 ? (todayPnl / approxStartBalance) * 100 : 0;

    const result = {
      account,
      balance: info.balance || 0,
      equity: info.equity || 0,
      margin: info.margin || 0,
      freeMargin: info.freeMargin || 0,
      marginLevel: info.marginLevel || 0,
      currency: info.currency || "USD",
      openTrades,
      closedToday,
      todayPnl,
      todayPnlPercent
    };

    // FundedNext-only prop metrics
    if (account === "fundednext") {
      const startBal = parseFloat(process.env.FUNDEDNEXT_STARTING_BALANCE || "0") || (info.balance || 0);
      const dailyDdPct = parseFloat(process.env.FUNDEDNEXT_DAILY_DD_PCT || "0.05");
      const totalDdPct = parseFloat(process.env.FUNDEDNEXT_TOTAL_DD_PCT || "0.10");
      const profitTargetPct = parseFloat(process.env.FUNDEDNEXT_PROFIT_TARGET_PCT || "0.10");

      const dailyDdLimit = startBal * dailyDdPct;
      const totalDdLimit = startBal * totalDdPct;
      const profitTarget = startBal * profitTargetPct;
      const profitCurrent = (info.equity || 0) - startBal;
      const dailyDdUsed = Math.max(0, -(realisedPnl));
      const totalDdUsed = Math.max(0, startBal - (info.equity || 0));

      result.propMetrics = {
        startingBalance: startBal,
        dailyDrawdownLimit: dailyDdLimit,
        dailyDrawdownUsed: dailyDdUsed,
        dailyDrawdownRemaining: Math.max(0, dailyDdLimit - dailyDdUsed),
        totalDrawdownLimit: totalDdLimit,
        totalDrawdownUsed: totalDdUsed,
        totalDrawdownRemaining: Math.max(0, totalDdLimit - totalDdUsed),
        profitTarget,
        profitCurrent: Math.max(0, profitCurrent),
        profitProgress: profitTarget > 0 ? Math.max(0, Math.min(100, (profitCurrent / profitTarget) * 100)) : 0
      };
    }

    return res.status(200).json(result);
  } catch (e) {
    return res.status(200).json({ error: true, message: "Connection failed: " + e.message, account });
  }
}
