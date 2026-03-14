import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { EventsList } from "@/components/event-list";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Vista de Eventos | Comunicaciones Cultura Univalle",
  description: "Gestión y seguimiento de eventos culturales",
};

function EventsLoading() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-10 w-64" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-lg border bg-card p-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function EventsPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vista de Eventos</h1>
          <p className="text-muted-foreground">
            Gestiona y da seguimiento a los eventos culturales
          </p>
        </div>

        <Suspense fallback={<EventsLoading />}>
          <EventsList />
        </Suspense>
      </div>
    </AppShell>
  );
}
