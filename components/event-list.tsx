"use client";

import * as React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Download, Search, MoreVertical, Check, X,
  Calendar, Clock, MapPin, User, Building2, Image as ImageIcon,
  MessageSquare, CheckCircle, XCircle,
} from "lucide-react";
import Papa from "papaparse";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/status-badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useEvents, filterEventsByStatus } from "@/hooks/use-events";
import { updateEventStatus, addComment } from "@/lib/actions";
import { useAuth } from "@/lib/auth-context";
import type { Event } from "@/lib/types";

// ── Event Detail Sheet ────────────────────────────────────────────────────

function EventDetailSheet({ event, open, onOpenChange }: {
  event: Event; open: boolean; onOpenChange: (v: boolean) => void;
}) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  const [commentOpen, setCommentOpen] = React.useState(false);
  const [rejectOpen, setRejectOpen] = React.useState(false);
  const [comment, setComment] = React.useState("");
  const [rejectionReason, setRejectionReason] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const plannedDate = event.plannedDate.toDate();
  const borderColor = event.managerColor ?? "#6b7280";

  const handleMarkCompleted = async () => {
    setSubmitting(true);
    const result = await updateEventStatus(event.id, "completed", user?.name ?? "Admin");
    setSubmitting(false);
    if (result.success) { toast.success("Evento marcado como realizado"); onOpenChange(false); }
    else toast.error(result.error);
  };

  const handleAddComment = async () => {
    if (!comment.trim()) { toast.error("Escribe un comentario"); return; }
    setSubmitting(true);
    const result = await addComment(event.id, comment, user?.name ?? "Admin");
    setSubmitting(false);
    if (result.success) { toast.success("Comentario enviado"); setComment(""); setCommentOpen(false); }
    else toast.error(result.error);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) { toast.error("Indica el motivo del rechazo"); return; }
    setSubmitting(true);
    const result = await updateEventStatus(event.id, "rejected", user?.name ?? "Admin", rejectionReason);
    setSubmitting(false);
    if (result.success) { toast.success("Evento rechazado"); setRejectionReason(""); setRejectOpen(false); onOpenChange(false); }
    else toast.error(result.error);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="pb-4">
            <div className="flex items-start gap-3">
              <div className="h-1 w-8 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: borderColor }} />
              <div className="space-y-1">
                <SheetTitle className="text-left">{event.name}</SheetTitle>
                <StatusBadge status={event.status} />
              </div>
            </div>
          </SheetHeader>

          <div className="space-y-5">
            {/* Image */}
            {event.imageUrl && (
              <div className="relative overflow-hidden rounded-lg border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={event.imageUrl} alt={event.name} className="w-full object-cover max-h-56" />
                <a
                  href={event.imageUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md bg-black/60 text-white hover:bg-black/80"
                  title="Descargar imagen"
                >
                  <Download className="h-4 w-4" />
                </a>
              </div>
            )}

            {/* Description */}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Descripción</p>
              <p className="text-sm">{event.description}</p>
            </div>

            <Separator />

            {/* Details */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>{format(plannedDate, "d 'de' MMMM, yyyy", { locale: es })}</span>
              </div>
              {event.schedule && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span>{event.schedule}</span>
                </div>
              )}
              {event.place && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span>{event.place}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span style={{ color: borderColor }} className="font-medium">{event.submittedByName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>{event.submittedByArea}</span>
              </div>
            </div>

            {event.status === "rejected" && event.rejectionReason && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                <strong>Motivo del rechazo:</strong> {event.rejectionReason}
              </div>
            )}

            {/* Admin actions */}
            {isAdmin && (
              <>
                <Separator />
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => setCommentOpen(true)}
                  >
                    <MessageSquare className="h-4 w-4" /> Comentar
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    disabled={event.status === "completed" || submitting}
                    onClick={handleMarkCompleted}
                  >
                    <CheckCircle className="h-4 w-4 text-success" /> Marcar como realizado
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                    disabled={event.status === "rejected" || submitting}
                    onClick={() => setRejectOpen(true)}
                  >
                    <XCircle className="h-4 w-4" /> Rechazar
                  </Button>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Comment Dialog */}
      <Dialog open={commentOpen} onOpenChange={setCommentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar comentario</DialogTitle>
            <DialogDescription>Comentario para &quot;{event.name}&quot;</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="comment">Comentario</Label>
            <Textarea id="comment" placeholder="Escribe tu comentario..." value={comment} onChange={(e) => setComment(e.target.value)} rows={4} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCommentOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddComment} disabled={submitting}>{submitting ? "Enviando..." : "Enviar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar evento</DialogTitle>
            <DialogDescription>Motivo del rechazo para &quot;{event.name}&quot;</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rejection-reason">Motivo</Label>
            <Textarea id="rejection-reason" placeholder="Indica el motivo..." value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows={4} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleReject} disabled={submitting}>{submitting ? "Rechazando..." : "Rechazar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Table Row ─────────────────────────────────────────────────────────────

function EventRow({ event }: { event: Event }) {
  const [detailOpen, setDetailOpen] = React.useState(false);

  return (
    <>
      <tr className="border-b transition-colors hover:bg-muted/40">
        <td className="px-4 py-3 text-sm font-medium" style={{ color: event.managerColor ?? undefined }}>
          {event.submittedByName}
        </td>
        <td className="px-4 py-3 text-sm text-muted-foreground">{event.submittedByArea}</td>
        <td className="px-4 py-3 text-sm font-medium">{event.name}</td>
        <td className="px-4 py-3">
          <StatusBadge status={event.status} />
        </td>
        <td className="px-4 py-3 text-center">
          {event.imageUrl ? (
            <Check className="h-4 w-4 text-success mx-auto" />
          ) : (
            <X className="h-4 w-4 text-muted-foreground mx-auto" />
          )}
        </td>
        <td className="px-4 py-3 text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Acciones</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setDetailOpen(true)}>
                Ver completo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </td>
      </tr>

      <EventDetailSheet event={event} open={detailOpen} onOpenChange={setDetailOpen} />
    </>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

// ── Main List ─────────────────────────────────────────────────────────────

export function EventsList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { events, loading, error } = useEvents();

  const filter = searchParams.get("filter") || "all";
  const search = searchParams.get("search") || "";

  const setFilter = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    value === "all" ? params.delete("filter") : params.set("filter", value);
    router.push(`${pathname}?${params.toString()}`);
  };

  const setSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    value ? params.set("search", value) : params.delete("search");
    router.push(`${pathname}?${params.toString()}`);
  };

  const filteredEvents = React.useMemo(() => {
    let result = filterEventsByStatus(events, filter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) => e.name.toLowerCase().includes(q) ||
               e.submittedByName.toLowerCase().includes(q) ||
               e.submittedByArea.toLowerCase().includes(q)
      );
    }
    return result;
  }, [events, filter, search]);

  const exportToCSV = () => {
    if (filteredEvents.length === 0) { toast.error("No hay eventos para exportar"); return; }
    const csv = Papa.unparse(filteredEvents.map((e) => ({
      Persona: e.submittedByName,
      Area: e.submittedByArea,
      Evento: e.name,
      Estado: e.status,
      Fecha: format(e.plannedDate.toDate(), "dd/MM/yyyy", { locale: es }),
      Horario: e.schedule || "",
      Lugar: e.place || "",
      Imagen: e.imageUrl ? "Sí" : "No",
    })));
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `eventos-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    toast.success("CSV descargado");
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
      {/* Toolbar */}
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
            <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
          </div>
          <Button variant="outline" size="icon" onClick={exportToCSV} title="Exportar CSV">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton />
      ) : filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">No hay eventos registrados</p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Persona</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Área</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Evento</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Estado</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                    <ImageIcon className="h-4 w-4 mx-auto" />
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => (
                  <EventRow key={event.id} event={event} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
