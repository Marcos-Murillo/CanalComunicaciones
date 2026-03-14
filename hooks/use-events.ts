"use client";

import { useState, useEffect } from "react";
import { db, collection, onSnapshot, query, orderBy, where } from "@/lib/firebase";
import type { Event } from "@/lib/types";

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setEvents(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Event[]);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError("Error al cargar los eventos");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  return { events, loading, error };
}

export function useMyEvents(userId: string | undefined) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    const q = query(
      collection(db, "events"),
      where("submittedBy", "==", userId)
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Event[];
        // sort client-side to avoid composite index requirement
        data.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
        setEvents(data);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError("Error al cargar tus peticiones");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [userId]);

  return { events, loading, error };
}

export function filterEventsByStatus(events: Event[], filter: string) {
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  switch (filter) {
    case "pending": return events.filter((e) => e.status === "pending");
    case "week": return events.filter((e) => {
      const d = e.plannedDate.toDate();
      return d >= now && d <= weekFromNow;
    });
    case "both": return events.filter((e) => {
      const d = e.plannedDate.toDate();
      return e.status === "pending" && d >= now && d <= weekFromNow;
    });
    case "todo": return events.filter((e) => e.status === "pending" || e.status === "approved");
    case "completed": return events.filter((e) => e.status === "completed");
    default: return events;
  }
}

export function filterEventsByDateRange(
  events: Event[],
  startDate: Date | undefined,
  endDate: Date | undefined
) {
  if (!startDate && !endDate) return events;
  return events.filter((e) => {
    const d = e.plannedDate.toDate();
    if (startDate && endDate) return d >= startDate && d <= endDate;
    if (startDate) return d >= startDate;
    if (endDate) return d <= endDate;
    return true;
  });
}

export function canEditEvent(event: Event) {
  const minDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
  return event.plannedDate.toDate() > minDate;
}
