import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import bodyParser from "body-parser";
import emailRoutes from "./routes/emailRoutes";
import { startImapSync } from "./services/imapService";
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
    console.error(" Error generating reply:", err);
    res.status(500).json({ error: "Failed to generate reply" });
  }
});

app.get("/", (_, res) => res.send("📬 Email Onebox backend running"));

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await ensureRagIndex(); 
  startImapSync(); 
});
