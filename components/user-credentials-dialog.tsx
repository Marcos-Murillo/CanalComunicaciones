"use client";

import * as React from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface UserCredentialsDialogProps {
  name: string;
  cedula: string;
  password?: string;
}

export function UserCredentialsDialog({ name, cedula, password }: UserCredentialsDialogProps) {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <Dialog onOpenChange={() => setShowPassword(false)}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Ver credenciales">
          <KeyRound className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>Credenciales de {name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Cédula (usuario)</p>
            <p className="rounded-md border bg-muted px-3 py-2 text-sm font-mono">{cedula}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Contraseña</p>
            <div className="flex items-center gap-2">
              <p className="flex-1 rounded-md border bg-muted px-3 py-2 text-sm font-mono">
                {showPassword ? (password ?? "—") : "••••••••"}
              </p>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPassword((v) => !v)}
                title={showPassword ? "Ocultar" : "Mostrar"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
