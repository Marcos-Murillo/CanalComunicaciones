"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addDays, isBefore, startOfDay } from "date-fns";
import { toast } from "sonner";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DatePicker } from "@/components/date-picker";
import { useAuth } from "@/lib/auth-context";
import { createEvent, updateEvent } from "@/lib/actions";
import type { Event, EventFormData } from "@/lib/types";

const MIN_DAYS_AHEAD = 10;
const IMGBB_KEY = process.env.NEXT_PUBLIC_IMGBB_KEY ?? "";

async function uploadToImgBB(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Error al subir imagen");
  const json = await res.json();
  return json.data.url as string;
}

const eventFormSchema = z.object({
  name: z.string().min(1, "El nombre del evento es requerido"),
  description: z.string().min(1, "La descripcion es requerida"),
  plannedDate: z.date({ error: "La fecha planeada es requerida" }),
  schedule: z.string().optional(),
  place: z.string().optional(),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  event?: Event;
  onSuccess?: () => void;
}

export function EventForm({ event, onSuccess }: EventFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = React.useState(false);

  // Image state
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(event?.imageUrl ?? null);
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const minDate = addDays(startOfDay(new Date()), MIN_DAYS_AHEAD);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: event?.name || "",
      description: event?.description || "",
      plannedDate: event?.plannedDate?.toDate(),
      schedule: event?.schedule || "",
      place: event?.place || "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isDateDisabled = (date: Date) => isBefore(date, minDate);

  const onSubmit = async (data: EventFormValues) => {
    if (isBefore(data.plannedDate, minDate)) {
      toast.error("Minimo 10 dias de anticipacion");
      return;
    }

    setIsSubmitting(true);

    let imageUrl: string | undefined = event?.imageUrl;

    // Upload new image if selected
    if (imageFile) {
      setUploadingImage(true);
      try {
        imageUrl = await uploadToImgBB(imageFile);
      } catch {
        toast.error("No se pudo subir la imagen, intenta de nuevo");
        setIsSubmitting(false);
        setUploadingImage(false);
        return;
      }
      setUploadingImage(false);
    }

    const formData: EventFormData = {
      name: data.name,
      description: data.description,
      plannedDate: data.plannedDate,
      schedule: data.schedule || undefined,
      place: data.place || undefined,
      imageUrl,
    };

    let result;
    if (event) {
      result = await updateEvent(event.id, formData);
    } else {
      result = await createEvent(
        formData,
        user?.id ?? "",
        user?.name ?? "",
        user?.area ?? "",
        user?.color ?? "#6b7280"
      );
    }

    setIsSubmitting(false);

    if (result.success) {
      if (!event) {
        setShowSuccessAlert(true);
        form.reset();
        removeImage();
      } else {
        toast.success("Evento actualizado correctamente");
        onSuccess?.();
      }
    } else {
      toast.error(result.error || "Error al guardar el evento");
    }
  };

  return (
    <>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre del Evento <span className="text-destructive">*</span></Label>
          <Input id="name" placeholder="Ej: Concierto de Jazz" {...form.register("name")} />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripcion <span className="text-destructive">*</span></Label>
          <Textarea id="description" placeholder="Describe el evento..." rows={4} {...form.register("description")} />
          {form.formState.errors.description && (
            <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Fecha Planeada <span className="text-destructive">*</span></Label>
          <DatePicker
            date={form.watch("plannedDate")}
            onDateChange={(date) => form.setValue("plannedDate", date as Date, { shouldValidate: true })}
            disabled={isDateDisabled}
            placeholder="Seleccionar fecha (min. 10 dias)"
          />
          {form.formState.errors.plannedDate && (
            <p className="text-sm text-destructive">{form.formState.errors.plannedDate.message}</p>
          )}
          <p className="text-xs text-muted-foreground">Minimo 10 dias de anticipacion requeridos</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="schedule">Horario (opcional)</Label>
            <Input id="schedule" type="time" {...form.register("schedule")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="place">Lugar (opcional)</Label>
            <Input id="place" placeholder="Ej: Auditorio Principal" {...form.register("place")} />
          </div>
        </div>

        {/* Image upload */}
        <div className="space-y-2">
          <Label>Imagen (opcional)</Label>
          <p className="text-xs text-muted-foreground">Banner o publicación del evento</p>
          {imagePreview ? (
            <div className="relative w-full overflow-hidden rounded-lg border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="Vista previa" className="w-full max-h-48 object-cover" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-2 top-2 h-7 w-7"
                onClick={removeImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/30 p-6 text-muted-foreground transition-colors hover:border-muted-foreground/60 hover:text-foreground"
            >
              <ImagePlus className="h-8 w-8" />
              <span className="text-sm">Haz clic para subir una imagen</span>
              <span className="text-xs">PNG, JPG, WEBP</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-success hover:bg-success/90 text-success-foreground"
          disabled={isSubmitting || uploadingImage}
        >
          {uploadingImage ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Subiendo imagen...</>
          ) : isSubmitting ? (
            "Enviando..."
          ) : event ? (
            "Actualizar Evento"
          ) : (
            "Enviar Peticion"
          )}
        </Button>
      </form>

      <AlertDialog open={showSuccessAlert} onOpenChange={setShowSuccessAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Peticion enviada exitosamente</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>Tu peticion de evento ha sido registrada correctamente.</p>
                <p className="font-medium">Para publicar fotos o fichas graficas, envia los materiales a:</p>
                <p className="rounded-md bg-muted p-2 text-sm font-mono text-foreground">
                  comunicaciones.acultura@correounivalle.edu.co
                </p>
                <p className="text-sm text-muted-foreground">
                  Aunque hayas subido una imagen, para garantizar la mejor calidad es recomendable enviarla también al correo indicado.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Entendido</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface EditEventDialogProps {
  event: Event;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditEventDialog({ event, open, onOpenChange }: EditEventDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Evento</DialogTitle>
          <DialogDescription>Modifica los detalles de tu evento</DialogDescription>
        </DialogHeader>
        <EventForm event={event} onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
