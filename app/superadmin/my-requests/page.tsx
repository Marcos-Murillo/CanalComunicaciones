"use client";

import { MyEventsList } from "@/components/my-events-list";

export default function SuperAdminMyRequestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mis Peticiones</h1>
        <p className="text-muted-foreground">Historial de peticiones de eventos que has enviado</p>
      </div>
      <MyEventsList />
    </div>
  );
}
