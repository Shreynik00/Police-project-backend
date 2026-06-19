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

if (action === "getMaintenanceLogs") {
  const { token ,machineId ,Equipment} = req.body;

  try {
    jwt.verify(token, JWT_SECRET);

    const sql = neon(process.env.DATABASE_URL);

    const logs = await sql`
      SELECT
        logid AS "logId",
        machineid AS "machineId",
        maintdate AS "maintDate",
        performedby AS "performedBy",
        remarks,
        email
      FROM maintenancelog WHERE machineid=${MachineId} 
      ORDER BY maintdate DESC
    `;

    return res.json({
      success: true,
      logs,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}
if (action === "addMaintenanceLog") {
  const {
    token,
    logId,
    machineId,
    maintDate,
    performedBy,
    remarks,
    email,
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
      INSERT INTO maintenancelog (
        logid,
        machineid,
        maintdate,
        performedby,
        remarks,
        email
      )
      VALUES (
        ${logId},
        ${machineId},
        ${maintDate},
        ${performedBy},
        ${remarks},
        ${email}
      )
    `;

    return res.json({
      success: true,
      message: "Maintenance Log Added Successfully",
    });
  } catch (err) {
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
