/**
 * DressAI / DressAdvisor — Outfit Engine End-to-End Tester (V2)
 *
 * ✅ Tests:
 * 1) Calls /api/outfits/chat   -> gets top 3 outfits (FULL CLOTH DETAILS)
 * 2) Calls /api/outfits/rate   -> rates outfit #1 as 5⭐
 * 3) Calls /api/outfits/chat again -> should show personalized = true
 */

const BASE_URL = "http://localhost:3000";
const UID = "j78l6MNjoZPmW9Nxzp9TqW6VJU42";

async function post(path: string, body: any) {
  const url = `${BASE_URL}${path}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error("\n❌ REQUEST FAILED:", path);
    console.error("Status:", res.status);
    console.error("Response:", json);
    throw new Error(json?.error || `Request failed with status ${res.status}`);
  }

  return json;
}

function showItem(it: any) {
  if (!it) return "null";
  return `${it.aiName || "Unknown"} (${it.category || "?"}, ${it.colorName || "?"})`;
}

function printOutfits(outfits: any[]) {
  outfits.forEach((o: any, idx: number) => {
    console.log(`\n#${idx + 1} ${o.title}`);
    console.log("Score:", o.score);

    console.log("Top:", showItem(o.items?.top));
    console.log("Bottom:", showItem(o.items?.bottom));
    console.log("Shoes:", showItem(o.items?.shoes));

    if (o.items?.top?.imageUrl) console.log("Top Image:", o.items.top.imageUrl);
    if (o.items?.bottom?.imageUrl) console.log("Bottom Image:", o.items.bottom.imageUrl);

    console.log("Reasons:", o.reasons);
    console.log("Warnings:", o.warnings);

    if (o.personalization) {
      console.log("Personalization:", o.personalization);
    }
  });
}

async function main() {
  console.log("\n==============================");
  console.log("✅ DressAI Outfit Engine Tester (V2)");
  console.log("==============================\n");

  // 1) CHAT
  console.log("1) Calling /api/outfits/chat ...");

  const chat1 = await post("/api/outfits/chat", {
    uid: UID,
    message: "Tomorrow is a wedding. I want to look premium but not steal attention.",
  });

  console.log("\n--- Chat Response ---");
  console.log("Occasion intent:", chat1?.intent?.occasion);
  console.log("Personalized:", chat1?.assistant?.personalized);
  console.log("\nAssistant Intro:\n", chat1?.assistant?.intro);

  const outfits1 = chat1?.assistant?.outfits || [];
  if (!outfits1.length) throw new Error("No outfits returned.");

  console.log("\n--- Top 3 Outfits (First Call) ---");
  printOutfits(outfits1);

  // 2) RATE outfit #1 (BUT rating API still needs IDs only)
  console.log("\n2) Rating outfit #1 (5⭐) ...");

  const chosen = outfits1[0];
  const occasion = chat1?.intent?.occasion || "wedding_guest";

  const rateRes = await post("/api/outfits/rate", {
    uid: UID,
    occasion,
    outfit: {
      top: chosen?.items?.top?.id || null,
      bottom: chosen?.items?.bottom?.id || null,
      shoes: chosen?.items?.shoes?.id || null,
      outer: chosen?.items?.outer?.id || null,
      accessory: chosen?.items?.accessory?.id || null,
    },
    rating: 5,
  });

  console.log("\n--- Rate Response ---");
  console.log(rateRes);

  // 3) CHAT again
  console.log("\n3) Calling /api/outfits/chat again ...");

  const chat2 = await post("/api/outfits/chat", {
    uid: UID,
    message: "Same wedding. Give me the best outfit again.",
  });

  console.log("\n--- Second Chat Response ---");
  console.log("Occasion intent:", chat2?.intent?.occasion);
  console.log("Personalized:", chat2?.assistant?.personalized);

  const outfits2 = chat2?.assistant?.outfits || [];
  if (!outfits2.length) throw new Error("No outfits returned second time.");

  console.log("\n--- Top 3 Outfits (Second Call) ---");
  printOutfits(outfits2);

  console.log("\n✅ TEST COMPLETED SUCCESSFULLY 🎉");
}

main().catch((e) => {
  console.error("\n❌ TEST FAILED:", e?.message || e);
  process.exit(1);
});