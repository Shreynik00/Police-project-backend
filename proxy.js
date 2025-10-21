// ✅ Vercel Serverless Function Proxy
// File path: api/proxy.js (or similar)
//
// This function acts as a proxy to forward requests from the client 
// to a secure external API, adding the API key and handling CORS.

// Note: Ensure the API_KEY is set as an environment variable in your Vercel project settings.
const API_URL = "https://api.authsure.com/v1/data"; // Replace with your actual external API endpoint
const API_KEY = process.env.API_KEY;      // Your API key stored securely in Vercel environment variables

export default async function handler(req, res) {
  
  // --- 1. CORS Preflight Handling (MANDATORY for POST requests) ---
  // This block handles the OPTIONS request sent by the browser before a POST/PUT/DELETE request.
  if (req.method === "OPTIONS") {
    // Allows access from *any* origin
    res.setHeader("Access-Control-Allow-Origin", "*");
    // Specifies which methods are allowed
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    // Specifies which custom headers (like Content-Type) are allowed
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    
    // Respond with a 204 or 200 status code and end the response
    res.status(200).end();
    return;
  }
  
  // --- 2. Main Proxy Logic ---
  try {
    // 1. Prepare the API call payload
    const fetchOptions = {
      method: req.method, // Forward the original HTTP method (GET, POST, etc.)
      headers: {
        // Pass your secret API Key securely
        "x-api-key": API_KEY, 
        // Ensure the content type is JSON for the external API
        "Content-Type": "application/json", 
      },
      // Include the body only for non-GET requests (POST, PUT, etc.)
      body: req.method !== "GET" ? JSON.stringify(req.body) : undefined,
    };

    // 2. Execute the fetch request to the external API
    const response = await fetch(API_URL, fetchOptions);

    // 3. Parse the JSON response from the external API
    const data = await response.json();

    // --- 3. Set CORS Headers for the actual response ---
    // These headers allow the frontend client (from anywhere) to receive the data.
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    
    // 4. Send the external API's status and data back to the client
    res.status(response.status).json(data);

  } catch (error) {
    // --- 4. Error Handling ---
    console.error("❌ Proxy error:", error);
    
    // Send a generic 500 status to the client
    res.status(500).json({ 
      error: "Internal Server Error", 
      message: "Could not successfully connect to or get a valid response from the external API." 
    });
  }
}
