import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: Request) {
  try {
    // ✅ env check
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      console.error("❌ Missing Cloudinary ENV");
      return NextResponse.json(
        { error: "Cloudinary ENV missing" },
        { status: 500 }
      );
    }

    const contentType = req.headers.get("content-type") || "";

    let fileBase64: string | null = null;

    // ✅ Case 1: JSON request
    if (contentType.includes("application/json")) {
      const body = await req.json().catch(() => null);
      fileBase64 = body?.file || null;
    }

    // ✅ Case 2: FormData request
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file") as File | null;

      if (!file) {
        return NextResponse.json(
          { error: "Missing file in FormData" },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fileBase64 = `data:${file.type};base64,${buffer.toString("base64")}`;
    }

    if (!fileBase64) {
      return NextResponse.json(
        { error: "Missing file data" },
        { status: 400 }
      );
    }

    console.log("✅ Uploading to Cloudinary...");

    const uploadRes = await cloudinary.uploader.upload(fileBase64, {
      folder: "dressai/wardrobe",
      resource_type: "image",
    });

    console.log("✅ Uploaded:", uploadRes.secure_url);

    return NextResponse.json({
      url: uploadRes.secure_url,
      publicId: uploadRes.public_id,
    });
  } catch (err: any) {
    console.error("❌ Cloudinary upload error:", err);
    return NextResponse.json(
      { error: "Cloudinary upload failed", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
