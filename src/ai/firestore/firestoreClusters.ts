import { db } from "@/app/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";

export type WardrobeCluster = {
  clusterId: string;
  label: string;
  representativeItemId: string;
  memberItemIds: string[];
  createdAt: number;
  updatedAt: number;
};

export async function getCluster(uid: string, clusterId: string) {
  const ref = doc(db, "users", uid, "clusters", clusterId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as WardrobeCluster;
}

export async function createCluster(
  uid: string,
  cluster: WardrobeCluster
) {
  const ref = doc(db, "users", uid, "clusters", cluster.clusterId);
  await setDoc(ref, cluster, { merge: true });
  return cluster;
}

export async function addMemberToCluster(
  uid: string,
  clusterId: string,
  itemId: string
) {
  const ref = doc(db, "users", uid, "clusters", clusterId);

  await updateDoc(ref, {
    memberItemIds: arrayUnion(itemId),
    updatedAt: Date.now(),
  });
}

export async function setRepresentative(
  uid: string,
  clusterId: string,
  representativeItemId: string
) {
  const ref = doc(db, "users", uid, "clusters", clusterId);

  await updateDoc(ref, {
    representativeItemId,
    updatedAt: Date.now(),
  });
}
