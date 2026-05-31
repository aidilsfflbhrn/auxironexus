// Daily Anthropic API spend tracker — localStorage-backed, SGT timezone (UTC+8)
const DAILY_LIMIT = 0.50;
const SOFT_WARN   = 0.40;
const LS_PREFIX   = "auxiron_budget_";

const PRICING: Record<string, {inp:number; out:number}> = {
  "claude-haiku-4-5":          {inp:0.80, out:4.00},
  "claude-haiku-4-5-20251001": {inp:0.80, out:4.00},
  "claude-sonnet-4-6":         {inp:3.00, out:15.00},
};

function sgtDateKey(): string {
  const d = new Date(Date.now() + 8*3600*1000);
  return LS_PREFIX + d.toISOString().slice(0,10);
}

function load(): {spent:number; features:Record<string,number>} {
  try {
    const raw = localStorage.getItem(sgtDateKey());
    if (raw) return JSON.parse(raw);
  } catch {}
  return {spent:0, features:{}};
}

function save(data: {spent:number; features:Record<string,number>}) {
  try { localStorage.setItem(sgtDateKey(), JSON.stringify(data)); } catch {}
}

export function canSpend(): boolean {
  return load().spent < DAILY_LIMIT;
}

export function recordSpend(feature:string, model:string, inTok:number, outTok:number) {
  const p = PRICING[model] ?? PRICING["claude-sonnet-4-6"];
  const cost = (inTok/1e6)*p.inp + (outTok/1e6)*p.out;
  const d = load();
  d.spent = (d.spent||0) + cost;
  d.features[feature] = (d.features[feature]||0) + cost;
  save(d);
  if (d.spent >= SOFT_WARN && d.spent < DAILY_LIMIT)
    console.warn(`[Budget] Soft limit reached: $${d.spent.toFixed(4)} / $${DAILY_LIMIT}`);
}

export function getBudgetStatus() {
  const d = load();
  const spent = d.spent || 0;
  return {
    spent,
    limit:      DAILY_LIMIT,
    remaining:  Math.max(0, DAILY_LIMIT - spent),
    percentage: Math.min(100, (spent / DAILY_LIMIT)*100),
    features:   d.features || {},
    isHit:      spent >= DAILY_LIMIT,
    isSoftWarn: spent >= SOFT_WARN,
  };
}
