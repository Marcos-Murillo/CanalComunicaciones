"use client";

import { useState, useEffect } from "react";
import { db, collection, query, where, orderBy, onSnapshot } from "@/lib/firebase";
import type { AppUser, UserRole } from "@/lib/types";

export function useUsers(role?: UserRole) {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const constraints = role
      ? [where("role", "==", role)]
      : [];

    const q = query(collection(db, "users"), ...constraints);
    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as AppUser[];
      data.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
      setUsers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [role]);

  return { users, loading };
}
