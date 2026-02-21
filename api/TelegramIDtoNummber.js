import { neon } from "@neondatabase/serverless";

const EXTERNAL_API_URL =prcoess.env.MobileToGst_URL;
const API_KEY =process.env.MobileToGst_KEY; // move to env later

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
      message: "Method not allowed",
    });
  }

  const sql = neon(process.env.DATABASE_URL);

  let id;
  let username;

  /* ===== PARSE REQUEST ===== */
  try {
    ({ number: id, username } = req.body);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Number required",
      });
    }

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username required",
      });
    }
  } catch {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON",
    });
  }

  /* ===== MAIN FLOW ===== */
  try {
    /* 1️⃣ FETCH USER BY USERNAME */
    const users = await sql`
      SELECT username, credits
      FROM users
      WHERE username = ${username}
    `;

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = users[0];

    /* 2️⃣ CHECK CREDITS */
    if (user.credits < 10) {
      return res.status(400).json({
        success: false,
        message: "Insufficient credits",
        availableCredits: user.credits,
      });
    }

    /* 3️⃣ CALL EXTERNAL API
    const apiResponse = await fetch(EXTERNAL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({
        panNumber: idNumber,
      }),
    });*/

  
    const BASE_API_URL="http://65.21.178.173:3000/api";
    const API_KEY="PrajapatiRAVAn";
     try {
    const apiUrl = `${BASE_API_URL}?key=${API_KEY}&id=${id}`;

    const apiResponse = await fetch(apiURL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    
  },
  body: JSON.stringify({
   
  }),
});
    const data = await response.json();

    return res.status(200).json({
      success: true,
      message: "Data fetched successfully",
      data,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "External API call failed",
      error: error.message,
    });
  }

    const data = await apiResponse.json();

    /* 4️⃣ SUBTRACT CREDITS */
    const remainingCredits = user.credits - 10;

    await sql`
      UPDATE users
      SET credits = ${remainingCredits}
      WHERE username = ${username}
    `;

    /* 5️⃣ SUCCESS RESPONSE */
    return res.status(200).json({
      success: true,
      message: "Scan successful",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "External API call failed",
      error: error.message,
    });
  }
}
