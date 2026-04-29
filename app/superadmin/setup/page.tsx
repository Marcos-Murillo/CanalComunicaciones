"use client";

import * as React from "react";
import { seedSuperAdmin } from "@/lib/seed-superadmin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SuperAdminSetupPage() {
  const [status, setStatus] = React.useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = React.useState("");

  const handleSeed = async () => {
    setStatus("loading");
    const result = await seedSuperAdmin();
    if (result.success) {
      setStatus("done");
      setMessage("Superadmin creado. Ya puedes ir a /login");
    } else {
      setStatus("error");
      setMessage("Error al crear superadmin (puede que ya exista)");
    }
  };

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Setup inicial</CardTitle>
          <CardDescription>Crea el superadmin del sistema. Solo ejecutar una vez.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleSeed} disabled={status === "loading" || status === "done"} className="w-full">
            {status === "loading" ? "Creando..." : "Crear Superadmin"}
          </Button>
          {message && (
            <p className={`text-sm text-center ${status === "done" ? "text-green-600" : "text-destructive"}`}>
              {message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
