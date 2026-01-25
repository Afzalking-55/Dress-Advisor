import { db } from "@/app/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  orderBy,
  limit,
} from "firebase/firestore";

import type { WardrobeItem, WardrobeCluster, AIDecisionLog } from "../types";
import { AI_VERSION } from "../versioning/aiVersion";

/**
 * Helper to build Firestore paths
 */
function userWardrobeRef(uid: string) {
  return collection(db, "users", uid, "wardrobe");
}
function userClustersRef(uid: string) {
  return collection(db, "users", uid, "clusters");
}
function userLogsRef(uid: string) {
  return collection(db, "users", uid, "aiLogs");
}

/**
 * -----------------------------
 * WARDROBE FUNCTIONS
 * -----------------------------
 */
export async function getWardrobe(uid: string): Promise<WardrobeItem[]> {
  const snap = await getDocs(userWardrobeRef(uid));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as WardrobeItem[];
}

export async function getWardrobeItem(
  uid: string,
  itemId: string
): Promise<WardrobeItem | null> {
  const ref = doc(db, "users", uid, "wardrobe", itemId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as any) } as WardrobeItem;
}

export async function updateWardrobeItem(
  uid: string,
  itemId: string,
  patch: Partial<WardrobeItem>
) {
  const ref = doc(db, "users", uid, "wardrobe", itemId);
  await updateDoc(ref, {
    ...patch,
    aiVersion: AI_VERSION,
    updatedAt: Date.now(),
  } as any);
}

/**
 * -----------------------------
 * CLUSTER FUNCTIONS
 * -----------------------------
 */
export async function getClusters(uid: string): Promise<WardrobeCluster[]> {
  const snap = await getDocs(userClustersRef(uid));
  return snap.docs.map((d) => d.data() as WardrobeCluster);
}

export async function createOrUpdateCluster(
  uid: string,
  cluster: WardrobeCluster
) {
  const ref = doc(db, "users", uid, "clusters", cluster.clusterId);
  await setDoc(
    ref,
    {
      ...cluster,
      updatedAt: Date.now(),
    },
    { merge: true }
  );
}

export async function addItemToCluster(
  uid: string,
  clusterId: string,
  itemId: string
) {
  const ref = doc(db, "users", uid, "clusters", clusterId);
  const snap = await getDoc(ref);

  if (!snap.exists()) throw new Error(`Cluster ${clusterId} not found`);

  const data = snap.data() as WardrobeCluster;
  const members = new Set(data.memberItemIds || []);
  members.add(itemId);

  await updateDoc(ref, {
    memberItemIds: Array.from(members),
    updatedAt: Date.now(),
  } as any);
}

/**
 * -----------------------------
 * AI LOGS FUNCTIONS
 * -----------------------------
 */
export async function writeAIDecisionLog(
  uid: string,
  log: Omit<AIDecisionLog, "aiVersion" | "createdAt">
) {
  const ref = doc(userLogsRef(uid)); // auto id
  const payload: AIDecisionLog = {
    ...log,
    aiVersion: AI_VERSION,
    createdAt: Date.now(),
  };

  await setDoc(ref, payload as any);
  return ref.id;
}

/**
 * Get latest logs (optional debug)
 */
export async function getLatestLogs(uid: string, count = 10) {
  const q = query(userLogsRef(uid), orderBy("createdAt", "desc"), limit(count));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}
