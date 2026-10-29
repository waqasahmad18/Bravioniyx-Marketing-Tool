import { getDb } from "../src/lib/db";

async function main() {
  const t = Date.now();
  const db = await getDb();
  const n = await db.collection("bx_posts").countDocuments();
  console.log(JSON.stringify({ ok: true, posts: n, ms: Date.now() - t }));
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }));
  process.exit(1);
});
