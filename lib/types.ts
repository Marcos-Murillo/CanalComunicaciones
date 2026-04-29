import { Timestamp } from "firebase/firestore";

export type UserRole = "superadmin" | "admin" | "manager";
export type EventStatus = "pending" | "approved" | "rejected" | "completed";

export interface AppUser {
  id: string;
  name: string;
  cedula: string;
  area: string;
  role: UserRole;
  createdBy: string;
  createdAt: Timestamp;
  color?: string;
  password?: string;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  plannedDate: Timestamp;
  schedule?: string;
  place?: string;
  imageUrl?: string;
  status: EventStatus;
  rejectionReason?: string;
  submittedBy: string;
  submittedByName: string;
  submittedByArea: string;
  managerColor?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Comment {
  id: string;
  eventId: string;
  content: string;
  createdAt: Timestamp;
  createdBy: string;
  createdByName: string;
}

export interface Notification {
  id: string;
  userId: string;
  eventId: string;
  eventName: string;
  type: "comment" | "status_change";
  message: string;
  read: boolean;
  createdAt: Timestamp;
}

export interface EventFormData {
  name: string;
  description: string;
  plannedDate: Date;
  schedule?: string;
  place?: string;
  imageUrl?: string;
}
