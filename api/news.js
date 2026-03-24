// api/news.js
// Proxies Google News RSS — avoids CORS issues in the browser
// Deploy this to /api/news.js in your Vercel project root

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: "q query param required" });
  }

  // Google News RSS — free, no API key, no rate limits
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-IN&gl=IN&ceid=IN:en`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MacroTrader/1.0)",
        "Accept": "application/rss+xml, application/xml, text/xml",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return res.status(response.status).send("");
    }

    const xml = await response.text();

    // Cache for 30 minutes — news doesn't need to be fresher than this
    res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=300");
    res.setHeader("Content-Type", "application/xml");
    return res.status(200).send(xml);

  } catch (err) {
    console.error("news.js error:", q, err.message);
    // Return empty XML so the frontend parser doesn't crash
    return res.status(200).send("<?xml version='1.0'?><rss><channel></channel></rss>");
  }
}
