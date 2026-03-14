"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateUserForm } from "@/components/create-user-form";
import { useUsers } from "@/hooks/use-users";

function UserRow({ name, cedula, area, role, color }: {
  name: string; cedula: string; area: string; role: string; color?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-card p-3">
      <div className="flex items-center gap-3">
        {color && (
          <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
        )}
        <div>
          <p className="text-sm font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">{area} · {cedula}</p>
        </div>
      </div>
      <Badge variant="secondary" className="capitalize">{role}</Badge>
    </div>
  );
}

export default function SuperAdminUsersPage() {
  const { users, loading } = useUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Usuarios</h1>
        <p className="text-muted-foreground">Crea y gestiona todos los usuarios del sistema</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Crear usuario</CardTitle>
            <CardDescription>Asigna rol de admin o manager</CardDescription>
          </CardHeader>
          <CardContent>
            <CreateUserForm allowedRoles={["admin", "manager"]} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usuarios registrados</CardTitle>
            <CardDescription>{users.length} usuario(s) en el sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)
            ) : users.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Sin usuarios aún</p>
            ) : (
              users.map((u) => (
                <UserRow key={u.id} name={u.name} cedula={u.cedula} area={u.area} role={u.role} color={u.color} />
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
