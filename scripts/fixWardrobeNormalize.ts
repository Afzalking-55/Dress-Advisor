import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";
import crypto from "crypto";

// ✅ same config you use inside app/lib/firebase.ts
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

if (!getApps().length) initializeApp(firebaseConfig);
const db = getFirestore();

const UID = "j78l6MNjoZPmW9Nxzp9TqW6VJU42";

// ✅ category mapper (smart)
function mapCategory(label: string) {
  const l = String(label || "").toLowerCase();

  if (
    l.includes("shoe") ||
    l.includes("sneaker") ||
    l.includes("boot") ||
    l.includes("loafer") ||
    l.includes("heel") ||
    l.includes("sandal")
  ) return "Shoes";

  if (
    l.includes("pant") ||
    l.includes("jean") ||
    l.includes("trouser") ||
    l.includes("short") ||
    l.includes("skirt") ||
    l.includes("legging") ||
    l.includes("cargo")
  ) return "Bottom";

  if (
    l.includes("shirt") ||
    l.includes("t-shirt") ||
    l.includes("tshirt") ||
    l.includes("hoodie") ||
    l.includes("jacket") ||
    l.includes("coat") ||
    l.includes("sweater") ||
    l.includes("kurta")
  ) return "Top";

  return "Other";
}

function safeColorName(x: any) {
  const c = String(x || "").trim();
  if (!c) return "Unknown";
  return c;
}

function guessFormality(label: string) {
  const l = String(label || "").toLowerCase();

  if (l.includes("blazer") || l.includes("suit")) return 0.92;
  if (l.includes("formal") || l.includes("shirt")) return 0.72;
  if (l.includes("jeans") || l.includes("cargo")) return 0.45;
  if (l.includes("tshirt") || l.includes("t-shirt")) return 0.38;
  return 0.5;
}

async function main() {
  console.log("\n==============================");
  console.log("✅ Fix Wardrobe Normalization Script");
  console.log("==============================\n");

  const wardrobeRef = collection(db, "users", UID, "wardrobe");
  const snap = await getDocs(wardrobeRef);

  console.log("Found wardrobe docs:", snap.size);

  let updated = 0;

  for (const d of snap.docs) {
    const data: any = d.data();

    const aiName = data.aiName || data.aiNormalized?.aiName || "Outfit";
    const clothType = data.clothType || data.aiNormalized?.topLabel || "outfit";
    const colorName = safeColorName(data.colorName);

    const cat = data.category || mapCategory(aiName + " " + clothType);
    const formality = data.aiNormalized?.attributes?.formality ?? guessFormality(aiName + " " + clothType);

    const ref = doc(db, "users", UID, "wardrobe", d.id);

    await updateDoc(ref, {
      category: cat,
      clothType: clothType,
      aiName: aiName,
      colorName: colorName,

      // ✅ ensure aiNormalized is filled for scorer & outfit engine
      aiNormalized: {
        ...(data.aiNormalized || {}),
        topLabel: clothType,
        topConfidence: data.aiNormalized?.topConfidence ?? (data.confidence ? data.confidence / 100 : 0.75),
        attributes: {
          ...(data.aiNormalized?.attributes || {}),
          category: cat.toLowerCase(),
          colors: [String(colorName).toLowerCase()],
          formality,
          styleTags: data.aiNormalized?.attributes?.styleTags || [],
        },
      },

      updatedAt: Date.now(),
    });

    updated++;
    console.log(`✅ Updated ${d.id} -> ${cat} / ${aiName}`);
  }

  console.log("\n✅ DONE.");
  console.log("Updated docs:", updated);
}

main().catch((e) => {
  console.error("\n❌ Script failed:", e);
  process.exit(1);
});
