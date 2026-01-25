export {};

/**
 * DressAI - Wardrobe AI Migration Script (V3) ✅ FINAL
 *
 * ✅ Fixes old wardrobe items that were saved without aiNormalized.
 * ✅ Calls /api/analyze-deterministic for each wardrobe item.
 *
 * ✅ Adds:
 *  - 127.0.0.1 instead of localhost (fixes Node DNS issues)
 *  - better fetch error logs
 *  - retries + timeout
 *  - prints server error body if 500
 *
 * ✅ Run:
 * 1) npm run dev
 * 2) npx ts-node scripts/migrateWardrobeAI.ts
 */

// ✅ VERY IMPORTANT: use 127.0.0.1 not localhost
const BASE_URL = "http://127.0.0.1:3000";

// ✅ Your Firebase UID
const UID = "j78l6MNjoZPmW9Nxzp9TqW6VJU42";

// ✅ how many items to migrate in one run
const LIMIT = 50;

// ✅ timeouts
const TIMEOUT_MS = 45000;

// ✅ retries
const RETRIES = 2;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function withTimeout<T>(promise: Promise<T>, ms: number) {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
    promise
      .then((v) => {
        clearTimeout(t);
        resolve(v);
      })
      .catch((e) => {
        clearTimeout(t);
        reject(e);
      });
  });
}

async function checkServer() {
  try {
    const res = await withTimeout(fetch(`${BASE_URL}/`), 6000);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    console.log(`✅ Server reachable at ${BASE_URL}`);
    return true;
  } catch (e: any) {
    console.log(`❌ Next server not reachable at ${BASE_URL}`);
    console.log(`   Start server first: npm run dev`);
    console.log(`   Error: ${e?.message || e}`);
    return false;
  }
}

async function safeJSON(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function getJSON(path: string) {
  const url = `${BASE_URL}${path}`;
  const res = await withTimeout(fetch(url), TIMEOUT_MS);
  const json = await safeJSON(res);

  if (!res.ok) {
    throw new Error(
      json?.error || json?.details || `GET failed ${res.status}: ${path}`
    );
  }

  return json;
}

async function postJSON(path: string, body: any) {
  const url = `${BASE_URL}${path}`;

  let res: Response;
  try {
    res = await withTimeout(
      fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      }),
      TIMEOUT_MS
    );
  } catch (e: any) {
    // ✅ most important debug info
    throw new Error(`NETWORK FETCH FAILED: ${e?.message || e}`);
  }

  const json = await safeJSON(res);

  if (!res.ok) {
    const details =
      json?.details || json?.error || `POST failed ${res.status}: ${path}`;
    throw new Error(details);
  }

  return json;
}

async function postWithRetry(path: string, body: any, retries = RETRIES) {
  let lastErr: any = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await postJSON(path, body);
    } catch (e: any) {
      lastErr = e;
      console.log(`   ⚠️ Attempt ${attempt + 1}/${retries + 1} failed: ${e?.message || e}`);
      if (attempt < retries) await sleep(1200);
    }
  }

  throw lastErr;
}

function needsMigration(item: any) {
  const cat = String(item?.aiNormalized?.attributes?.category || "").toLowerCase();
  if (!item?.aiNormalized) return true;
  if (!cat || cat === "other") return true;
  return false;
}

async function main() {
  console.log("\n========================================");
  console.log("🔥 DressAI Wardrobe Migration Script (V3)");
  console.log("========================================\n");

  const ok = await checkServer();
  if (!ok) process.exit(1);

  console.log("\n🔎 Fetching wardrobe items...");

  const list = await getJSON(`/api/wardrobe/list?uid=${UID}`);
  const items: any[] = Array.isArray(list?.items) ? list.items : [];

  if (!items.length) {
    console.log("❌ No wardrobe items found.");
    process.exit(0);
  }

  console.log(`✅ Found ${items.length} wardrobe items total.\n`);

  const toFix = items.filter(needsMigration).slice(0, LIMIT);

  if (!toFix.length) {
    console.log("✅ Nothing to migrate. All items already have aiNormalized.");
    process.exit(0);
  }

  console.log(`⚠️ Items needing AI normalize: ${toFix.length}/${items.length}\n`);

  let success = 0;
  let fail = 0;

  for (let i = 0; i < toFix.length; i++) {
    const it = toFix[i];
    const itemId = it.id;
    const imageUrl = it.imageUrl;

    if (!itemId || !imageUrl) {
      console.log(`⏭️ Skipping item missing id/imageUrl:`, it);
      continue;
    }

    console.log(`\n[${i + 1}/${toFix.length}] 🧠 Migrating item: ${itemId}`);
    console.log(`Image: ${imageUrl}`);

    try {
      const res = await postWithRetry("/api/analyze-deterministic", {
        uid: UID,
        itemId,
        imageUrl,
      });

      const cat = res?.aiNormalized?.attributes?.category || "unknown";
      const label = res?.aiNormalized?.topLabel || "unknown";

      console.log(`✅ Updated -> category: ${cat} | label: ${label}`);
      success++;
    } catch (e: any) {
      console.log(`❌ Failed to migrate item ${itemId}: ${e?.message || e}`);
      fail++;
    }
  }

  console.log("\n========================================");
  console.log("✅ Migration completed!");
  console.log(`✅ Success: ${success}`);
  console.log(`❌ Failed: ${fail}`);
  console.log("Now run: npx ts-node scripts/testOutfits.ts");
  console.log("========================================\n");
}

main().catch((e) => {
  console.error("\n❌ MIGRATION FAILED:", e?.message || e);
  process.exit(1);
});
