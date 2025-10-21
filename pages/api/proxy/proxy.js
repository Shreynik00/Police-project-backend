// /api/proxy/[number].js (Assuming this file path in Next.js/Vercel)
export default async function handler(req, res) {
  // 1. Set global CORS headers for ALL responses (Preflight and main response)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Api-Key, X-Requested-With");

  // 2. Handle CORS Preflight request (OPTIONS method)
  if (req.method === "OPTIONS") {
    // If it's a preflight, we send the headers and terminate the response
    return res.status(200).end();
  }

  // 3. Data Extraction and Target URL Setup (Only runs for GET/POST/etc.)
  // The 'number' is now retrieved from the URL path, assuming route: /api/proxy/[number]
  // NOTE: 'number' comes from req.query because the route file is named [number].js
  const { number } = req.query;
  
  if (!number) {
    return res.status(400).json({ error: "Missing number in URL path" });
  }

  // Use the correct target URL
  const targetUrl = `https://authsure.in/api/mobile/lookup/${number}`;

  try {
    // NOTE: Changed method to 'GET' based on common lookup practice. Adjust if API requires POST.
    const response = await fetch(targetUrl, {
      method: "GET", // Changed from POST to GET
      headers: {
        "x-api-key": process.env.AUTHSURE_API_KEY,
        // Content-Type: application/json is usually NOT needed for a GET request
      },
      // No body is sent for a GET request
    });

    // Check if the external API response was successful
    if (!response.ok) {
        // Forward the external API's status and potentially its error message
        const errorData = await response.json().catch(() => ({})); // try to parse, but don't fail if it's not JSON
        return res.status(response.status).json({
            error: "External API call failed",
            details: errorData,
            statusCode: response.status
        });
    }

    const data = await response.json();

    // 4. Send the successful response from the external API
    res.status(200).json(data);
  } catch (err) {
    console.error("Error in proxy handler:", err);
    // 5. Send a server error response (CORS headers already set)
    res.status(500).json({ error: "Internal Server Error", message: err.message });
  }
}
