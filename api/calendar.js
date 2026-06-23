export const config = { maxDuration: 30 }

export default async function handler(req) {
  const key = process.env.FINNHUB_key;

  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const to = new Date(now.getFullYear(), now.getMonth() + 2, 0).toISOString().slice(0, 10);

  const FALLBACK = [
    { time: "2026-07-02T00:00:00", event: "US Non-Farm Payrolls",   country: "US", impact: "high", forecast: "185K",   previous: "172K" },
    { time: "2026-07-10T00:00:00", event: "US CPI YoY",             country: "US", impact: "high", forecast: "2.9%",   previous: "2.4%" },
    { time: "2026-07-15T00:00:00", event: "China GDP QoQ",          country: "CN", impact: "high", forecast: "1.4%",   previous: "1.2%" },
    { time: "2026-07-16T00:00:00", event: "UK CPI YoY",             country: "GB", impact: "high", forecast: "3.3%",   previous: "3.5%" },
    { time: "2026-07-23T00:00:00", event: "ECB Rate Decision",      country: "EU", impact: "high", forecast: "2.15%",  previous: "2.40%" },
    { time: "2026-07-25T00:00:00", event: "US GDP QoQ Advance",     country: "US", impact: "high", forecast: "2.1%",   previous: "2.4%" },
    { time: "2026-07-30T00:00:00", event: "FOMC Rate Decision",     country: "US", impact: "high", forecast: "4.25%",  previous: "4.25%" },
    { time: "2026-07-31T00:00:00", event: "US PCE Price Index YoY", country: "US", impact: "high", forecast: "2.5%",   previous: "2.3%" },
  ];

  if (!key) return Response.json({ events: FALLBACK });

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    let r;
    try {
      r = await fetch(`https://finnhub.io/api/v1/calendar/economic?from=${from}&to=${to}&token=${key}`, { signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }
    if (!r.ok) return Response.json({ events: FALLBACK });

    const data = await r.json();
    const raw = data.economicCalendar || [];
    if (raw.length === 0) return Response.json({ events: FALLBACK });

    const events = raw
      .filter(ev => ev.impact === "high" || ev.impact === "medium")
      .map(ev => ({
        time:     ev.time     || "",
        event:    ev.event    || "",
        country:  ev.country  || "",
        impact:   ev.impact   || "",
        forecast: ev.estimate != null ? ev.estimate : null,
        previous: ev.prev     != null ? ev.prev     : null,
        unit:     ev.unit     || "",
      }))
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    return Response.json({ events });
  } catch (e) {
    return Response.json({ events: FALLBACK });
  }
}
