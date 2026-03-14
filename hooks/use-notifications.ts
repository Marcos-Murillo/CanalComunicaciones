"use client";

import { useState, useEffect } from "react";
import { db, collection, query, where, orderBy, onSnapshot } from "@/lib/firebase";
import type { Notification } from "@/lib/types";

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Notification[];
      data.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    });

    return () => unsubscribe();
  }, [userId]);

  return { notifications, unreadCount };
}
