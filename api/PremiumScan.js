import { neon } from "@neondatabase/serverless";

const LEAK_OSINT_URL = "https://leakosintapi.com/";
const LEAK_OSINT_TOKEN = "8005902619:b7u1c0JO"; // move to env later
const CREDIT_COST = 90;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  const sql = neon(process.env.DATABASE_URL);

  let number;
  let username;

  /* ===== PARSE REQUEST ===== */
  try {
    ({ number, username } = req.body);

    if (!number) {
      return res
        .status(400)
        .json({ success: false, message: "Number required" });
    }

    if (!username) {
      return res
        .status(400)
        .json({ success: false, message: "Username required" });
    }
  } catch {
    return res
      .status(400)
      .json({ success: false, message: "Invalid JSON" });
  }

  try {
    /* 1️⃣ FETCH USER */
    const users = await sql`
      SELECT username, credits
      FROM users
      WHERE username = ${username}
    `;

    if (users.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const user = users[0];

    /* 2️⃣ CHECK CREDITS */
    if (user.credits < CREDIT_COST) {
      return res.status(400).json({
        success: false,
        message: "Insufficient credits",
        availableCredits: user.credits,
      });
    }

    /* 3️⃣ CALL LEAK OSINT API (REPLACED PART ✅) */
    const response = await fetch(LEAK_OSINT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: LEAK_OSINT_TOKEN,
        request: number,
        limit: 100,
        lang: "en",
      }),
    });

    if (!response.ok) {
      throw new Error(`LeakOSINT API error: ${response.status}`);
    }

    const data = await response.json();

    /* 4️⃣ DEDUCT CREDITS */
    const remainingCredits = user.credits - CREDIT_COST;

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
      remainingCredits,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "External API call failed",
      error: error.message,
    });
  }
}
