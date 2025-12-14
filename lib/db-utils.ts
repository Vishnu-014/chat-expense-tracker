import clientPromise from './mongodb';

export const DB_NAME = 'expense_tracker_db';

export const COLLECTIONS = {
  MESSAGES: 'messages',
  USERS: 'users',
  BUDGETS: 'budgets',
  CATEGORIES: 'categories',
  RECURRING_TRANSACTIONS: 'recurring_transactions',
};

export async function getDatabase() {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    console.log('📊 Connected to database:', DB_NAME);
    return db;
  } catch (error) {
    console.error('❌ Database connection error:', error);
    throw error;
  }
}

export async function getCollection(collectionName: string) {
  try {
    const db = await getDatabase();
    const collection = db.collection(collectionName);
    console.log('📁 Accessing collection:', collectionName);
    return collection;
  } catch (error) {
    console.error('❌ Collection access error:', error);
    throw error;
  }
}
