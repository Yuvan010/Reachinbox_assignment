import { WebClient } from "@slack/web-api";

const token = process.env.SLACK_TOKEN as string;
const channel = process.env.SLACK_CHANNEL as string;

if (!token) console.error("Missing Slack token in .env");

const slackClient = new WebClient(token);

export async function sendSlackAlert(message: string) {
  try {
    await slackClient.chat.postMessage({
      channel,
      text: message,
    });
    console.log("Slack alert sent:", message);
  } catch (err: any) {
    console.error(" Slack error:", err.data || err.message);
  }
}console.log(" Slack Token starts with:", process.env.SLACK_TOKEN?.slice(0, 6));
console.log(" Slack Channel:", process.env.SLACK_CHANNEL);

