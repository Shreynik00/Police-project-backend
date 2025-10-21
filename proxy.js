// ✅ Vercel Serverless Function
export default async function handler(req, res) {
      const { number } = req.query;
    const API_URL = "https://authsure.in/api/mobile/lookup/{$number}"; // change this to your actual API
    const API_KEY = process.env.AUTHSURE_API_KEY;       // safely stored in Vercel env vars
  
    // Handle CORS preflight request
    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      res.status(200).end();
      return;
    }
  
    try {
      const response = await fetch(API_URL, {
        method: req.method,
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json",
        },
        body: req.method !== "GET" ? JSON.stringify(req.body) : undefined,
      });
  
      const data = await response.json();
  
      // Allow your frontend to access it
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      res.setHeader("Access-Control-Allow-Methods", "POST");
  
      res.status(response.status).json(data);
    } catch (error) {
      console.error("❌ Proxy error:", error);
      res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
  }

  
