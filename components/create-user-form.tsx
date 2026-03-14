"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { createUser } from "@/lib/actions";
import { useAuth } from "@/lib/auth-context";
import type { UserRole } from "@/lib/types";

const schema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  cedula: z.string().min(5, "Cédula requerida"),
  area: z.string().min(2, "Área requerida"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  role: z.enum(["admin", "manager"] as const),
});

type FormValues = z.infer<typeof schema>;

interface CreateUserFormProps {
  allowedRoles: UserRole[];
  defaultRole?: UserRole;
  onSuccess?: () => void;
}

export function CreateUserForm({ allowedRoles, defaultRole, onSuccess }: CreateUserFormProps) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: (defaultRole ?? allowedRoles[0]) as "admin" | "manager" },
  });

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    const result = await createUser({ ...data, createdBy: user?.id ?? "" });
    setSubmitting(false);

    if (result.success) {
      toast.success("Usuario creado correctamente");
      form.reset({ role: (defaultRole ?? allowedRoles[0]) as "admin" | "manager" });
      onSuccess?.();
    } else {
      toast.error(result.error ?? "Error al crear usuario");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre completo</Label>
          <Input id="name" placeholder="Nombre y apellido" {...form.register("name")} />
          {form.formState.errors.name && (
            <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="cedula">Cédula</Label>
          <Input id="cedula" placeholder="Número de cédula" {...form.register("cedula")} />
          {form.formState.errors.cedula && (
            <p className="text-xs text-destructive">{form.formState.errors.cedula.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="area">Área</Label>
        <Input id="area" placeholder="Área a la que pertenece" {...form.register("area")} />
        {form.formState.errors.area && (
          <p className="text-xs text-destructive">{form.formState.errors.area.message}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input id="password" type="password" placeholder="Mínimo 6 caracteres" {...form.register("password")} />
          {form.formState.errors.password && (
            <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
          )}
        </div>

        {allowedRoles.length > 1 && (
          <div className="space-y-2">
            <Label>Rol</Label>
            <Select
              value={form.watch("role")}
              onValueChange={(v) => form.setValue("role", v as "admin" | "manager")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent>
                {allowedRoles.includes("admin") && <SelectItem value="admin">Admin</SelectItem>}
                {allowedRoles.includes("manager") && <SelectItem value="manager">Manager</SelectItem>}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Creando..." : "Crear usuario"}
      </Button>
    </form>
  );
}
