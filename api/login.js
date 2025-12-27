import { neon } from "@neondatabase/serverless";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  
const JWT_SECRET="pp";
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  const { action } = req.body;

  if (!action)
    return res.status(400).json({
      success: false,
      message: "Missing action (login or scan)",
    });

  /* -----------------------------------------
   * ✅ LOGIN LOGIC
   * ----------------------------------------- */
  if (action === "login") {
    const { identifier, password } = req.body;

    try {
      const sql = neon(process.env.DATABASE_URL);

      const users = await sql`
        SELECT * FROM users
        WHERE email = ${identifier} OR username = ${identifier}
      `;

      if (users.length === 0)
        return res
          .status(401)
          .json({ success: false, message: "User not found" });

      const user = users[0];

      if (password !== user.password)
        return res
          .status(401)
          .json({ success: false, message: "Invalid password" });

          
          
         
    const token = jwt.sign(
      {
       
        email: user.email
      
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
      return res.json({
        success: true,
        message: "Login successful",
        user,
        token,
      });

      
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

   
  if(action ==="verify")
  {
    const { token } = req.body;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token missing",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // ✅ Return DATA in body (as you wanted)
    return res.status(200).json({
      success: true,
      user: decoded,
    });
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
  }
  /* -----------------------------------------
   * ✅ NUMBER SCAN LOGIC
   * ----------------------------------------- */
  if (action === "scan") {
    const { number } = req.body;

    if (!number)
      return res
        .status(400)
        .json({ success: false, message: "Number required" });

    try {
      const response = await fetch("https://leakosintapi.com/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: "8005902619:b7u1c0JO",
          request: number,
          limit: 100,
          lang: "en",
        }),
      });

      const data = await response.json();
      return res.json({ success: true, data });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ success: false, message: "API error" });
    }
  }

  /* -----------------------------------------
   * ❌ Invalid Action
   * ----------------------------------------- */
  return res
    .status(400)
    .json({ success: false, message: "Invalid action" });
}




