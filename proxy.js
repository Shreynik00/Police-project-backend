export default async function handler(req, res) {
  // --- CORS Preflight Handling (MANDATORY for complex requests) ---
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    // Allow the methods your proxy handles
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    // Explicitly allow headers that the client might send (like Content-Type or Authorization)
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Api-Key, X-Requested-With");
    return res.status(200).end();
  }

  // --- Data Extraction and Target URL Setup ---
  // The 'number' is now retrieved from the URL path, assuming route: /api/proxy/[number]
  const { number } = req.query; 
  const targetUrl = `https://authsure.in/api/mobile/lookup/${number}`;

  // --- Set CORS headers for the main response (Success or Failure) ---
  // We place these headers here so they are set before both the success (try) and error (catch) blocks send a response.
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Api-Key, X-Requested-With");

  try {
    const response = await fetch(targetUrl, {
      method: "GET", 
      headers: {
        "x-api-key": process.env.AUTHSURE_API_KEY, 
        "Content-Type": "application/json",
      },
      // Since this specific external API uses GET, we don't include a body.
    });

    const data = await response.json();

    res.status(response.status).json(data);
  } catch (err) {
    console.error("Error:", err);
    // Note: The CORS headers are already set above this block.
    res.status(500).json({ error: "Server error", message: err.message });
  }
}
