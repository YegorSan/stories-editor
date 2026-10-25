import type { StoryDoc } from "./types";

export type StoryDraft = {
  id: string;
  title: string;
  updatedAt: number;
  doc: StoryDoc;
};

const DB_NAME = "kadr";
const STORE = "drafts";
const VERSION = 1;
const MAX_DRAFTS = 24;
export const DRAFTS_EVENT = "kadr-drafts";

function notify(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(DRAFTS_EVENT));
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB"));
  });
}

function reqToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB"));
  });
}

export async function listDrafts(): Promise<StoryDraft[]> {
  const db = await openDb();
  const rows = await reqToPromise(
    db.transaction(STORE, "readonly").objectStore(STORE).getAll(),
  );
  db.close();
  return (rows as StoryDraft[]).sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getDraft(id: string): Promise<StoryDraft | null> {
  const db = await openDb();
  const row = await reqToPromise(
    db.transaction(STORE, "readonly").objectStore(STORE).get(id),
  );
  db.close();
  return (row as StoryDraft | undefined) ?? null;
}

export async function saveDraft(draft: StoryDraft): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(STORE, "readwrite");
  const store = tx.objectStore(STORE);
  await reqToPromise(store.put(draft));
  const all = (await reqToPromise(store.getAll())) as StoryDraft[];
  if (all.length > MAX_DRAFTS) {
    const extra = [...all]
      .sort((a, b) => a.updatedAt - b.updatedAt)
      .slice(0, all.length - MAX_DRAFTS);
    await Promise.all(extra.map((item) => reqToPromise(store.delete(item.id))));
  }
  db.close();
  notify();
}

export async function deleteDraft(id: string): Promise<void> {
  const db = await openDb();
  await reqToPromise(db.transaction(STORE, "readwrite").objectStore(STORE).delete(id));
  db.close();
  notify();
}
