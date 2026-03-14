"use client";

import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, Clock, MapPin, Pencil, Bell } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StatusBadge } from "@/components/status-badge";
import { EditEventDialog } from "@/components/events-form";
import { DateRangePicker } from "@/components/date-picker";
import { useAuth } from "@/lib/auth-context";
import { useNotifications } from "@/hooks/use-notifications";
import { markNotificationsRead } from "@/lib/actions";
import {
  useMyEvents,
  filterEventsByStatus,
  filterEventsByDateRange,
  canEditEvent,
} from "@/hooks/use-events";
import type { Event, Notification } from "@/lib/types";

function MyEventsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-lg border bg-card p-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-8 w-8" />
        </div>
      ))}
    </div>
  );
}

function EmptyMyEvents({ filter }: { filter: string }) {
  const messages: Record<string, string> = {
    todo: "No tienes peticiones por realizar",
    completed: "No tienes peticiones realizadas",
    all: "No has enviado peticiones aun",
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="rounded-full bg-muted p-3">
        <Calendar className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-3 text-sm font-medium">{messages[filter] || messages.all}</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Enviar una peticion usando el formulario de arriba
      </p>
    </div>
  );
}

function MyEventCard({ event, notifications }: { event: Event; notifications: Notification[] }) {
  const [editOpen, setEditOpen] = React.useState(false);
  const [showNotifs, setShowNotifs] = React.useState(false);
  const canEdit = canEditEvent(event);
  const plannedDate = event.plannedDate.toDate();

  const eventNotifs = notifications.filter((n) => n.eventId === event.id);
  const unread = eventNotifs.filter((n) => !n.read);

  const handleShowNotifs = async () => {
    setShowNotifs((v) => !v);
    if (unread.length > 0) {
      await markNotificationsRead(unread.map((n) => n.id));
    }
  };

  return (
    <>
      <Card className="transition-shadow hover:shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium leading-tight">{event.name}</h4>
              {unread.length > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                  {unread.length}
                </span>
              )}
            </div>
            <StatusBadge status={event.status} />
          </div>
          <div className="flex items-center gap-1">
            {eventNotifs.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 relative"
                onClick={handleShowNotifs}
                title="Ver notificaciones"
              >
                <Bell className="h-4 w-4" />
                {unread.length > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-destructive" />
                )}
              </Button>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={!canEdit}
                      onClick={() => setEditOpen(true)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                  </span>
                </TooltipTrigger>
                {!canEdit && (
                  <TooltipContent>
                    <p>Solo se puede editar si faltan mas de 10 dias</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {event.description}
          </p>

          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{format(plannedDate, "d MMM yyyy", { locale: es })}</span>
            </div>
            {event.schedule && (
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{event.schedule}</span>
              </div>
            )}
            {event.place && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                <span>{event.place}</span>
              </div>
            )}
          </div>

          {/* Notificaciones expandibles */}
          {showNotifs && eventNotifs.length > 0 && (
            <div className="space-y-1 rounded-md border bg-muted/40 p-2">
              {eventNotifs.map((n) => (
                <div key={n.id} className="text-xs text-foreground leading-snug py-1 border-b last:border-0">
                  {n.message}
                </div>
              ))}
            </div>
          )}

          {event.status === "rejected" && event.rejectionReason && (
            <div className="rounded bg-destructive/10 p-2 text-xs text-destructive">
              <strong>Motivo:</strong> {event.rejectionReason}
            </div>
          )}
        </CardContent>
      </Card>

      <EditEventDialog event={event} open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}

export function MyEventsList() {
  const { user } = useAuth();
  const { events, loading, error } = useMyEvents(user?.id);
  const { notifications } = useNotifications(user?.id);
  const [filter, setFilter] = React.useState("all");
  const [startDate, setStartDate] = React.useState<Date | undefined>();
  const [endDate, setEndDate] = React.useState<Date | undefined>();

  const filteredEvents = React.useMemo(() => {
    let result = filterEventsByStatus(events, filter);
    result = filterEventsByDateRange(result, startDate, endDate);
    return result;
  }, [events, filter, startDate, endDate]);

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-center text-sm text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="h-9">
            <TabsTrigger value="all" className="text-xs">
              Todas
            </TabsTrigger>
            <TabsTrigger value="todo" className="text-xs">
              Por Realizar
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-xs">
              Realizadas
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          className="sm:max-w-sm"
        />
      </div>

      {loading ? (
        <MyEventsSkeleton />
      ) : filteredEvents.length === 0 ? (
        <EmptyMyEvents filter={filter} />
      ) : (
        <div className="space-y-3">
          {filteredEvents.map((event) => (
            <MyEventCard key={event.id} event={event} notifications={notifications} />
          ))}
        </div>
      )}
    </div>
  );
}
