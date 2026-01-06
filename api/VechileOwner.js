
import { neon } from "@neondatabase/serverless";


const API_KEY = "ak_282u503cz3p506u6f12d595g"; // move to env later

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

  let idNumber;
  let username;

  /* ===== PARSE REQUEST ===== */
  try {
    ({ number: idNumber, username } = req.body);

    if (!idNumber) {
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
    if (user.credits < 90) {
      return res.status(400).json({
        success: false,
        message: "Insufficient credits",
        availableCredits: user.credits,
      });
    }
 const EXTERNAL_API_URL = `https://authsure.in/api/vehicle/vehicle-to-contact/${encodeURIComponent(idNumber)}`;
    /* 3️⃣ CALL EXTERNAL API */
    const apiResponse = await fetch(EXTERNAL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
     
    });

    const data = await apiResponse.json();

    /* 4️⃣ SUBTRACT CREDITS */
    const remainingCredits = user.credits - 90;

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
