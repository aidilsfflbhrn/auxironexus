export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ events: [] });

  const key = process.env.FINNHUB_key;
  if (!key) return res.status(200).json({ events: [] });

  try {
    const from = new Date().toISOString().slice(0, 10);
    const to = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const url = `https://finnhub.io/api/v1/calendar/economic?from=${from}&to=${to}&token=${key}`;

    const r = await fetch(url);
    if (!r.ok) return res.status(200).json({ events: [] });

    const data = await r.json();
    const raw = data.economicCalendar || [];

    const events = raw
      .filter(function(ev) { return ev.impact === "high" || ev.impact === "medium"; })
      .map(function(ev) {
        return {
          time: ev.time || "",
          event: ev.event || "",
          country: ev.country || "",
          impact: ev.impact || "",
          forecast: ev.estimate != null ? ev.estimate : null,
          previous: ev.prev != null ? ev.prev : null,
          unit: ev.unit || "",
        };
      })
      .sort(function(a, b) { return new Date(a.time).getTime() - new Date(b.time).getTime(); });

    return res.status(200).json({ events });
  } catch (e) {
    return res.status(200).json({ events: [] });
  }
}
