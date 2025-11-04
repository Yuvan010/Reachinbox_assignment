import express from "express";
import axios from "axios";
import { esClient } from "../utils/elasticClient";

const router = express.Router();

// ===============================
// 1️⃣ Fetch Emails (existing route)
// ===============================
router.get("/", async (_, res) => {
  try {
    const result = await esClient.search({
      index: "emails",
      size: 100,
      body: {
        sort: [{ date: { order: "desc" } }],
        query: { match_all: {} },
      },
    });

    const emails = result.hits.hits.map((h: any) => ({
      id: h._id,
      ...h._source,
    }));

    res.json(emails);
  } catch (err) {
    console.error("❌ Error fetching emails:", err);
    res.status(500).json({ error: "Failed to fetch emails" });
  }
});

// ===============================
// 2️⃣ AI-Powered Suggested Reply (RAG-based)
// ===============================
router.post("/suggest-reply", async (req, res) => {
  const { emailContent } = req.body;
  if (!emailContent) {
    return res.status(400).json({ error: "emailContent is required" });
  }

  try {
    // Step 1: Retrieve contextual info from vector DB (placeholder)
    const vectorContext = `
    You are helping craft replies for job outreach and professional emails.
    If the sender expresses interview interest, reply politely and share this meeting link:
    https://cal.com/example
    `;

    // Step 2: Create combined prompt
    const prompt = `
    Context:
    ${vectorContext}

    Incoming Email:
    "${emailContent}"

    Suggested Reply:
    `;

    // Step 3: Use a lightweight Hugging Face model
    const HF_API_TOKEN = process.env.HF_API_TOKEN; // store in .env
    const model = "facebook/blenderbot-400M-distill";

    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${model}`,
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${HF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    const suggestion =
      response.data?.generated_text ||
      response.data?.[0]?.generated_text ||
      "No suggestion generated.";

    res.json({ suggestion });
  } catch (err: any) {
    console.error("❌ RAG suggestReply error:", err.message);
    res
      .status(500)
      .json({ error: "Failed to generate reply", details: err.message });
  }
});

export default router;
