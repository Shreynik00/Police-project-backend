
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
res.setHeader(
  "Access-Control-Allow-Headers",
  "Content-Type, Authorization"
);
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
  
  try {
    const { data, target } = req.body;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

    const model = genAI.getGenerativeModel({
      model:  "gemini-1.5-flash",
    });

    const prompt = `
You are a cyber intelligence analyst.

Generate a professional OSINT report.

Structure:
1. Report Header
2. Executive Summary
3. Target Overview
4. Data Source Analysis
5. Record Breakdown
6. Intelligence Observations
7. Conclusion

Rules:
- No emojis
- No recommendations
- No hallucination
- Use only given data
- Keep it formal and structured

Target: ${target}

Data:
${JSON.stringify(data, null, 2)}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    const text = response.text();

    res.status(200).json({ report: text });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI generation failed" });
  }
}



