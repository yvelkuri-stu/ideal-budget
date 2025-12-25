import Dexie, { type EntityTable } from 'dexie';

// Define Interfaces
export interface Bill {
    id?: number; // Auto-incremented
    amount: number;
    currency: string;
    date: string; // ISO Date String
    storeName: string;
    category: string;
    items: Array<{ name: string; price: number; quantity?: number }>;
    receiptImage?: Blob; // Stored as Blob locally
    sharedWith?: string[]; // Array of names (e.g. friends, spouse)
    createdAt: number;
}

export interface Store {
    id?: number;
    name: string;
    address?: string;
    lastVisit?: number;
}

export interface ChatMessage {
    id?: number;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

// Initialize Database
const db = new Dexie('IdealBudgetDB') as Dexie & {
    bills: EntityTable<Bill, 'id'>;
    stores: EntityTable<Store, 'id'>;
    messages: EntityTable<ChatMessage, 'id'>;
};

// Schema Definition
db.version(1).stores({
    bills: '++id, date, storeName, category',
    stores: '++id, &name, lastVisit', // Unique name
    messages: '++id, timestamp'
});

export { db };
