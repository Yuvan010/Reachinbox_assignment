import { Client } from "@elastic/elasticsearch";

export const esClient = new Client({ node: "http://localhost:9200" });

export async function ensureIndex() {
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
    console.log("Created Elasticsearch index with mapping: emails");
  } else {
    // optional: update mapping if missing
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
    } catch (e) {
      console.warn(" Mapping update warning:", e?.message ?? e);
    }
  }
}
