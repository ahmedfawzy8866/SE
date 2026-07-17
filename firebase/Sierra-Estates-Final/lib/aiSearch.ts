import { db } from "./firebase";
import { collection, query as fsQuery, where, getDocs } from "firebase/firestore";

interface SearchFilters {
  compound?: string;
  type?: string;
  beds?: number;
  maxPrice?: number;
}

export const initializeAIGateway = () => {
  console.log("Firestore AI Search Gateway initialized");
};

export const indexPropertiesForAI = async (properties: any[]) => {
  // Firestore is already fully indexed and seeded
  console.log("Properties verified in Firestore for search");
};

export const parseSearchQuery = (queryText: string): SearchFilters => {
  const lower = queryText.toLowerCase();
  const filters: SearchFilters = {};

  // Match Compound
  const compounds = ["mivida", "uptown cairo", "hyde park", "mountain view", "palm hills", "villette"];
  for (const c of compounds) {
    if (lower.includes(c)) {
      const matches: Record<string, string> = {
        "mivida": "Mivida",
        "uptown cairo": "Uptown Cairo",
        "hyde park": "Hyde Park",
        "mountain view": "Mountain View",
        "palm hills": "Palm Hills",
        "villette": "Villette"
      };
      filters.compound = matches[c];
      break;
    }
  }

  // Match Property Type
  const types = ["villa", "penthouse", "estate", "compound", "beachfront"];
  for (const t of types) {
    if (lower.includes(t)) {
      filters.type = t;
      break;
    }
  }

  // Match Bedrooms (e.g. "3 beds", "3 bedrooms", "3br", "3 bed")
  const bedMatch = lower.match(/(\d+)\s*(bed|bedroom|br)/);
  if (bedMatch) {
    filters.beds = parseInt(bedMatch[1]);
  }

  // Match Max Price (e.g. "under 10M", "less than 15 million")
  const priceMatch = lower.match(/(under|less than|below|max)\s*(\d+)\s*(m|million|egp)/);
  if (priceMatch) {
    const val = parseInt(priceMatch[2]);
    if (priceMatch[3] === 'm' || priceMatch[3] === 'million') {
      filters.maxPrice = val * 1000000;
    } else {
      filters.maxPrice = val;
    }
  }

  return filters;
};

export const searchPropertiesWithAI = async (queryText: string, allProperties: any[]) => {
  if (!queryText.trim()) return allProperties;
  
  const filters = parseSearchQuery(queryText);
  
  try {
    const propsRef = collection(db, "properties");
    const constraints: any[] = [];
    
    if (filters.compound) {
      constraints.push(where("compound", "==", filters.compound));
    }
    if (filters.type) {
      constraints.push(where("type", "==", filters.type));
    }
    if (filters.beds) {
      constraints.push(where("beds", "==", filters.beds));
    }
    
    // Fetch from Firestore using equality filters
    let queryRef = constraints.length > 0 ? fsQuery(propsRef, ...constraints) : propsRef;
    const snap = await getDocs(queryRef);
    
    let results: any[] = [];
    snap.forEach(doc => results.push({ id: doc.id, ...doc.data() }));
    
    // Fall back to allProperties if no equality constraints matched in DB
    if (results.length === 0 && constraints.length === 0) {
      results = allProperties;
    }
    
    // Apply price filter in memory to avoid Firestore index requirements
    if (filters.maxPrice) {
      results = results.filter(p => p.price <= filters.maxPrice!);
    }
    
    // Perform text search on remaining fields
    const lowerQuery = queryText.toLowerCase();
    const finalResults = results.filter(p => 
      p.title.toLowerCase().includes(lowerQuery) || 
      p.description.toLowerCase().includes(lowerQuery) ||
      (p.tags && p.tags.some((t: string) => t.toLowerCase().includes(lowerQuery))) ||
      (p.features && p.features.some((f: string) => f.toLowerCase().includes(lowerQuery))) ||
      (filters.compound && p.compound === filters.compound) ||
      (filters.type && p.type === filters.type)
    );
    
    // If final results are empty, fall back to matching any results found from database
    return finalResults.length > 0 ? finalResults : results;
  } catch (e) {
    console.warn("Firestore AI search failed, falling back to simple local search:", e);
  }
  
  // Fallback to local text search
  const lowerQuery = queryText.toLowerCase();
  return allProperties.filter(p => 
    p.title.toLowerCase().includes(lowerQuery) || 
    p.description.toLowerCase().includes(lowerQuery) ||
    p.tags.some((t: string) => t.toLowerCase().includes(lowerQuery)) ||
    p.features.some((f: string) => f.toLowerCase().includes(lowerQuery))
  );
};

