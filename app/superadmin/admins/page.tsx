"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateUserForm } from "@/components/create-user-form";
import { useUsers } from "@/hooks/use-users";

export default function SuperAdminAdminsPage() {
  const { users, loading } = useUsers("admin");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Administradores</h1>
        <p className="text-muted-foreground">Gestiona los administradores del sistema</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Crear administrador</CardTitle>
            <CardDescription>El admin puede gestionar eventos y managers</CardDescription>
          </CardHeader>
          <CardContent>
            <CreateUserForm allowedRoles={["admin"]} defaultRole="admin" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Administradores registrados</CardTitle>
            <CardDescription>{users.length} admin(s)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)
            ) : users.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Sin administradores aún</p>
            ) : (
              users.map((u) => (
                <div key={u.id} className="flex items-center justify-between rounded-lg border bg-card p-3">
                  <div>
                    <p className="text-sm font-medium">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.area} · {u.cedula}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
