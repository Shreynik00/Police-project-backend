import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { identifier, password } = req.body;

  const sql = neon(process.env.DATABASE_URL);

  try {
    const users = await sql`
      SELECT * FROM users 
      WHERE email = ${identifier} OR username = ${identifier}
    `;

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    const user = users[0];

    // SIMPLE PASSWORD MATCH (NO BCRYPT)
    if (password !== user.password) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    return res.json({ success: true, message: "Login successful", user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
