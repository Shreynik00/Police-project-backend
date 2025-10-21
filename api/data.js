// api/data.js
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-API-KEY");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // Handle POST request
  if (req.method === "POST") {
    const data = req.body; // JSON body
    console.log("Received body:", data);

    return res.status(200).json({
      message: "Data received successfully",
      received: data
    });
  }

  // Reject other methods
  res.status(405).json({ message: "Method not allowed" });
}
