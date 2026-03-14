"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { auth, db, doc, getDoc, signInWithEmailAndPassword } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AppUser } from "@/lib/types";

const ROLE_REDIRECTS: Record<string, string> = {
  superadmin: "/superadmin",
  admin: "/events",
  manager: "/submit",
};

export default function LoginPage() {
  const router = useRouter();
  const [cedula, setCedula] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cedula || !password) return;
    setLoading(true);

    try {
      const email = `${cedula}@univalle.edu.co`;
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, "users", credential.user.uid));

      if (!userDoc.exists()) {
        toast.error("Usuario no encontrado en el sistema");
        setLoading(false);
        return;
      }

      const userData = userDoc.data() as AppUser;
      const redirect = ROLE_REDIRECTS[userData.role] ?? "/login";
      router.push(redirect);
    } catch {
      toast.error("Cédula o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sidebar">
            <span className="text-2xl font-bold text-white">UV</span>
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold">Bienestar Univalle</h1>
            <p className="text-sm text-muted-foreground">Comunicaciones</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Iniciar sesión</CardTitle>
            <CardDescription>Ingresa tu cédula y contraseña</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cedula">Cédula</Label>
                <Input
                  id="cedula"
                  placeholder="Número de cédula"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  autoComplete="username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Ingresando..." : "Ingresar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
