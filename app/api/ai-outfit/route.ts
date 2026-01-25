import { NextResponse } from "next/server";
import { generateOutfits } from "@/src/ai/suggest/generateOutfits";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await generateOutfits({
      occasion: body.occasion,
      mood: body.mood,
      wardrobe: body.wardrobe || [],
      preferences: body.preferences || {},
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.log("AI OUTFIT ERROR:", err);
    return NextResponse.json(
      { error: "AI outfit failed", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
