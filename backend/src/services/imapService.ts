// In-memory email storage (no Elasticsearch needed)

interface Email {
  id?: string;
  subject?: string;
  from?: string;
  body?: string;
  category?: string;
  category_lower?: string;
  date?: Date | string;
  [key: string]: any;
}

// In-memory store
let emailsStore: Email[] = [];

// Mock Elasticsearch client with all necessary methods
export const esClient = {
  // Index operations
  indices: {
    exists: async (params: any) => {
      console.log(`✅ Mock: Index "${params.index}" exists check`);
      return true;
    },
    
    create: async (params: any) => {
      console.log(`✅ Mock: Created index "${params.index}"`);
      return { acknowledged: true };
    },
    
    putMapping: async (params: any) => {
      console.log(`✅ Mock: Updated mapping for "${params.index}"`);
      return { acknowledged: true };
    },
    
    refresh: async (params: any) => {
      console.log(`✅ Mock: Refreshed index "${params.index}"`);
      return { acknowledged: true };
    }
  },
  
  // Index a document
  index: async (params: any) => {
    const { index, id, document, body } = params;
    const doc = document || body;
    
    const email: Email = {
      ...doc,
      id: id || Date.now().toString(),
      indexed_at: new Date()
    };
    
    // Store in memory
    const existingIndex = emailsStore.findIndex(e => e.id === email.id);
    if (existingIndex >= 0) {
      emailsStore[existingIndex] = email;
    } else {
      emailsStore.push(email);
    }
    
    console.log(`✅ Stored email in memory: ${email.subject || 'No subject'} (Total: ${emailsStore.length})`);
    
    return { 
      _id: email.id,
      result: 'created',
      _index: index
    };
  },
  
  // Search documents
  search: async (params: any) => {
    const { index, query, size = 10 } = params;
    
    let results = [...emailsStore];
    
    // Simple filtering based on query
    if (query && query.match) {
      const field = Object.keys(query.match)[0];
      const value = query.match[field];
      
      if (field && value) {
        results = results.filter(email => {
          const fieldValue = email[field];
          if (typeof fieldValue === 'string') {
            return fieldValue.toLowerCase().includes(value.toLowerCase());
          }
          return false;
        });
      }
    }
    
    // Limit results
    results = results.slice(0, size);
    
    console.log(`✅ Search in "${index}": Found ${results.length} results`);
    
    return {
      hits: {
        total: { value: results.length },
        hits: results.map(email => ({
          _id: email.id,
          _source: email
        }))
      }
    };
  },
  
  // Get a document by ID
  get: async (params: any) => {
    const { index, id } = params;
    const email = emailsStore.find(e => e.id === id);
    
    if (email) {
      return {
        _id: id,
        _source: email,
        found: true
      };
    }
    
    throw new Error(`Document not found: ${id}`);
  },
  
  // Update a document
  update: async (params: any) => {
    const { index, id, body, doc } = params;
    const updates = doc || body?.doc || body;
    
    const emailIndex = emailsStore.findIndex(e => e.id === id);
    
    if (emailIndex >= 0) {
      emailsStore[emailIndex] = {
        ...emailsStore[emailIndex],
        ...updates
      };
      console.log(`✅ Updated email in memory: ${id}`);
      return { result: 'updated' };
    }
    
    throw new Error(`Document not found: ${id}`);
  },
  
  // Delete a document
  delete: async (params: any) => {
    const { index, id } = params;
    const emailIndex = emailsStore.findIndex(e => e.id === id);
    
    if (emailIndex >= 0) {
      emailsStore.splice(emailIndex, 1);
      console.log(`✅ Deleted email from memory: ${id}`);
      return { result: 'deleted' };
    }
    
    throw new Error(`Document not found: ${id}`);
  }
};

// Helper functions for direct access
export async function ensureIndex() {
  console.log("✅ Using in-memory storage (no Elasticsearch needed)");
  return;
}

export async function indexEmail(email: Email) {
  return await esClient.index({
    index: 'emails',
    id: email.id || Date.now().toString(),
    document: email
  });
}

export async function searchEmails(query: any, size = 10) {
  return await esClient.search({
    index: 'emails',
    query,
    size
  });
}

export function getAllEmails() {
  return emailsStore;
}

export function clearEmails() {
  emailsStore = [];
  console.log("✅ Cleared all emails from memory");
}

export function getEmailCount() {
  return emailsStore.length;
}
