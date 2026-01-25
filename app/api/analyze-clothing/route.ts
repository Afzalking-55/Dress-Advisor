import { NextResponse } from "next/server";

export const runtime = "nodejs";

type HFResponse = {
  label?: string;
  score?: number;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { imageBase64 } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { ok: false, error: "imageBase64 missing" },
        { status: 400 }
      );
    }

    const HF_TOKEN = process.env.HF_TOKEN;
    if (!HF_TOKEN) {
      return NextResponse.json({
        ok: true,
        mode: "fallback",
        detected: {
          category: "Top",
          color: "Unknown",
          notes: "HF_TOKEN missing → fallback mode",
        },
      });
    }

    // ✅ EXAMPLE HF model (you can replace)
    const MODEL_URL =
      "https://api-inference.huggingface.co/models/google/vit-base-patch16-224";

    // convert base64 to buffer
    const base64Data = imageBase64.split(",").pop()!;
    const buffer = Buffer.from(base64Data, "base64");

    const res = await fetch(MODEL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/octet-stream",
      },
      body: buffer,
    });

    const text = await res.text();

    // ✅ If HF returns HTML error
    if (text.trim().startsWith("<")) {
      return NextResponse.json({
        ok: true,
        mode: "fallback",
        detected: {
          category: "Other",
          color: "Unknown",
          notes: "HF returned HTML → fallback mode",
        },
      });
    }

    let json: any = null;
    try {
      json = JSON.parse(text);
    } catch {
      return NextResponse.json({
        ok: true,
        mode: "fallback",
        detected: {
          category: "Other",
          color: "Unknown",
          notes: "HF JSON parse failed → fallback",
        },
      });
    }

    // HF usually returns labels list
    const top = Array.isArray(json) ? (json[0] as HFResponse) : null;

    return NextResponse.json({
      ok: true,
      mode: "hf",
      hf: json,
      detected: {
        category: "Top",
        color: "Unknown",
        notes: `HF label: ${top?.label ?? "unknown"}`,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "server error" },
      { status: 500 }
    );
  }
}
