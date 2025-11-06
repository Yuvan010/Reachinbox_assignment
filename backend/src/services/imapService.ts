import Imap from "imap";
import { simpleParser } from "mailparser";
import { esClient } from "../utils/elasticClient";

const GMAIL_USER = process.env.GMAIL_USER || "";
const GMAIL_PASSWORD = process.env.GMAIL_PASS || "";

let imap: Imap | null = null;

export function startImapSync() {
  // Don't start if credentials are missing
  if (!GMAIL_USER || !GMAIL_PASSWORD) {
    console.log("⚠️ IMAP credentials not configured. Email sync disabled.");
    return;
  }

  try {
    imap = new Imap({
      user: GMAIL_USER,
      password: GMAIL_PASSWORD,
      host: "imap.gmail.com",
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
    });

    imap.once("ready", () => {
      console.log("✅ IMAP connected");
      openInbox();
    });

    imap.once("error", (err: Error) => {
      console.error("❌ IMAP error:", err.message);
    });

    imap.once("end", () => {
      console.log("⚠️ IMAP connection ended");
    });

    imap.connect();
  } catch (error: any) {
    console.error("❌ Failed to start IMAP sync:", error.message);
  }
}

function openInbox() {
  if (!imap) return;

  imap.openBox("INBOX", false, (err, box) => {
    if (err) {
      console.error("❌ Error opening inbox:", err.message);
      return;
    }

    console.log(`✅ Inbox opened. ${box.messages.total} total messages`);

    // Listen for new emails
    imap.on("mail", () => {
      console.log("📧 New mail detected");
      fetchRecentEmails();
    });

    // Fetch recent emails on startup
    fetchRecentEmails();
  });
}

function fetchRecentEmails() {
  if (!imap) return;

  try {
    // Fetch last 10 emails
    imap.search(["ALL"], (err, results) => {
      if (err) {
        console.error("❌ Search error:", err.message);
        return;
      }

      if (!results || results.length === 0) {
        console.log("📭 No emails found");
        return;
      }

      // Get last 10 emails
      const recentEmails = results.slice(-10);
      const fetch = imap.fetch(recentEmails, { bodies: "" });

      fetch.on("message", (msg) => {
        msg.on("body", (stream) => {
          simpleParser(stream, async (err, parsed) => {
            if (err) {
              console.error("❌ Parse error:", err.message);
              return;
            }

            try {
              await esClient.index({
                index: "emails",
                id: parsed.messageId || `${Date.now()}-${Math.random()}`,
                document: {
                  subject: parsed.subject || "No Subject",
                  from: parsed.from?.text || "Unknown",
                  body: parsed.text || parsed.html || "",
                  date: parsed.date || new Date(),
                  category: "Uncategorized",
                  category_lower: "uncategorized",
                },
              });

              console.log(`✅ Indexed email: ${parsed.subject}`);
            } catch (indexError: any) {
              console.error("❌ Index error:", indexError.message);
            }
          });
        });
      });

      fetch.once("error", (err) => {
        console.error("❌ Fetch error:", err.message);
      });

      fetch.once("end", () => {
        console.log("✅ Finished fetching emails");
      });
    });
  } catch (error: any) {
    console.error("❌ Fetch emails error:", error.message);
  }
}

export function stopImapSync() {
  if (imap) {
    imap.end();
    console.log("✅ IMAP sync stopped");
  }
}
