import { useEffect, useMemo, useState } from "react";
import { auth } from "../lib/firebase";
import { getWardrobe, deleteWardrobeItem } from "../lib/db";

type Category = "All" | "Top" | "Bottom" | "Shoes" | "Other";

export function useWardrobe() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  // ✅ NEW — category filter
  const [filter, setFilter] = useState<Category>("All");

  /* ---------------- Load wardrobe ---------------- */

  useEffect(() => {
    return auth.onAuthStateChanged(async (user) => {
      if (!user) return;

      try {
        const list = await getWardrobe(user.uid);
        setItems(list || []);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  /* ---------------- Filtered items ---------------- */

  const filteredItems = useMemo(() => {
    if (filter === "All") return items;
    return items.filter((i) => i.category === filter);
  }, [items, filter]);

  /* ---------------- Delete item ---------------- */

  const remove = async () => {
    if (!deleteTarget) return;
    const user = auth.currentUser;
    if (!user) return;

    await deleteWardrobeItem(user.uid, deleteTarget.id);

    setItems((prev) => prev.filter((x) => x.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  /* ---------------- Public API ---------------- */

  return {
    // items
    items: filteredItems,
    rawItems: items,

    loading,

    // selection
    selected,
    setSelected,

    // delete
    deleteTarget,
    setDeleteTarget,
    remove,

    // filtering
    filter,
    setFilter,
  };
}
