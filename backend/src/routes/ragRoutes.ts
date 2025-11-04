// backend/src/routes/ragRoutes.ts
import express from "express";
import { suggestReply } from "../services/ragService";

const router = express.Router();

router.post("/suggest-reply", async (req, res) => {
  try {
    const { subject, body } = req.body;
    const reply = await suggestReply(subject, body);
    res.json({ reply });
  } catch (err) {
    console.error(" RAG suggestReply error:", err);
    res.status(500).json({ error: "Failed to generate AI reply" });
  }
});

export default router;
