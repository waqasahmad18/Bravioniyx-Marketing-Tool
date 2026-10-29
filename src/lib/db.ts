import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "fast_and_slow_pos";

export const LEADS = "bx_leads";
export const FUNNELS = "bx_funnels";
export const POSTS = "bx_posts";
export const CONNECTIONS = "bx_connections";
export const ASSISTANT = "bx_assistant";
export const BLOGS = "bx_blogs";

let client: MongoClient | null = null;
let connectPromise: Promise<MongoClient> | null = null;
let indexesReady: Promise<void> | null = null;

function resetClient() {
  client = null;
  connectPromise = null;
  indexesReady = null;
}

export async function getDb(): Promise<Db> {
  if (!uri) throw new Error("MongoDB is not configured.");

  if (!client) {
    if (!connectPromise) {
      const next = new MongoClient(uri, {
        maxPoolSize: 8,
        minPoolSize: 0,
        maxIdleTimeMS: 45_000,
        connectTimeoutMS: 20_000,
        serverSelectionTimeoutMS: 20_000,
        // Avoid hanging forever on flaky Atlas / DNS
        socketTimeoutMS: 45_000,
      });
      connectPromise = next
        .connect()
        .then((connected) => {
          client = connected;
          return connected;
        })
        .catch((error) => {
          // Critical: clear failed promise so the next request can retry
          resetClient();
          try {
            void next.close();
          } catch {
            /* ignore */
          }
          throw error;
        });
    }
    client = await connectPromise;
  }

  const db = client.db(dbName);
  if (!indexesReady) {
    indexesReady = Promise.all([
      db.collection(POSTS).createIndex({ status: 1, scheduledFor: 1 }),
      db.collection(POSTS).createIndex({ funnelId: 1 }),
      db.collection(BLOGS).createIndex({ status: 1, publishedAt: -1 }),
      db.collection(BLOGS).createIndex({ slug: 1 }, { unique: true }),
      db.collection(FUNNELS).createIndex({ createdAt: -1 }),
    ])
      .then(() => undefined)
      .catch(() => undefined);
  }
  return db;
}

/** Soft helper for pages — returns null instead of crashing the route. */
export async function tryGetDb(): Promise<Db | null> {
  try {
    return await getDb();
  } catch (error) {
    console.error("[mongo]", error instanceof Error ? error.message : error);
    return null;
  }
}
