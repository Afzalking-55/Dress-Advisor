import { db } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

export type WardrobeCategory = "Top" | "Bottom" | "Shoes" | "Other";

export type WardrobeItem = {
  id: string;
  category: WardrobeCategory;
  imageUrl: string; // ✅ NOW Storage URL, not base64
  createdAt: number;
  colorName: string;
  aiName: string;
  occasions: string[];
  clothType?: string;

  avoidOccasions?: string[];
  confidence?: number; // 0..100
};

export type OutfitPick = {
  pickedAt: number;
  occasion: string;
  mood: string;
  outfit: {
    top?: WardrobeItem;
    bottom?: WardrobeItem;
    shoes?: WardrobeItem;
    score: number;
    reason: string[];
  };
};

function userPath(uid: string, sub: string) {
  return collection(db, "users", uid, sub);
}

export async function addWardrobeItem(uid: string, item: WardrobeItem) {
  const ref = doc(userPath(uid, "wardrobe"), item.id);
  await setDoc(ref, {
    ...item,
    createdAt: item.createdAt || Date.now(),
    _createdAt: serverTimestamp(),
  });
}

export async function getWardrobe(uid: string): Promise<WardrobeItem[]> {
  const q = query(userPath(uid, "wardrobe"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as WardrobeItem);
}

export async function deleteWardrobeItem(uid: string, id: string) {
  const ref = doc(userPath(uid, "wardrobe"), id);
  await deleteDoc(ref);
}

export async function saveTodayOutfit(uid: string, data: OutfitPick) {
  const ref = doc(db, "users", uid, "meta", "today");
  await setDoc(ref, { ...data, _updatedAt: serverTimestamp() });
}

export async function getTodayOutfit(uid: string): Promise<OutfitPick | null> {
  const ref = doc(db, "users", uid, "meta", "today");
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as OutfitPick) : null;
}

export async function clearTodayOutfit(uid: string) {
  const ref = doc(db, "users", uid, "meta", "today");
  await setDoc(ref, { cleared: true, _updatedAt: serverTimestamp() });
}

export async function addHistory(uid: string, payload: OutfitPick) {
  await addDoc(userPath(uid, "history"), {
    ...payload,
    _createdAt: serverTimestamp(),
  });
}

export async function getHistory(uid: string): Promise<OutfitPick[]> {
  const q = query(userPath(uid, "history"), orderBy("pickedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as OutfitPick);
}

export async function saveUserPrefs(uid: string, prefs: any) {
  const ref = doc(db, "users", uid, "meta", "preferences");
  await setDoc(ref, { ...prefs, _updatedAt: serverTimestamp() });
}

export async function getUserPrefs(uid: string) {
  const ref = doc(db, "users", uid, "meta", "preferences");
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}
