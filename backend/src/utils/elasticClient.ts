import { Client } from "@elastic/elasticsearch";

export const esClient = new Client({ 
  node: process.env.ELASTICSEARCH_URL || "https://1273ff0211:a3a4330b62ebc745757b@yuvan-1j14v67b.us-east-1.bonsaisearch.net",
  tls: {
    rejectUnauthorized: false,
  },
  requestTimeout: 30000,
  // Add compatibility mode for Bonsai (Elasticsearch 7.x)
  compatibilityMode: 'es7'
});

export async function ensureIndex() {
  try {
    const exists = await esClient.indices.exists({ index: "emails" });
    
    if (!exists) {
      await esClient.indices.create({
        index: "emails",
        body: {
          mappings: {
            properties: {
              subject: { type: "text" },
              from: { type: "keyword" },
              body: { type: "text" },
              category: { type: "keyword" },
              category_lower: { type: "keyword" },
              date: { type: "date" },
            },
          },
        },
      });
      console.log("✅ Created Elasticsearch index with mapping: emails");
    } else {
      console.log("✅ Elasticsearch index already exists: emails");
      
      // Optional: update mapping if missing
      try {
        await esClient.indices.putMapping({
          index: "emails",
          body: {
            properties: {
              category: { type: "keyword" },
              category_lower: { type: "keyword" },
            },
          },
        });
        console.log("✅ Updated index mapping");
      } catch (e: any) {
        console.warn("⚠️ Mapping update warning:", e?.message ?? e);
      }
    }
  } catch (error: any) {
    console.error("❌ Elasticsearch setup error:", error?.message ?? error);
    throw error;
  }
}
