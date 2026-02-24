import { openDB } from 'idb';

const DB_NAME = 'pralay-offline-db';
const STORE_NAME = 'reports';

export const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
};

export const saveOfflineReport = async (report: any) => {
  const db = await initDB();
  await db.put(STORE_NAME, report);
};