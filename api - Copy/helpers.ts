// This file simulates a database for demonstration purposes.
// In a real production environment, you would replace this with a connection
// to a real database like PostgreSQL, MySQL, or a serverless database like
// Vercel Postgres, Neon, or PlanetScale.

import { Code, DesignLayout } from "../types";

// In-memory store
const codes: Map<string, Code> = new Map();

// --- Code Generation ---
export const generateUniqueCode = (): string => {
  let newCode: string;
  const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789'; // Omitted 0 and O for clarity
  do {
    newCode = '';
    for (let i = 0; i < 6; i++) {
        newCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (codes.has(newCode));
  return newCode;
};

// --- Database Functions ---
export const db = {
  createCode: async (details: {
    durationSeconds: number;
    emailLimit: number;
    hasDesignStudio: boolean;
  }): Promise<Code> => {
    const code = generateUniqueCode();
    const newCode: Code = {
      code,
      expiresAt: 0, // Will be set on activation
      durationSeconds: details.durationSeconds,
      used: false,
      emailLimit: details.emailLimit,
      emailsSent: 0,
      hasDesignStudio: details.hasDesignStudio,
      designLayout: null,
    };
    codes.set(code, newCode);
    console.log(`[DB Sim] Created code: ${code} (Duration: ${details.durationSeconds}s, Email Limit: ${details.emailLimit}, Has Studio: ${details.hasDesignStudio})`);
    return newCode;
  },

  findCode: async (code: string): Promise<Code | null> => {
    const found = codes.get(code);
    return found || null;
  },
  
  findCodeByStripeSessionId: async (stripeSessionId: string): Promise<Code | null> => {
      for (const code of codes.values()) {
          // @ts-ignore - temp property for simulation
          if (code.stripeSessionId === stripeSessionId) {
              return code;
          }
      }
      return null;
  },

  activateCode: async (code: string): Promise<Code | null> => {
    const foundCode = codes.get(code);
    if (!foundCode) return null;

    if (foundCode.used) {
      return foundCode.expiresAt > Date.now() ? foundCode : null;
    }
    
    foundCode.used = true;
    foundCode.expiresAt = Date.now() + foundCode.durationSeconds * 1000;
    codes.set(code, foundCode);
    console.log(`[DB Sim] Activated code: ${code}, expires at ${new Date(foundCode.expiresAt).toLocaleString()}`);
    return foundCode;
  },
  
  linkStripeSession: (code: string, stripeSessionId: string) => {
    const foundCode = codes.get(code);
    if (foundCode) {
      // @ts-ignore - temp property for simulation
      foundCode.stripeSessionId = stripeSessionId;
      codes.set(code, foundCode);
    }
  },

  checkAndIncrementEmailCount: async (code: string): Promise<boolean> => {
    const foundCode = codes.get(code);
    if (!foundCode) return false;
    if (foundCode.emailsSent >= foundCode.emailLimit) {
      console.log(`[DB Sim] Email limit reached for code ${code}`);
      return false;
    }
    foundCode.emailsSent += 1;
    codes.set(code, foundCode);
    console.log(`[DB Sim] Email count for ${code} is now ${foundCode.emailsSent}/${foundCode.emailLimit}`);
    return true;
  },

  saveDesign: async (code: string, designLayout: DesignLayout): Promise<boolean> => {
    const foundCode = codes.get(code);
    if (!foundCode) return false;
    foundCode.designLayout = designLayout;
    codes.set(code, foundCode);
    console.log(`[DB Sim] Saved design for code ${code}`);
    return true;
  },
};