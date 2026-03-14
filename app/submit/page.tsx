"use client";

import { AppShell } from "@/components/app-shell";
import { EventForm } from "@/components/events-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";

export default function SubmitPage() {
  const { user } = useAuth();

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Bienvenido{user?.name ? `, ${user.name}` : ""}
          </h1>
          <p className="text-muted-foreground">
            Completa el formulario para solicitar un nuevo evento cultural
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Nueva Petición de Evento</CardTitle>
            <CardDescription>
              Se requiere un mínimo de 10 días de anticipación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EventForm />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
