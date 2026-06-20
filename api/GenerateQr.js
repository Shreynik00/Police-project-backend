
import { neon } from "@neondatabase/serverless";
import QRCode from "qrcode";

const EXTERNAL_API_URL =process.env.NEXT_PUBLIC_Experian_URL;
const API_KEY = process.env.NEXT_PUBLIC_Experian_KEY; // move to env later

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

 

if (action === "generateQR") {
  const { machineId } = req.body;

  try {
    const sql = neon(process.env.DATABASE_URL);

    const equipment = await sql`
      SELECT *
      FROM equipment
      WHERE machineid = ${machineId}
    `;

    if (equipment.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Machine not found",
      });
    }

    const machine = equipment[0];

    const qrText = `
Machine ID: ${machine.machineid}
Name: ${machine.name}
Department: ${machine.department}
Install Date: ${machine.installdate}
Last Maintenance: ${machine.lastmaintdate}
Maintenance Interval: ${machine.maintinterval}
`;

    const qrCode = await QRCode.toDataURL(qrText);

    return res.json({
      success: true,
      qrCode,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}
}
