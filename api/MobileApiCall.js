const EXTERNAL_API_URL = "https://authsure.in/api/mobile/mobile-lookup-v2";
const API_KEY = "ak_3z2p6bm6k6r17364z1h1k3m1"; // move to env later

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  let idNumber;

  // Parse incoming request body
  try {
   const { number } = req.body;

    if (!number)
      return res
        .status(400)
        .json({ success: false, message: "Number required" });

    idNumber = number;
  } catch {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON"
    });
  }

  if (!idNumber) {
    return res.status(400).json({
      success: false,
      message: "id_number missing"
    });
  }

  // Call external API with required body format
  try {
    const apiResponse = await fetch(EXTERNAL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY
      },
      body: JSON.stringify({
        mobileNumber: idNumber
      })
    });

    const data = await apiResponse.json();

    return res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "External API call failed",
      error: error.message
    });
  }
}

