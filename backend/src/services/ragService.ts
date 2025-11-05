import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.1-8b-instant"; 

// In-memory knowledge base (no Elasticsearch needed!)
const outreachDocs = [
  {
    id: "1",
    text: "Always maintain a professional and courteous tone in email responses.",
  },
  {
    id: "2",
    text: "Address the specific points mentioned in the email you're replying to.",
  },
  {
    id: "3",
    text: "Keep responses clear, concise, and relevant to the email context.",
  },
];

export async function ensureRagIndex() {
  console.log("✅ Using in-memory knowledge base (no Elasticsearch required)");
  return;
}

// Simple keyword matching for context retrieval
async function getRelevantContext(query: string): Promise<string> {
  // Return all knowledge base items for now
  // You could add keyword matching here if needed
  const relevantDocs = outreachDocs.map(doc => doc.text);
  return relevantDocs.join("\n");
}

export async function suggestReply(emailSubject: string, emailBody: string): Promise<string> {
  try {
    const context = await getRelevantContext(emailBody);
    
    const systemPrompt = `You are an intelligent email assistant that writes contextual, professional email replies.

Your approach:
1. Read the email carefully to understand its purpose and tone
2. Identify what type of email it is (job-related, business inquiry, personal, newsletter, invitation, etc.)
3. Craft a reply that matches the context and addresses the key points
4. Adapt your tone to match the email (formal for business, friendly for casual, enthusiastic for opportunities)

Guidelines:
${context}

- For job/application emails: Express gratitude and interest
- For meeting invites: Confirm or provide availability
- For questions: Answer directly and helpfully
- For updates/notifications: Acknowledge appropriately
- For requests: Respond with yes/no and any needed details
- For introductions: Respond warmly and reciprocate
- Keep responses natural, relevant, and 2-4 sentences unless more detail is needed

DO NOT force generic templates. Each reply should feel personalized to THIS specific email.`;

    const userPrompt = `Email to reply to:

Subject: ${emailSubject}
Body: ${emailBody}

Write an appropriate, contextual reply:`;

    const response = await axios.post(
      GROQ_URL,
      {
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.75,
        max_tokens: 300,
        top_p: 0.9,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    const text = response.data.choices[0]?.message?.content?.trim();
    
    if (!text) {
      throw new Error("Empty response from Groq");
    }
    
    console.log("💬 Suggested reply:", text);
    return text;
  } catch (err: any) {
    console.error("❌ RAG suggestReply error:", {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message
    });
    throw new Error("Failed to generate reply. Please try again.");
  }
}
