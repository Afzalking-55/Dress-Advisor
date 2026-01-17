import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function uploadWardrobeImage(uid: string, file: File) {
  const path = `users/${uid}/wardrobe/${Date.now()}-${file.name}`;
  const fileRef = ref(storage, path);

  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);
  return url;
}
