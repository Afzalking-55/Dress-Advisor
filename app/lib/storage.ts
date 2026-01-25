export async function uploadWardrobeImage(uid: string, file: File) {
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });

  const res = await fetch("/api/cloudinary-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file: base64 }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("Cloudinary error response:", data);
    throw new Error(data?.error || "Cloudinary upload failed");
  }

  return data.url as string;
}
