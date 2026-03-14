"use client";

import * as React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Download, Search } from "lucide-react";
import Papa from "papaparse";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EventCard } from "@/components/event-card";
import { useEvents, filterEventsByStatus } from "@/hooks/use-events";
import type { Event } from "@/lib/types";

function EventsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-lg border bg-card p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-8 w-8" />
          </div>
          <Skeleton className="h-10 w-full" />
          <div className="flex gap-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ filter }: { filter: string }) {
  const messages: Record<string, string> = {
    all: "No hay eventos registrados",
    pending: "No hay eventos pendientes",
    week: "No hay eventos esta semana",
    both: "No hay eventos pendientes esta semana",
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-4">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-medium">{messages[filter] || messages.all}</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Los eventos aparecerán aquí cuando se registren
      </p>
    </div>
  );
}

export function EventsList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { events, loading, error } = useEvents();

  const filter = searchParams.get("filter") || "all";
  const search = searchParams.get("search") || "";

  const setFilter = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("filter");
    } else {
      params.set("filter", value);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const setSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const filteredEvents = React.useMemo(() => {
    let result = filterEventsByStatus(events, filter);

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (event) =>
          event.name.toLowerCase().includes(searchLower) ||
          event.description.toLowerCase().includes(searchLower) ||
          event.place?.toLowerCase().includes(searchLower)
      );
    }

    return result;
  }, [events, filter, search]);

  const exportToCSV = () => {
    if (filteredEvents.length === 0) {
      toast.error("No hay eventos para exportar");
      return;
    }

    const csvData = filteredEvents.map((event) => ({
      Nombre: event.name,
      Descripcion: event.description,
      "Fecha Planeada": format(event.plannedDate.toDate(), "dd/MM/yyyy", {
        locale: es,
      }),
      Horario: event.schedule || "",
      Lugar: event.place || "",
      Estado: event.status,
      "Enviado Por": event.submittedBy,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `eventos-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();

    toast.success("Archivo CSV descargado");
  };

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="pending">Pendientes</TabsTrigger>
            <TabsTrigger value="week">Esta Semana</TabsTrigger>
            <TabsTrigger value="both">Ambos</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-64 sm:flex-none">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar eventos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={exportToCSV}
            title="Exportar a CSV"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <EventsSkeleton />
      ) : filteredEvents.length === 0 ? (
        <EmptyState filter={filter} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
