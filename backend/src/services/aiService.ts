import dotenv from "dotenv";
import axios from "axios";
dotenv.config();

const categories = ["Interested", "Meeting Booked", "Not Interested", "Spam", "Out of Office"];
const OLLAMA_URL = "http://localhost:11434/api/generate";

export async function categorizeEmail(subject: string, body: string): Promise<string> {
  try {
    const cleanBody = body.slice(0, 1500).trim();
    const cleanSubject = subject.trim();

   
    const text = `${cleanSubject} ${cleanBody}`.toLowerCase();
    if (/out of office|automatic reply|i am away|on vacation|returning on/i.test(text)) {
      return "Out of Office";
    }
    if (/unsubscribe|buy now|discount|offer|free trial|limited time|promotion|click here/i.test(text)) {
      return "Spam";
    }

    const prompt = `
You are an email classification assistant.
Classify the following email into ONE category:
["Interested", "Meeting Booked", "Not Interested", "Spam", "Out of Office"]

Guidelines:
- "Interested": The sender shows positive interest, asks for info, pricing, or demo.
- "Meeting Booked": A specific meeting time or calendar invite is confirmed.
- "Not Interested": Sender declines, rejects, or says they’re not interested.
- "Spam": Promotional, irrelevant, or bulk marketing content.
- "Out of Office": Sender says they are away, on vacation, or sends an automatic reply.

Examples:
"Let's connect this Friday" → Meeting Booked
"Please send details of your service" → Interested
"Not interested at the moment" → Not Interested
"Buy followers now! Limited time offer!" → Spam
"I am out of office until next Monday" → Out of Office

Respond only with: Interested, Meeting Booked, Not Interested, Spam, or Out of Office.

Subject: ${cleanSubject}
Body: ${cleanBody}

Category:
`;

    const response = await axios.post(OLLAMA_URL, {
      model: "tinyllama",
      prompt: prompt,
      stream: false,
      options: { temperature: 0.3, num_predict: 20 },
    });

    let result = response.data.response.trim();

    result = result.replace(/\n/g, " ").toLowerCase();

    const matched = categories.find(cat =>
      result.includes(cat.toLowerCase().replace(/\s/g, ""))
      || result.includes(cat.toLowerCase())
    );

  
    return matched || "Uncategorized";

  } catch (err: any) {
    console.error("Ollama Error:", err.message);
    return "Uncategorized";
  }
}
