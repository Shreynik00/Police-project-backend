import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET; // move to env later

export default async function handler(req, res) {
  
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type ,Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  let token;

  try {
    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body;

    token = body.token;
  } catch {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON"
    });
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token missing"
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.status(200).json({
      success: true,
      user: decoded
    });
  } catch {
    return res.status(403).json({
      success: false,
      message: "Invalid token"
    });
  }
}
