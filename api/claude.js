// api/claude.js
// Proxies Anthropic API — keeps your API key server-side, never exposed in browser
// Deploy this to /api/claude.js in your Vercel project root
// Set ANTHROPIC_API_KEY in your Vercel environment variables

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "ANTHROPIC_API_KEY not set in Vercel environment variables",
    });
  }

  const { prompt } = req.body;
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "prompt field required in body" });
  }

  // 32k chars ≈ 8k tokens — well within model limits; notify when truncation occurs
  const MAX_PROMPT = 32000;
  const truncatedPrompt = prompt.length > MAX_PROMPT
    ? prompt.slice(0, MAX_PROMPT) + "\n\n[Note: prompt was truncated due to length]"
    : prompt;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2048,
        messages: [
          { role: "user", content: truncatedPrompt }
        ],
      }),
      signal: AbortSignal.timeout(60000), // 60 second timeout for long AI responses
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Anthropic error:", response.status, errorBody);
      return res.status(response.status).json({
        error: `Anthropic API returned ${response.status}`,
        detail: errorBody,
      });
    }

    const data = await response.json();

    // Extract text from the response content blocks
    const text = data.content
      ?.filter(block => block.type === "text")
      ?.map(block => block.text)
      ?.join("\n") || "";

    return res.status(200).json({ text });

  } catch (err) {
    console.error("claude.js error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
