let emailsStore: any[] = [];

export const esClient = {
  // Mock client that doesn't actually connect to Elasticsearch
  indices: {
    exists: async () => true,
    create: async () => ({ acknowledged: true }),
    putMapping: async () => ({ acknowledged: true })
  }
};

export async function ensureIndex() {
  console.log("✅ Using in-memory storage (no Elasticsearch needed)");
  return;
}

// Store email in memory
export async function indexEmail(email: any) {
  emailsStore.push({
    ...email,
    id: Date.now().toString(),
    indexed_at: new Date()
  });
  console.log(`✅ Stored email in memory: ${email.subject}`);
  return { _id: emailsStore.length - 1 };
}

// Search emails in memory
export async function searchEmails(query: any) {
  const { category_lower, size = 10 } = query;
  
  let results = emailsStore;
  
  // Filter by category if provided
  if (category_lower) {
    results = results.filter(email => 
      email.category_lower === category_lower
    );
  }
  
  // Limit results
  results = results.slice(0, size);
  
  return {
    hits: {
      hits: results.map(email => ({
        _source: email
      }))
    }
  };
}

// Get all emails
export function getAllEmails() {
  return emailsStore;
}

// Clear all emails
export function clearEmails() {
  emailsStore = [];
  console.log("✅ Cleared all emails from memory");
}
