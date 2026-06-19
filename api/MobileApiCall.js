import { neon } from "@neondatabase/serverless";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  const { action } = req.body;

  /* -------------------------------
     VERIFY TOKEN
  -------------------------------- */
  if (action === "verify") {
    const { token } = req.body;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token missing",
      });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      return res.json({
        success: true,
        user: decoded,
      });
    } catch (err) {
      return res.status(403).json({
        success: false,
        message: "Invalid token",
      });
    }
  }

  /* -------------------------------
     ADD EQUIPMENT
  -------------------------------- */
  if (action === "addEquipment") {
    const {
      token,
      machineId,
      name,
      department,
      installDate,
      lastMaintDate,
      maintInterval,
    } = req.body;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token missing",
      });
    }

    try {
      jwt.verify(token, JWT_SECRET);

      const sql = neon(process.env.DATABASE_URL);

      await sql`
        INSERT INTO equipment (
          machineid,
          name,
          department,
          installdate,
          lastmaintdate,
          maintinterval
        )
        VALUES (
          ${machineId},
          ${name},
          ${department},
          ${installDate},
          ${lastMaintDate},
          ${maintInterval}
        )
      `;

      /* -------------------------------
GET EQUIPMENT
-------------------------------- */

/* -------------------------------
   GET EQUIPMENT
-------------------------------- */
if (action === "getEquipment") {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token missing",
    });
  }

  try {
    jwt.verify(token, JWT_SECRET);

    const sql = neon(process.env.DATABASE_URL);

    const equipment = await sql`
      SELECT
        machineid AS "machineId",
        name
      FROM equipment
      ORDER BY machineid
    `;

    return res.json({
      success: true,
      equipment,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}


      return res.json({
        success: true,
        message: "Equipment added successfully",
      });

    } catch (err) {
      console.error(err);

      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }

  return res.status(400).json({
    success: false,
    message: "Invalid action",
  });
}
