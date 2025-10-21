export default async function handler(req, res) {
  const { number } = req.query; // get number from URL, e.g., /api/proxy/42
  const targetUrl = `https://authsure.in/api/mobile/lookup/${number}`;

  try {
    const response = await fetch(targetUrl, {
      method: "GET", // or "POST" if the real API needs POST
      headers: {
        "x-api-key": process.env.AUTHSURE_API_KEY, // from Vercel env vars
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(response.status).json(data);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Server error" });
  }
}
