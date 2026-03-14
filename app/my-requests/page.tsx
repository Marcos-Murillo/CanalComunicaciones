"use client";

import { AppShell } from "@/components/app-shell";
import { MyEventsList } from "@/components/my-events-list";

export default function MyRequestsPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mis Peticiones</h1>
          <p className="text-muted-foreground">
            Historial de peticiones de eventos que has enviado
          </p>
        </div>
        <MyEventsList />
      </div>
    </AppShell>
  );
}
