"use client";

import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar, Clock, MapPin, MoreVertical,
  MessageSquare, CheckCircle, XCircle, User, Building2, Download,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/status-badge";
import { updateEventStatus, addComment } from "@/lib/actions";
import { useAuth } from "@/lib/auth-context";
import type { Event } from "@/lib/types";

export function EventCard({ event }: { event: Event }) {
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
    if (result.success) toast.success("Evento marcado como realizado");
    else toast.error(result.error);
  };

  const handleAddComment = async () => {
    if (!comment.trim()) { toast.error("Escribe un comentario"); return; }
    setSubmitting(true);
    const result = await addComment(event.id, comment, user?.name ?? "Admin");
    setSubmitting(false);
    if (result.success) {
      toast.success("Comentario enviado");
      setComment("");
      setCommentOpen(false);
    } else toast.error(result.error);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) { toast.error("Indica el motivo del rechazo"); return; }
    setSubmitting(true);
    const result = await updateEventStatus(event.id, "rejected", user?.name ?? "Admin", rejectionReason);
    setSubmitting(false);
    if (result.success) {
      toast.success("Evento rechazado");
      setRejectionReason("");
      setRejectOpen(false);
    } else toast.error(result.error);
  };

  return (
    <>
      <Card
        className="group transition-shadow hover:shadow-md overflow-hidden"
        style={{ borderTop: `4px solid ${borderColor}` }}
      >
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <h3 className="font-semibold leading-tight">{event.name}</h3>
            <StatusBadge status={event.status} />
          </div>
          {isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost" size="icon"
                  className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Acciones</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setCommentOpen(true)}>
                  <MessageSquare className="mr-2 h-4 w-4" /> Comentar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleMarkCompleted}
                  disabled={event.status === "completed" || submitting}
                >
                  <CheckCircle className="mr-2 h-4 w-4 text-success" /> Marcar Realizado
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setRejectOpen(true)}
                  disabled={event.status === "rejected" || submitting}
                  className="text-destructive focus:text-destructive"
                >
                  <XCircle className="mr-2 h-4 w-4" /> Rechazar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </CardHeader>

        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>

          {/* Event image */}
          {event.imageUrl && (
            <div className="relative overflow-hidden rounded-md border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={event.imageUrl} alt={event.name} className="w-full max-h-40 object-cover" />
              {isAdmin && (
                <a
                  href={event.imageUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md bg-black/60 text-white transition-colors hover:bg-black/80"
                  title="Descargar imagen"
                >
                  <Download className="h-4 w-4" />
                </a>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>{format(plannedDate, "d 'de' MMMM, yyyy", { locale: es })}</span>
            </div>
            {event.schedule && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{event.schedule}</span>
              </div>
            )}
            {event.place && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                <span>{event.place}</span>
              </div>
            )}
          </div>

          {/* Manager info */}
          <div className="flex flex-wrap gap-3 border-t pt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              <span
                className="font-medium"
                style={{ color: borderColor }}
              >
                {event.submittedByName}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              <span>{event.submittedByArea}</span>
            </div>
          </div>

          {event.status === "rejected" && event.rejectionReason && (
            <div className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">
              <strong>Motivo del rechazo:</strong> {event.rejectionReason}
            </div>
          )}
        </CardContent>
      </Card>

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
            <Button onClick={handleAddComment} disabled={submitting}>
              {submitting ? "Enviando..." : "Enviar"}
            </Button>
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
            <Button variant="destructive" onClick={handleReject} disabled={submitting}>
              {submitting ? "Rechazando..." : "Rechazar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
