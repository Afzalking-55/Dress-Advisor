import { NextResponse } from "next/server";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = String(searchParams.get("uid") || "");

    if (!uid) return NextResponse.json({ error: "uid required" }, { status: 400 });

    const wardrobeRef = collection(db, "users", uid, "wardrobe");
    const snap = await getDocs(wardrobeRef);

    const items = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as any),
    }));

    return NextResponse.json({ ok: true, items });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Wardrobe list failed", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
