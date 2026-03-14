"use server";

import {
  db,
  auth,
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  Timestamp,
  createUserWithEmailAndPassword,
} from "./firebase";
import type { EventStatus, EventFormData, UserRole } from "./types";

// ── Events ──────────────────────────────────────────────────────────────────

export async function createEvent(
  data: EventFormData,
  userId: string,
  userName: string,
  userArea: string,
  managerColor: string
) {
  try {
    const docRef = await addDoc(collection(db, "events"), {
      name: data.name,
      description: data.description,
      plannedDate: Timestamp.fromDate(data.plannedDate),
      schedule: data.schedule || null,
      place: data.place || null,
      status: "pending" as EventStatus,
      submittedBy: userId,
      submittedByName: userName,
      submittedByArea: userArea,
      managerColor,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating event:", error);
    return { success: false, error: "Error al crear el evento" };
  }
}

export async function updateEvent(eventId: string, data: Partial<EventFormData>) {
  try {
    const eventRef = doc(db, "events", eventId);
    const updateData: Record<string, unknown> = { ...data, updatedAt: Timestamp.now() };
    if (data.plannedDate) {
      updateData.plannedDate = Timestamp.fromDate(data.plannedDate);
    }
    await updateDoc(eventRef, updateData);
    return { success: true };
  } catch (error) {
    console.error("Error updating event:", error);
    return { success: false, error: "Error al actualizar el evento" };
  }
}

export async function updateEventStatus(
  eventId: string,
  status: EventStatus,
  adminName: string,
  rejectionReason?: string
) {
  try {
    const eventRef = doc(db, "events", eventId);
    const updateData: Record<string, unknown> = { status, updatedAt: Timestamp.now() };
    if (rejectionReason) updateData.rejectionReason = rejectionReason;
    await updateDoc(eventRef, updateData);

    // Fetch event to get submittedBy for notification
    const eventSnap = await getDoc(eventRef);
    if (eventSnap.exists()) {
      const eventData = eventSnap.data();
      const statusLabel =
        status === "completed" ? "marcado como realizado" :
        status === "rejected" ? "rechazado" :
        status === "approved" ? "aprobado" : status;

      await addDoc(collection(db, "notifications"), {
        userId: eventData.submittedBy,
        eventId,
        eventName: eventData.name,
        type: "status_change",
        message: `Tu evento "${eventData.name}" fue ${statusLabel} por ${adminName}${rejectionReason ? `: ${rejectionReason}` : ""}`,
        read: false,
        createdAt: Timestamp.now(),
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating event status:", error);
    return { success: false, error: "Error al actualizar el estado" };
  }
}

export async function addComment(eventId: string, content: string, adminName: string) {
  try {
    const commentsRef = collection(db, "events", eventId, "comments");
    await addDoc(commentsRef, {
      content,
      createdAt: Timestamp.now(),
      createdBy: adminName,
      createdByName: adminName,
    });

    // Notification to manager
    const eventSnap = await getDoc(doc(db, "events", eventId));
    if (eventSnap.exists()) {
      const eventData = eventSnap.data();
      await addDoc(collection(db, "notifications"), {
        userId: eventData.submittedBy,
        eventId,
        eventName: eventData.name,
        type: "comment",
        message: `${adminName} comentó en tu evento "${eventData.name}": ${content}`,
        read: false,
        createdAt: Timestamp.now(),
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error adding comment:", error);
    return { success: false, error: "Error al agregar comentario" };
  }
}

// ── Users ────────────────────────────────────────────────────────────────────

const MANAGER_COLORS = [
  "#e74c3c", "#3498db", "#2ecc71", "#f39c12", "#9b59b6",
  "#1abc9c", "#e67e22", "#34495e", "#e91e63", "#00bcd4",
];

export async function createUser(data: {
  name: string;
  cedula: string;
  area: string;
  password: string;
  role: UserRole;
  createdBy: string;
}) {
  try {
    const email = `${data.cedula}@univalle.edu.co`;
    const userCredential = await createUserWithEmailAndPassword(auth, email, data.password);
    const uid = userCredential.user.uid;

    let color: string | undefined;
    if (data.role === "manager") {
      const managersSnap = await getDocs(
        query(collection(db, "users"), where("role", "==", "manager"))
      );
      color = MANAGER_COLORS[managersSnap.size % MANAGER_COLORS.length];
    }

    await setDoc(doc(db, "users", uid), {
      name: data.name,
      cedula: data.cedula,
      area: data.area,
      role: data.role,
      createdBy: data.createdBy,
      createdAt: Timestamp.now(),
      ...(color ? { color } : {}),
    });

    return { success: true, id: uid };
  } catch (error: unknown) {
    console.error("Error creating user:", error);
    const msg = error instanceof Error ? error.message : "Error al crear usuario";
    return { success: false, error: msg };
  }
}

export async function markNotificationsRead(notificationIds: string[]) {
  try {
    await Promise.all(
      notificationIds.map((id) =>
        updateDoc(doc(db, "notifications", id), { read: true })
      )
    );
    return { success: true };
  } catch (error) {
    console.error("Error marking notifications:", error);
    return { success: false };
  }
}
