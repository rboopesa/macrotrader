// api/prices.js
// Proxies Yahoo Finance chart API — avoids CORS issues in the browser
// Deploy this to /api/prices.js in your Vercel project root

export default async function handler(req, res) {
  // Allow requests from your own domain only
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const { sym, range = "1y" } = req.query;

  if (!sym) {
    return res.status(400).json({ error: "sym query param required" });
  }

  // Valid ranges Yahoo Finance accepts
  const VALID_RANGES = ["1d","5d","1mo","3mo","6mo","1y","2y","5y"];
  const safeRange = VALID_RANGES.includes(range) ? range : "1y";

  // Yahoo Finance chart endpoint
  // interval: 1d for anything >= 1mo, 1h for shorter ranges
  const interval = ["1d","5d"].includes(safeRange) ? "1h" : "1d";
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=${safeRange}&interval=${interval}&includePrePost=false&events=div%2Csplits`;

  try {
    const response = await fetch(url, {
      headers: {
        // Yahoo requires a browser-like User-Agent or it returns 401
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json",
        "Accept-Language": "en-US,en;q=0.9",
        "Origin": "https://finance.yahoo.com",
        "Referer": "https://finance.yahoo.com",
      },
      // 10 second timeout
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Yahoo Finance returned ${response.status}`,
        sym,
      });
    }

    const data = await response.json();

    // Cache for 15 minutes on Vercel edge — matches the dashboard refresh interval
    res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=60");
    return res.status(200).json(data);

  } catch (err) {
    console.error("prices.js error:", sym, err.message);
    return res.status(500).json({ error: err.message, sym });
  }
}
