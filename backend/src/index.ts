import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import bodyParser from "body-parser";
import emailRoutes from "./routes/emailRoutes";
import { ensureRagIndex, suggestReply } from "./services/ragService";
import ragRoutes from "./routes/ragRoutes";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.use("/emails", emailRoutes);
app.use("/rag", ragRoutes);

app.post("/suggest-reply", async (req, res) => {
  try {
    const { subject, body } = req.body;
    const reply = await suggestReply(subject, body);
    res.json({ reply });
  } catch (err) {
    console.error("❌ Error generating reply:", err);
    res.status(500).json({ error: "Failed to generate reply" });
  }
});

app.get("/", (_, res) => res.send("📬 Email Onebox backend running"));

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  
  // Initialize RAG
  try {
    await ensureRagIndex();
    console.log("✅ RAG index ready");
  } catch (error: any) {
    console.error("⚠️ RAG setup error:", error.message);
  }
  
  // Start IMAP sync (optional - only if configured)
  try {
    // Only import and start if Gmail credentials are provided
    if (process.env.GMAIL_USER && process.env.GMAIL_PASSWORD) {
      const { startImapSync } = await import("./services/imapService");
      if (typeof startImapSync === 'function') {
        startImapSync();
        console.log("✅ IMAP sync started");
      }
    } else {
      console.log("⚠️ IMAP sync disabled (no Gmail credentials provided)");
    }
  } catch (error: any) {
    console.error("⚠️ IMAP sync error:", error.message);
    console.log("📧 App will continue without email syncing");
  }
});
