import { neon } from "@neondatabase/serverless";
import jwt from "jsonwebtoken";




export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers",  "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  const { action } = req.body;
  

  if (!action)
    return res.status(400).json({
      success: false,
      message: "Missing action ",
    });
   
      /* -----------------------------------------
   * ✅ TOKEN VERIFY LOGIC (NEW – SAFE ADD)
   * ----------------------------------------- */
  if (action === "verify") {
    const decoded = verifyToken(req);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    return res.json({
      success: true,
      user: decoded,
    });
  }


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
              userId: user.id,
              email: user.email,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" } // 🔥 token valid for 1 hour
          );
          
          return res.json({
            success: true,
            message: "Login successful",
            token,
            user: {
              id: user.id,
              email: user.email,
              username: user.username,
            },
          });
          
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  function verifyToken(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;
  
    const token = authHeader.split(" ")[1];
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return null;
    }
  }
  
  /* -----------------------------------------
   * ✅ NUMBER SCAN LOGIC
   * ----------------------------------------- */
  if (action === "scan") {
    const { number } = req.body;

    const decoded = verifyToken(req);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized or token expired",
      });
    }

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
