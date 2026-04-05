
import Groq from "groq-sdk";

export default async function handler(req, res) {
  // ✅ ADD THESE CORS HEADERS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");

  // ✅ Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { data, target } = req.body;



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

 // ✅ REPLACE with these 3 lines
const groq = new Groq({ apiKey: process.env.GROQ_KEY });
const completion = await groq.chat.completions.create({
  model: "llama-3.3-70b-versatile",
  messages: [{ role: "user", content: prompt }],
});
const text = completion.choices[0].message.content;

    res.status(200).json({ report: text });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI generation failed" });
  }
}



