import { ImapFlow } from "imapflow";
import { lookup as dnsLookup } from "dns/promises";
import { esClient, ensureIndex } from "../utils/elasticClient";
import { categorizeEmail } from "./aiService";
import { sendSlackAlert } from "./slackService";

export async function startImapSync() {
  try {
    await ensureIndex();

    const imapOptions: any = {
      host: "imap.gmail.com",
      port: 993,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER || "",
        pass: process.env.GMAIL_PASS || "",
      },
      tls: {
        rejectUnauthorized: false,
      },
    };


    imapOptions.lookup = async (hostname: string, options: any, callback: any) => {
      try {
        const result = await dnsLookup(hostname, { ...options, family: 4 });
        callback(null, result.address, result.family);
      } catch (err) {
        callback(err, undefined, undefined);
      }
    };

    const imap = new ImapFlow(imapOptions);

    console.log("📨 Connecting to Gmail IMAP...");
    await imap.connect();
    await imap.mailboxOpen("INBOX");

    console.log("Connected to Gmail Inbox");

    const sinceDate = new Date();
    sinceDate.setMonth(sinceDate.getMonth() - 1);
    console.log(`📅 Fetching emails since ${sinceDate.toISOString().split("T")[0]}`);

    for await (let message of imap.fetch(
      { since: sinceDate },
      { envelope: true, source: true }
    )) {
      const subject = message?.envelope?.subject ?? "No subject";
      const from = message?.envelope?.from?.[0]?.address ?? "Unknown sender";
      const body = message?.source?.toString()?.slice(0, 1500) ?? "";

      console.log(`📧 New Email: ${subject} — from ${from}`);

      const categoryRaw = await categorizeEmail(subject, body);
      const category = (categoryRaw || "Uncategorized").trim();
      const category_lower = category.toLowerCase();

      console.log(`Categorized as: ${category}`);

      const doc = {
        subject,
        from,
        body,
        category,
        category_lower,
        date: new Date().toISOString(),
      };

      await esClient.index({
        index: "emails",
        document: doc,
      });

      await esClient.indices.refresh({ index: "emails" });

      switch (category_lower) {
        case "interested":
          await sendSlackAlert(` *Interested lead detected!*\n*Subject:* ${subject}\n*From:* ${from}`);
          break;
        case "meeting booked":
          await sendSlackAlert(` *Meeting Booked!*\n*Subject:* ${subject}\n*From:* ${from}`);
          break;
        case "spam":
          console.log(" Spam email detected — logged only.");
          break;
        default:
          console.log("Logged email (other category).");
          break;
      }
    }

    await imap.logout();
    console.log(" Email sync complete");
  } catch (err) {
    console.error("IMAP sync error:", err);
  }
}
