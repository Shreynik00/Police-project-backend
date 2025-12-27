import jwt from "jsonwebtoken";

const JWT_SECRET = "pp"; // Move to env later

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }
 // ✅ BODY IS RAW STRING TOKEN
  const token =
    typeof req.body === "string"
      ? req.body.trim()
      : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token missing"
    });
  }
 

 

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.status(200).json({ success: true, user: decoded });
  } catch (err) {
    return res.status(403).json({ success: false, message: "Invalid token" });
  }
}
